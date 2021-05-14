import {IRequestService} from "../RequestService/request.service";
import {IConfigService} from "../ConfigService/config.service";
import {ISpread} from "../../interfaces/spread/spread.interface";
import {IPlatformService} from "../PlatformService/platform.service";
import {IUserService} from "../UserService/user.service";
import { Spread } from "../../models/spread/spread.model";
import {IUser} from "../../interfaces/user/user.interface";
import {IBotService} from "../BotService/bot.service";
import {User} from "../../models/user/user.model";
import * as cron from "node-cron";


export interface ISpreadService {
   compareSpreads (): Promise<void>;
   addSpreads (tgUserId: string, coinAddress: string, spreadChange: number): Promise<Array<ISpread> | null>;
   editSpreads (tgUserId: string, coinAddress: string, spreadChange: string): Promise<Array<ISpread> | null>;
}

export class SpreadService implements ISpreadService {

    private readonly COINlIST_DATA_API_URL: string = `https://api.coingecko.com/api/v3/coins/list?include_platform=true`;
    private readonly COIN_DATA_API_URL: string = `https://api.coingecko.com/api/v3/coins/`;


    constructor(
        private readonly configService: IConfigService,
        private readonly requestService: IRequestService,
        private readonly platformService: IPlatformService,
        private readonly  userService: IUserService,
        private readonly botService: IBotService,
    ) {}

    public async  addSpreads(tgUserId: string, coinAddress: string, spreadChange: number): Promise<Array<ISpread> | null> {
        const user: IUser = await this.userService.getUserByTgId(tgUserId);
        if (!user) return null;
        const coinsList: any = await this.requestService.get(this.COINlIST_DATA_API_URL);
        const supportedPlatforms: Array<string> = this.platformService.get();
        let coinFromList = coinsList.data.find(({ platforms }) => platforms.ethereum === coinAddress.toLowerCase())

        const coinData: any = await this.requestService.get(this. COIN_DATA_API_URL + coinFromList.id);
        let spreads: Array<ISpread> = [];

        for (let i = 0; i < supportedPlatforms.length; i++) {
            const platformSpread = coinData.data.tickers.find(({market}) => supportedPlatforms[i] === market.identifier);
            if(platformSpread) {
                const oldSpread = await Spread.findOne({
                    coinAddress,
                    platform: supportedPlatforms[i],
                    owner: user._id
                })
                if(!oldSpread) {
                    const spread: ISpread = new Spread({
                        coinAddress,
                        platform: supportedPlatforms[i],
                        spreadValue: platformSpread.bid_ask_spread_percentage,
                        spreadChange,
                        coinUsdValue: platformSpread.converted_last.usd,
                        owner: user._id
                    })

                    spreads.push(spread)
                    await spread.save()
                }
            }
        }
        return spreads;
    }

    public async editSpreads(tgUserId: string, coinAddress: string, spreadChange: string): Promise<Array<ISpread> | null> {
        const addressTemplate = /^0x[a-fA-F0-9]{40}$/;
        const percentageTemplate = /^[0-9]*[.,]?[0-9]+$/;
        if (!percentageTemplate.test(spreadChange)) return null;
        if (!addressTemplate.test(coinAddress)) return null;

        const user: IUser = await this.userService.getUserByTgId(tgUserId);
        if (!user) return null;
        const spreads = await Spread.find({ owner: user._id, coinAddress });
        if (spreads.length === 0) return null;
        for (let i = 0; i < spreads.length; i++) {
            spreads[i].spreadChange = parseFloat(spreadChange);
            await spreads[i].save();
        }
        return spreads;
    }

    public async compareSpreads(): Promise<void> {
        cron.schedule("5 * * * * *", async () => {
            console.log('from compare spreads')

            const coinList: any = await this.requestService.get(this.COINlIST_DATA_API_URL);
            console.log('after request')

            const spreads: Array<ISpread> = await Spread.find();

            for (let i = 0; i < spreads.length; i++) {
                if (!(spreads[i].platform === "uniswap")) {
                    const uniswapSpread = await Spread.findOne({
                        owner: spreads[i].owner,
                        coinAddress: spreads[i].coinAddress,
                        platform: "uniswap"
                    })
                    const coin = coinList.data.find(({platforms}) => platforms.ethereum === spreads[i].coinAddress.toLowerCase());
                    const coinData: any = await this.requestService.get(this.COIN_DATA_API_URL + coin.id);
                    const platformMarket = coinData.data.tickers.find(({market}) => spreads[i].platform === market.identifier);
                    const uniswapMarket = coinData.data.tickers.find(({market}) => market.identifier === "uniswap");
                    if (!(!platformMarket || (spreads[i].coinUsdValue === platformMarket.converted_last.usd && uniswapSpread.coinUsdValue === uniswapMarket.converted_last.usd))) {

                        if (((Math.abs(uniswapMarket.converted_last.usd - platformMarket.converted_last.usd) / uniswapMarket.converted_last.usd) * 100) >= spreads[i].spreadChange) {
                            spreads[i].coinUsdValue = platformMarket.converted_last.usd;
                            uniswapSpread.coinUsdValue = uniswapMarket.converted_last.usd;
                            await uniswapSpread.save();
                            await spreads[i].save();

                            const user: IUser = await User.findOne({_id: spreads[i].owner});
                            this.botService.sendMessage(user.tg_chat_id, `❗️❗️${coinData.data.symbol}: ${uniswapMarket.market.identifier} (${uniswapMarket.converted_last.usd}$) ➡️ ${platformMarket.market.identifier} (${platformMarket.converted_last.usd}$) ❗️❗️ \n spread: ${Math.abs(uniswapMarket.converted_last.usd - platformMarket.converted_last.usd)}$`);
                        }
                    }
                }
            }
        });
    }
}