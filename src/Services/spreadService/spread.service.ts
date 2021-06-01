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
import {ILoggerService} from "../LoggerService/logger.service";
import {ChainId, Fetcher, WETH, Route, Token, Pair} from "@uniswap/sdk";
import sushidata from '@sushiswap/sushi-data';
import * as ccxt from "ccxt";
import {ICoinService} from "../CoinService/coin.service";
import {parse} from "dotenv";

export interface ISpreadService {
   compareSpreads (): Promise<void>;
   addSpreads (tgUserId: string, coinAddress: string, spreadChange: number): Promise<Array<ISpread> | null>;
   editSpreads (tgUserId: string, coinAddress: string, spreadChange: string): Promise<Array<ISpread> | null>;
}

export class SpreadService implements ISpreadService {

    private readonly COINlIST_DATA_API_URL: string = `https://api.coingecko.com/api/v3/coins/list?include_platform=true`;
    private readonly COIN_DATA_API_URL: string = `https://api.coingecko.com/api/v3/coins/`;
    private readonly ETHER_PRICE_DATA_API_URL: string = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=`;
    private readonly GATE_PAIRS_DATA_API_URL: string = `https://data.gateapi.io/api2/1/pairs`;
    private readonly GATE_PAIR_DATA_API_URL: string = `https://data.gateapi.io/api2/1/ticker/`;
    private readonly BIBOX_PAIR_DATA_API_URL: string = `https://api.bibox.com/v3/mdata/ticker?pair=`;
    private readonly BITRUE_TICKER_DATA_API_URL: string = `https://www.bitrue.com/api/v1/ticker/24hr`;
    private readonly HOTBIT_MARKET_DATA_API_URL: string = `https://api.hotbit.io/api/v1/market.last?market=`

