import {SUPPORTED_POOLS} from "./pool.service.constants";
import {IRequestService} from "../RequestService/request.service";
import {IConfigService} from "../ConfigService/config.service";
import {IPool} from "../../interfaces/pool/pool.interface";
import {IUserService} from "../UserService/user.service";
import {IUser} from "../../interfaces/user/user.interface";
import { ChainId, Fetcher, WETH, Route, Token } from "@uniswap/sdk";
import { Pool } from "../../models/pool/pool.model";
import {IBotService} from "../BotService/bot.service";
import {User} from "../../models/user/user.model";
import * as cron from "node-cron";


export interface IPoolService {
    getPoolAssets(): Promise<unknown[]>;
    addPool(tgUserId: string, poolAddress: string, assetChange: string): Promise<IPool | null>;
    comparePools(): Promise<void>;
    editPool(tgUserId: string, poolAddress: string, assetChange: string): Promise<IPool | null>;
}

export class PoolService implements IPoolService {
    private readonly POOL_DATA_API_URL: string = `https://data-api.defipulse.com/api/v1/blocklytics/pools/v1/exchanges`;
    private readonly ETH_PRICE_API_URL: string = `https://api.etherscan.io/api?module=stats&action=ethprice`;
    private readonly COINlIST_DATA_API_URL: string = `https://api.coingecko.com/api/v3/coins/list?include_platform=true`;

    constructor(
        private readonly configService: IConfigService,
        private readonly requestService: IRequestService,
        private readonly userService: IUserService,
        private readonly botService: IBotService,
    ) {}

    public async getPoolAssets(): Promise<unknown[]> {
        const supportedPoolExchanges: string[] = this.getSupportedPoolExchanges();

        const poolsApiKey: string = this.configService.get<string>('POOLS_API_KEY');
        const pools: any = await this.requestService.get(`${this.POOL_DATA_API_URL}?api-key=${poolsApiKey}`);

        const assets: unknown[] = [];
        for (const supportedPoolExchange of supportedPoolExchanges) {
            const pool: any = pools.data.results.find(pool => pool.exchange === supportedPoolExchange);
            assets.push(...pool.assets);
        }

        return assets;
    }

    public async editPool(tgUserId: string, poolAddress: string, assetChange: string): Promise<IPool | null> {
        const addressTemplate = /^0x[a-fA-F0-9]{40}$/;
        const percentageTemplate = /^[0-9]*[.,]?[0-9]+$/;
        if (!percentageTemplate.test(assetChange)) return null;
        if (!addressTemplate.test(poolAddress)) return null;

        const user: IUser = await this.userService.getUserByTgId(tgUserId);
        if (!user) return null;
        const pool: IPool = await Pool.findOne({
            owner: user._id,
            poolAddress,
        })
        if(!pool) return null;
        pool.assetChange = parseFloat(assetChange);
        await pool.save();
        return pool;
    }

    public async addPool(tgUserId: string, poolAddress: string, assetChange: string): Promise<IPool | null> {
        const addressTemplate = /^0x[a-fA-F0-9]{40}$/;
        const percentageTemplate = /^[0-9]*[.,]?[0-9]+$/;
        if (!percentageTemplate.test(assetChange)) return null;
        if (!addressTemplate.test(poolAddress)) return null;


        const user: IUser = await this.userService.getUserByTgId(tgUserId);
        if (!user) return null;

        const usersPool: IPool = await Pool.findOne({
            owner: user._id,
            poolAddress
        })

        if (usersPool) return null;

        const supportedPoolExchanges: string[] = this.getSupportedPoolExchanges();

        const poolInSupported: boolean = supportedPoolExchanges.includes(poolAddress);
        if (!poolInSupported) return null;

        const poolsApiKey: string = this.configService.get<string>('POOLS_API_KEY');
        const ethPriceKey: string  =this.configService.get<string>('ETHERSCAN_KEY');
        const pools: any = await this.requestService.get(`${this.POOL_DATA_API_URL}?api-key=${poolsApiKey}`);

        const pool = pools.data.results.find(({exchange}) => exchange === poolAddress.toLowerCase());
        if (!pool) return null;

        const ethPrice: any = await this.requestService.get(this.ETH_PRICE_API_URL + `&apikey=` + ethPriceKey);

        let  tokenCourse: Array<[string, number]> = [];

        for (let i = 0; i < pool.assets.length; i++) {
            if (pool.assets[i].address === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") {
                tokenCourse.push([
                    pool.assets[i].address,
                    parseFloat(ethPrice.data.result.ethusd),
                ]);
            } else {
                const assetToken = new Token(
                    ChainId.MAINNET,
                    pool.assets[i].address,
                    18
                );
                const assetPair = await Fetcher.fetchPairData(
                    assetToken,
                    WETH[assetToken.chainId]
                );
                const assetRoute: any = new Route(
                    [assetPair],
                    WETH[assetToken.chainId]
                );

                const assetUsd =
                    ethPrice.data.result.ethusd /
                    assetRoute.midPrice.toSignificant(6);
                tokenCourse.push([pool.assets[i].address, assetUsd]);
            }
        }
        const floatAssetChange = parseFloat(assetChange);
        const poolToSave: IPool = new Pool({
            poolAddress,
            assetChange: floatAssetChange,
            usdLiquidity: pool.usdLiquidity,
            tokenCourse,
            owner: user._id
        })

        await poolToSave.save();
        return poolToSave;
    }