    constructor(
        private readonly configService: IConfigService,
        private readonly requestService: IRequestService,
        private readonly platformService: IPlatformService,
        private readonly  userService: IUserService,
        private readonly botService: IBotService,
        private readonly loggerService: ILoggerService,
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
            const oldSpread = await Spread.findOne({
                coinAddress,
                platform: supportedPlatforms[i],
                owner: user._id
            })
            if(!oldSpread) {
                switch (supportedPlatforms[i]) {
                    case 'uniswap_v2':
                        const uniswapSpread: ISpread = new Spread({
                            coinAddress,
                            coinSymbol: coinData.data.symbol,
                            platform: supportedPlatforms[i],
                            spreadChange,
                            coinUsdValue: coinData.data.market_data.current_price.usd,
                            owner: user._id
                        })
                        spreads.push(uniswapSpread)
                        await uniswapSpread.save()
                        break;
                    case 'gate':
                        const gatePairs: any = await this.requestService.get(this.GATE_PAIRS_DATA_API_URL);

                        const coinUsdtPair: string = gatePairs.data.find(pair => pair === (coinData.data.symbol.toUpperCase() + `_USDT`));

                        if (coinUsdtPair) {
                            const gatePareInfo: any = await this.requestService.get(this.GATE_PAIR_DATA_API_URL+coinUsdtPair);
                            if (gatePareInfo.data.last) {
                                const gateSpread: ISpread = new Spread({
                                    coinAddress,
                                    coinSymbol: coinData.data.symbol,
                                    platform: supportedPlatforms[i],
                                    spreadChange,
                                    coinUsdValue: gatePareInfo.data.last,
                                    owner: user._id
                                })
                                spreads.push(gateSpread)
                                await gateSpread.save()
                            }
                        }
                        break;
                    case 'sushiswap':
                        console.log('sushi')
                        let sushiSwapTokenData: any;
                        try {
                            sushiSwapTokenData = await sushidata.exchange.token({token_address: coinAddress})
                        } catch(e) {
                            this.loggerService.log(e)
                        }
                        console.log('after getting data')
                        if (sushiSwapTokenData) {
                            const sushiswapCoinUsd: number = sushiSwapTokenData.volumeUSD/sushiSwapTokenData.volume;
                            const sushiswapSpread: ISpread = new Spread({
                                coinAddress,
                                coinSymbol: coinData.data.symbol,
                                platform: supportedPlatforms[i],
                                spreadChange,
                                coinUsdValue: sushiswapCoinUsd,
                                owner: user._id
                            })
                            spreads.push(sushiswapSpread)
                            await sushiswapSpread.save()
                        }

                        break;
                    case 'bithumb':
                        const bithumb = new ccxt.bithumb;
                        const bithumbTokens = await bithumb.publicGetTickerAll();
                        if (bithumbTokens.data[coinData.data.symbol.toUpperCase()]) {
                            const bithumbCoinUsd = bithumbTokens.data[coinData.data.symbol.toUpperCase()].prev_closing_price * 0.001;
                            const bithumbSpread: ISpread = new Spread({
                                coinAddress,
                                coinSymbol: coinData.data.symbol,
                                platform: supportedPlatforms[i],
                                spreadChange,
                                coinUsdValue: bithumbCoinUsd,
                                owner: user._id
                            })
                            spreads.push(bithumbSpread)
                            await bithumbSpread.save()
                        }
                        break;
                    case 'bibox':
                        const biboxTokenData: any = await this.requestService.get(this.BIBOX_PAIR_DATA_API_URL+coinData.data.symbol.toUpperCase()+`_USDT`);
                        if (biboxTokenData.data.result) {
                            const biboxCoinUsd = biboxTokenData.data.result.last_usd
                            if(biboxCoinUsd) {
                                const biboxSpread: ISpread = new Spread({
                                    coinAddress,
                                    coinSymbol: coinData.data.symbol,
                                    platform: supportedPlatforms[i],
                                    spreadChange,
                                    coinUsdValue: biboxCoinUsd,
                                    owner: user._id
                                })
                                spreads.push(biboxSpread)
                                await biboxSpread.save()
                            }
                        }
                        break;
                    case 'ftx':
                        const ftx = new ccxt.ftx;
                        const ftxTokens = await ftx.publicGetMarkets();

                        const ftxCoin = ftxTokens.result.find(({name}) => name.includes(coinData.data.symbol.toUpperCase()));
                        if (ftxCoin) {
                            const ftxCoinUsd = ftxCoin.last;
                            const ftxSpread: ISpread = new Spread({
                                coinAddress,
                                coinSymbol: coinData.data.symbol,
                                platform: supportedPlatforms[i],
                                spreadChange,
                                coinUsdValue: ftxCoinUsd,
                                owner: user._id
                            })
                            spreads.push(ftxSpread)
                            await ftxSpread.save()
                        }
                        break;
                    // case 'bitrue':
                    //
                    //     break;
                    case 'hotbit':
                        const hotbitToken: any = await this.requestService.get(`${this.HOTBIT_MARKET_DATA_API_URL}${coinData.data.symbol.toUpperCase()}/USDT`)
                        const hotbitCoinUsd:number = hotbitToken.data.result;
                        if(hotbitCoinUsd) {
                            const hotbitSpread: ISpread = new Spread({
                                coinAddress,
                                coinSymbol: coinData.data.symbol,
                                platform: supportedPlatforms[i],
                                spreadChange,
                                coinUsdValue: hotbitCoinUsd,
                                owner: user._id
                            })
                            spreads.push(hotbitSpread)
                            await hotbitSpread.save()
                        }
                        break;
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

    // coingecko realization
    //
    // public async compareSpreads(): Promise<void> {
    //     cron.schedule("6 * * * * *", async () => {
    //         this.loggerService.log('compare spreads')
    //
    //         const coinList: any = await this.requestService.get(this.COINlIST_DATA_API_URL);
    //
    //         const spreads: Array<ISpread> = await Spread.find();
    //
    //         for (let i = 0; i < spreads.length; i++) {
    //             if (!(spreads[i].platform === "uniswap_v2")) {
    //                 const uniswapSpread = await Spread.findOne({
    //                     owner: spreads[i].owner,
    //                     coinAddress: spreads[i].coinAddress,
    //                     platform: "uniswap_v2"
    //                 })
    //                 const coin = coinList.data.find(({platforms}) => platforms.ethereum === spreads[i].coinAddress.toLowerCase());
    //                 const coinData: any = await this.requestService.get(this.COIN_DATA_API_URL + coin.id);
    //                 const platformMarket = coinData.data.tickers.find(({market}) => spreads[i].platform === market.identifier);
    //                 const uniswapMarket = coinData.data.tickers.find(({market}) => market.identifier === "uniswap_v2");
    //                 if (!(!platformMarket || (spreads[i].coinUsdValue === platformMarket.converted_last.usd && uniswapSpread.coinUsdValue === uniswapMarket.converted_last.usd))) {
    //
    //                     if (((Math.abs(uniswapMarket.converted_last.usd - platformMarket.converted_last.usd) / uniswapMarket.converted_last.usd) * 100) >= spreads[i].spreadChange) {
    //                         spreads[i].coinUsdValue = platformMarket.converted_last.usd;
    //                         uniswapSpread.coinUsdValue = uniswapMarket.converted_last.usd;
    //                         await uniswapSpread.save();
    //                         await spreads[i].save();
    //
    //                         const user: IUser = await User.findOne({_id: spreads[i].owner});
    //                         this.botService.sendMessage(user.tg_chat_id, `❗️❗️${coinData.data.symbol}: ${uniswapMarket.market.identifier} (${uniswapMarket.converted_last.usd}$) ➡️ ${platformMarket.market.identifier} (${platformMarket.converted_last.usd}$) ❗️❗️ \n spread: ${Math.abs(uniswapMarket.converted_last.usd - platformMarket.converted_last.usd)}$`);
    //                     }
    //                 }
    //             }
    //         }
    //     });
    // }

    public async compareSpreads(): Promise<void> {
        cron.schedule("6 * * * * *", async () => {
            let uniswapSpread: ISpread;
            let uniswapCoin: Token;
            let pair: Pair;
            let route: Route;
            let uniswapCoinEth: number;
            let uniswapCoinUsd: number;


            this.loggerService.log('compare spreads');

            const etherscanKey = this.configService.get('ETHERSCAN_KEY');
            const ethPriceResponse: any = await this.requestService.get(this.ETHER_PRICE_DATA_API_URL + etherscanKey);
            const ethPrice = ethPriceResponse.data.result.ethusd;


            const spreads: Array<ISpread> = await Spread.find();

            for (let i = 0; i < spreads.length; i++) {
                switch (spreads[i].platform) {
                    case 'uniswap_v2':
                        break;
                    case 'gate':
                        this.loggerService.log('from gate')
                        uniswapSpread = await Spread.findOne({
                            owner: spreads[i].owner,
                            coinAddress: spreads[i].coinAddress,
                            platform: "uniswap_v2"
                        })

                        uniswapCoin = new Token(ChainId.MAINNET, spreads[i].coinAddress, 18);
                        pair = await Fetcher.fetchPairData(
                            uniswapCoin,
                            WETH[uniswapCoin.chainId]
                        );
                        route = new Route([pair], WETH[uniswapCoin.chainId]);
                        uniswapCoinEth = parseFloat(route.midPrice.toSignificant(6));
                        uniswapCoinUsd = ethPrice / uniswapCoinEth;

                        const gatePairs: any = await this.requestService.get(this.GATE_PAIRS_DATA_API_URL);

                        const coinUsdtPair: string = gatePairs.data.find(pair => pair === (spreads[i].coinSymbol.toUpperCase() + `_USDT`));
                        if (coinUsdtPair) {
                            const gatePareInfo: any = await this.requestService.get(this.GATE_PAIR_DATA_API_URL+coinUsdtPair);
                            const coinGateUsd = gatePareInfo.data.last
                            if ((((Math.abs(uniswapCoinUsd - coinGateUsd)/uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && ((coinGateUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue))) {
                                spreads[i].coinUsdValue = coinGateUsd;
                                uniswapSpread.coinUsdValue = uniswapCoinUsd;

                                await spreads[i].save();
                                await uniswapSpread.save();

                                const user: IUser = await User.findOne({_id: spreads[i].owner});
                                await this.botService.sendMessage(user.tg_chat_id, `❗️❗️${spreads[i].coinSymbol}: ${uniswapSpread.platform} (${uniswapCoinUsd}$) ➡️ ${spreads[i].platform} (${coinGateUsd}$) ❗️❗️ \n spread: ${this.formatFloatToReadableString(Math.abs(uniswapCoinUsd - coinGateUsd))}$`);
                            }
                        }
                        break;
                    case 'sushiswap':
                        this.loggerService.log('from sushiswap')
                        uniswapSpread = await Spread.findOne({
                            owner: spreads[i].owner,
                            coinAddress: spreads[i].coinAddress,
                            platform: "uniswap_v2"
                        })

                        uniswapCoin = new Token(ChainId.MAINNET, spreads[i].coinAddress, 18);
                        pair = await Fetcher.fetchPairData(
                            uniswapCoin,
                            WETH[uniswapCoin.chainId]
                        );
                        route = new Route([pair], WETH[uniswapCoin.chainId]);
                        uniswapCoinEth = parseFloat(route.midPrice.toSignificant(6));
                        uniswapCoinUsd = ethPrice / uniswapCoinEth;

                        const sushiSwapTokenData = await sushidata.exchange.token({token_address: spreads[i].coinAddress})
                        const sushiswapCoinUsd: number = sushiSwapTokenData.volumeUSD/sushiSwapTokenData.volume;

                        if ((((Math.abs(uniswapCoinUsd - sushiswapCoinUsd)/uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && ((sushiswapCoinUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue))) {
                            spreads[i].coinUsdValue = sushiswapCoinUsd;
                            uniswapSpread.coinUsdValue = uniswapCoinUsd;

                            await spreads[i].save();
                            await uniswapSpread.save();

                            const user: IUser = await User.findOne({_id: spreads[i].owner});
                            await this.botService.sendMessage(user.tg_chat_id, `❗️❗️${spreads[i].coinSymbol}: ${uniswapSpread.platform} (${uniswapCoinUsd}$) ➡️ ${spreads[i].platform} (${sushiswapCoinUsd}$) ❗️❗️ \n spread: ${this.formatFloatToReadableString(Math.abs(uniswapCoinUsd - sushiswapCoinUsd))}$`);
                        }
                        break;
                    case 'bithumb':
                        this.loggerService.log('from bithumb');
                        uniswapSpread = await Spread.findOne({
                            owner: spreads[i].owner,
                            coinAddress: spreads[i].coinAddress,
                            platform: "uniswap_v2"
                        })

                        uniswapCoin = new Token(ChainId.MAINNET, spreads[i].coinAddress, 18);
                        pair = await Fetcher.fetchPairData(
                            uniswapCoin,
                            WETH[uniswapCoin.chainId]
                        );
                        route = new Route([pair], WETH[uniswapCoin.chainId]);
                        uniswapCoinEth = parseFloat(route.midPrice.toSignificant(6));
                        uniswapCoinUsd = ethPrice / uniswapCoinEth;

                        const bithumb = new ccxt.bithumb;
                        const bithumbTokens = await bithumb.publicGetTickerAll();

                        const bithumbCoinUsd = bithumbTokens.data[spreads[i].coinSymbol.toUpperCase()].prev_closing_price * 0.001;
                        if (bithumbCoinUsd) {
                            if ((((Math.abs(uniswapCoinUsd - bithumbCoinUsd)/uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && ((bithumbCoinUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue))) {
                                spreads[i].coinUsdValue = bithumbCoinUsd;
                                uniswapSpread.coinUsdValue = uniswapCoinUsd;

                                await spreads[i].save();
                                await uniswapSpread.save();

                                const user: IUser = await User.findOne({_id: spreads[i].owner});
                                await this.botService.sendMessage(user.tg_chat_id, `❗️❗️${spreads[i].coinSymbol}: ${uniswapSpread.platform} (${uniswapCoinUsd}$) ➡️ ${spreads[i].platform} (${bithumbCoinUsd}$) ❗️❗️ \n spread: ${this.formatFloatToReadableString(Math.abs(uniswapCoinUsd - bithumbCoinUsd))}$`);
                            }
                        }

                        break;
                    case 'bibox':
                        this.loggerService.log('from bibox')
                        uniswapSpread = await Spread.findOne({
                            owner: spreads[i].owner,
                            coinAddress: spreads[i].coinAddress,
                            platform: "uniswap_v2"
                        })

                        uniswapCoin = new Token(ChainId.MAINNET, spreads[i].coinAddress, 18);
                        pair = await Fetcher.fetchPairData(
                            uniswapCoin,
                            WETH[uniswapCoin.chainId]
                        );
                        route = new Route([pair], WETH[uniswapCoin.chainId]);
                        uniswapCoinEth = parseFloat(route.midPrice.toSignificant(6));
                        uniswapCoinUsd = ethPrice / uniswapCoinEth;

                        const biboxTokenData: any = await this.requestService.get(this.BIBOX_PAIR_DATA_API_URL+spreads[i].coinSymbol.toUpperCase()+`_USDT`);

                        const biboxCoinUsd = biboxTokenData.data.result.last_usd

                        if(biboxCoinUsd) {

                            if ((((Math.abs(uniswapCoinUsd - biboxCoinUsd)/uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && ((biboxCoinUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue))) {
                                spreads[i].coinUsdValue = biboxCoinUsd;
                                uniswapSpread.coinUsdValue = uniswapCoinUsd;

                                await spreads[i].save();
                                await uniswapSpread.save();

                                const user: IUser = await User.findOne({_id: spreads[i].owner});
                                await this.botService.sendMessage(user.tg_chat_id, `❗️❗️${spreads[i].coinSymbol}: ${uniswapSpread.platform} (${uniswapCoinUsd}$) ➡️ ${spreads[i].platform} (${biboxCoinUsd}$) ❗️❗️ \n spread: ${this.formatFloatToReadableString(Math.abs(uniswapCoinUsd - biboxCoinUsd))}$`);
                            }
                        }
                        break;
                    case 'ftx':
                        this.loggerService.log('from ftx')
                        uniswapSpread = await Spread.findOne({
                            owner: spreads[i].owner,
                            coinAddress: spreads[i].coinAddress,
                            platform: "uniswap_v2"
                        })

                        uniswapCoin = new Token(ChainId.MAINNET, spreads[i].coinAddress, 18);
                        pair = await Fetcher.fetchPairData(
                            uniswapCoin,
                            WETH[uniswapCoin.chainId]
                        );
                        route = new Route([pair], WETH[uniswapCoin.chainId]);
                        uniswapCoinEth = parseFloat(route.midPrice.toSignificant(6));
                        uniswapCoinUsd = ethPrice / uniswapCoinEth;



                        const ftx = new ccxt.ftx;
                        const ftxTokens = await ftx.publicGetMarkets();

                        const ftxCoinUsd = ftxTokens.result.find(({name}) => name.includes(spreads[i].coinSymbol.toUpperCase())).last;
                        if(ftxCoinUsd) {

                            if ((((Math.abs(uniswapCoinUsd - ftxCoinUsd)/uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && ((ftxCoinUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue))) {
                                spreads[i].coinUsdValue = ftxCoinUsd;
                                uniswapSpread.coinUsdValue = uniswapCoinUsd;

                                await spreads[i].save();
                                await uniswapSpread.save();

                                const user: IUser = await User.findOne({_id: spreads[i].owner});
                                await this.botService.sendMessage(user.tg_chat_id, `❗️❗️${spreads[i].coinSymbol}: ${uniswapSpread.platform} (${uniswapCoinUsd}$) ➡️ ${spreads[i].platform} (${ftxCoinUsd}$) ❗️❗️ \n spread: ${this.formatFloatToReadableString(Math.abs(uniswapCoinUsd - ftxCoinUsd))}$`);
                            }
                        }

                        break;
                    // case 'bitrue':
                    //     this.loggerService.log('from bitrue')
                    //     uniswapSpread = await Spread.findOne({
                    //         owner: spreads[i].owner,
                    //         coinAddress: spreads[i].coinAddress,
                    //         platform: "uniswap_v2"
                    //     })
                    //
                    //     uniswapCoin = new Token(ChainId.MAINNET, spreads[i].coinAddress, 18);
                    //     pair = await Fetcher.fetchPairData(
                    //         uniswapCoin,
                    //         WETH[uniswapCoin.chainId]
                    //     );
                    //     route = new Route([pair], WETH[uniswapCoin.chainId]);
                    //     uniswapCoinEth = parseFloat(route.midPrice.toSignificant(6));
                    //     uniswapCoinUsd = ethPrice / uniswapCoinEth;
                    //
                    //     const bitrueTokens: any = await this.requestService.get(this.BITRUE_TICKER_DATA_API_URL);
                    //     const bitrueCoinUsd: number = bitrueTokens.data.find(({ symbol }) => symbol.includes(`${spreads[i].coinSymbol.toUpperCase()}USDT`)).lastPrice;
                    //     if (bitrueCoinUsd) {
                    //         if ((((Math.abs(uniswapCoinUsd -  bitrueCoinUsd)/uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && (( bitrueCoinUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue))) {
                    //             spreads[i].coinUsdValue =  bitrueCoinUsd;
                    //             uniswapSpread.coinUsdValue = uniswapCoinUsd;
                    //
                    //             await spreads[i].save();
                    //             await uniswapSpread.save();
                    //
                    //             const user: IUser = await User.findOne({_id: spreads[i].owner});
                    //             await this.botService.sendMessage(user.tg_chat_id, `❗️❗️${spreads[i].coinSymbol}: ${uniswapSpread.platform} (${uniswapCoinUsd}$) ➡️ ${spreads[i].platform} (${ bitrueCoinUsd}$) ❗️❗️ \n spread: ${this.formatFloatToReadableString(Math.abs(uniswapCoinUsd -  bitrueCoinUsd))}$`);
                    //         }
                    //     }
                    //
                    //     break;
                    case 'hotbit':
                        this.loggerService.log('from hotbit');
                        uniswapSpread = await Spread.findOne({
                            owner: spreads[i].owner,
                            coinAddress: spreads[i].coinAddress,
                            platform: "uniswap_v2"
                        })

                        uniswapCoin = new Token(ChainId.MAINNET, spreads[i].coinAddress, 18);
                        pair = await Fetcher.fetchPairData(
                            uniswapCoin,
                            WETH[uniswapCoin.chainId]
                        );
                        route = new Route([pair], WETH[uniswapCoin.chainId]);
                        uniswapCoinEth = parseFloat(route.midPrice.invert().toSignificant(18));
                        uniswapCoinUsd = ethPrice * uniswapCoinEth;



                        const hotbitToken: any = await this.requestService.get(`${this.HOTBIT_MARKET_DATA_API_URL}${spreads[i].coinSymbol.toUpperCase()}/USDT`)
                        const hotbitCoinUsd:number = hotbitToken.data.result;

                        if(hotbitCoinUsd) {

                            if ((((Math.abs(uniswapCoinUsd -  hotbitCoinUsd)/uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && (( hotbitCoinUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue))) {
                                spreads[i].coinUsdValue =  hotbitCoinUsd;
                                uniswapSpread.coinUsdValue = uniswapCoinUsd;

                                await spreads[i].save();
                                await uniswapSpread.save();

                                const user: IUser = await User.findOne({_id: spreads[i].owner});
                                await this.botService.sendMessage(user.tg_chat_id, `❗️❗️${spreads[i].coinSymbol}: ${uniswapSpread.platform} (${uniswapCoinUsd}$) ➡️ ${spreads[i].platform} (${ this.formatFloatToReadableString(hotbitCoinUsd) }$) ❗️❗️ \n spread: ${this.formatFloatToReadableString(Math.abs(uniswapCoinUsd -  hotbitCoinUsd))}$`);
                            }
                        }
                        break;
                }
            }
        });
    }
    private formatFloatToReadableString (value: number): string {
        const stringValue = value.toString();
        if(stringValue.includes('e')) {

            const arrValue = stringValue.split('e-');
            const result = `0.${'0'.repeat(+arrValue[1]-arrValue[0].length)}${arrValue[0]}`;
            return result;
        } else return stringValue
    }

    private formatFloatToReadableFloat (value: number): number {
        const stringValue = value.toString();
        if(stringValue.includes('e')) {

            const arrValue = stringValue.split('e-');
            const result = `0.${'0'.repeat(+arrValue[1]-arrValue[0].length)}${arrValue[0]}`;
            return parseFloat(result);
        } else return value
    }
}