    public async comparePools(): Promise<void> {
        cron.schedule("10 * * * * *", async () => {

            
            const ethPriceKey: string = this.configService.get<string>('ETHERSCAN_KEY');
            const ethPrice: any = await this.requestService.get(this.ETH_PRICE_API_URL + `&apikey=` + ethPriceKey);
            const coinList: any = await this.requestService.get(this.COINlIST_DATA_API_URL);

            let pools: Array<IPool> = await Pool.find();

            for (let i = 0; i < pools.length; i++) {
                const user: IUser = await User.findOne({_id: pools[i].owner});
                for (let j = 0; j < pools[i].tokenCourse.length; j++) {
                    const coinFromList = coinList.data.find(
                        ({platforms}) => platforms.ethereum === pools[i].tokenCourse[j][0].toLowerCase()
                    );
                    if (pools[i].tokenCourse[j][0] === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") {
                        if (((Math.abs(pools[i].tokenCourse[j][1] - parseFloat(ethPrice.data.result.ethusd))) / pools[i].tokenCourse[j][1]) >= pools[i].assetChange) {
                            if ((pools[i].tokenCourse[j][1] - parseFloat(ethPrice.data.result.ethusd)) > 0) {
                                pools[i].tokenCourse[j][1] = parseFloat(ethPrice.data.result.ethusd);
                                await pools[i].save();
                                await this.botService.sendMessage(user.tg_chat_id, `🔻️🔻️ ${coinFromList.id} is ${pools[i].tokenCourse[j][1]}$`);
                            } else {
                                pools[i].tokenCourse[j][1] = parseFloat(ethPrice.data.result.ethusd);
                                await pools[i].save();
                                await this.botService.sendMessage(user.tg_chat_id, `🚀🚀 ${coinFromList.id} is ${pools[i].tokenCourse[j][1]}$`);
                            }
                        }
                    } else {
                        const assetToken = new Token(
                            ChainId.MAINNET,
                            pools[i].tokenCourse[j][0],
                            18
                        );
                        const assetPair = await Fetcher.fetchPairData(
                            assetToken,
                            WETH[assetToken.chainId]
                        );
                        const assetRoute: any = new Route(
                            [assetPair],
                            WETH[assetToken.chainId]
                        );

                        const assetUsd =
                            ethPrice.data.result.ethusd /
                            assetRoute.midPrice.toSignificant(6);
                        if (((Math.abs(pools[i].tokenCourse[j][1] - assetUsd)) / pools[i].tokenCourse[j][1]) >= pools[i].assetChange) {
                            if ((pools[i].tokenCourse[j][1] - assetUsd) > 0) {
                                pools[i].tokenCourse[j][1] = assetUsd;
                                await pools[i].save();
                                await this.botService.sendMessage(user.tg_chat_id, `🔻️🔻️ ${coinFromList.id} is ${pools[i].tokenCourse[j][1]}$`);
                            } else {
                                pools[i].tokenCourse[j][1] = assetUsd;
                                await pools[i].save();
                                await this.botService.sendMessage(user.tg_chat_id, `🚀🚀 ${coinFromList.id} is ${pools[i].tokenCourse[j][1]}$`);
                            }
                        }
                    }
                }
            }
        });
    }





    private getSupportedPoolExchanges(): string[] {
        return SUPPORTED_POOLS;
    }
}
