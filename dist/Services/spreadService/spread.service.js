"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpreadService = void 0;
var spread_model_1 = require("../../models/spread/spread.model");
var user_model_1 = require("../../models/user/user.model");
var cron = __importStar(require("node-cron"));
var sdk_1 = require("@uniswap/sdk");
var sushi_data_1 = __importDefault(require("@sushiswap/sushi-data"));
var ccxt = __importStar(require("ccxt"));
var SpreadService = /** @class */ (function () {
    function SpreadService(configService, requestService, platformService, userService, botService, loggerService) {
        this.configService = configService;
        this.requestService = requestService;
        this.platformService = platformService;
        this.userService = userService;
        this.botService = botService;
        this.loggerService = loggerService;
        this.COINlIST_DATA_API_URL = "https://api.coingecko.com/api/v3/coins/list?include_platform=true";
        this.COIN_DATA_API_URL = "https://api.coingecko.com/api/v3/coins/";
        this.ETHER_PRICE_DATA_API_URL = "https://api.etherscan.io/api?module=stats&action=ethprice&apikey=";
        this.GATE_PAIRS_DATA_API_URL = "https://data.gateapi.io/api2/1/pairs";
        this.GATE_PAIR_DATA_API_URL = "https://data.gateapi.io/api2/1/ticker/";
        this.BIBOX_PAIR_DATA_API_URL = "https://api.bibox.com/v3/mdata/ticker?pair=";
        this.BITRUE_TICKER_DATA_API_URL = "https://www.bitrue.com/api/v1/ticker/24hr";
        this.HOTBIT_MARKET_DATA_API_URL = "https://api.hotbit.io/api/v1/market.last?market=";
    }
    SpreadService.prototype.addSpreads = function (tgUserId, coinAddress, spreadChange) {
        return __awaiter(this, void 0, void 0, function () {
            var user, coinsList, supportedPlatforms, coinFromList, coinData, spreads, i, oldSpread, _a, uniswapSpread, gatePairs, coinUsdtPair, gatePareInfo, gateSpread, sushiSwapTokenData, sushiswapCoinUsd, sushiswapSpread, bithumb, bithumbTokens, bithumbCoinUsd, bithumbSpread, biboxTokenData, biboxCoinUsd, biboxSpread, ftx, ftxTokens, ftxCoin, ftxCoinUsd, ftxSpread, hotbitToken, hotbitCoinUsd, hotbitSpread;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.userService.getUserByTgId(tgUserId)];
                    case 1:
                        user = _b.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.requestService.get(this.COINlIST_DATA_API_URL)];
                    case 2:
                        coinsList = _b.sent();
                        supportedPlatforms = this.platformService.get();
                        coinFromList = coinsList.data.find(function (_a) {
                            var platforms = _a.platforms;
                            return platforms.ethereum === coinAddress.toLowerCase();
                        });
                        return [4 /*yield*/, this.requestService.get(this.COIN_DATA_API_URL + coinFromList.id)];
                    case 3:
                        coinData = _b.sent();
                        spreads = [];
                        i = 0;
                        _b.label = 4;
                    case 4:
                        if (!(i < supportedPlatforms.length)) return [3 /*break*/, 34];
                        return [4 /*yield*/, spread_model_1.Spread.findOne({
                                coinAddress: coinAddress,
                                platform: supportedPlatforms[i],
                                owner: user._id
                            })];
                    case 5:
                        oldSpread = _b.sent();
                        if (!!oldSpread) return [3 /*break*/, 33];
                        _a = supportedPlatforms[i];
                        switch (_a) {
                            case 'uniswap_v2': return [3 /*break*/, 6];
                            case 'gate': return [3 /*break*/, 8];
                            case 'sushiswap': return [3 /*break*/, 13];
                            case 'bithumb': return [3 /*break*/, 17];
                            case 'bibox': return [3 /*break*/, 21];
                            case 'ftx': return [3 /*break*/, 25];
                            case 'hotbit': return [3 /*break*/, 29];
                        }
                        return [3 /*break*/, 33];
                    case 6:
                        uniswapSpread = new spread_model_1.Spread({
                            coinAddress: coinAddress,
                            coinSymbol: coinData.data.symbol,
                            platform: supportedPlatforms[i],
                            spreadChange: spreadChange,
                            coinUsdValue: coinData.data.market_data.current_price.usd,
                            owner: user._id
                        });
                        spreads.push(uniswapSpread);
                        return [4 /*yield*/, uniswapSpread.save()];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 8: return [4 /*yield*/, this.requestService.get(this.GATE_PAIRS_DATA_API_URL)];
                    case 9:
                        gatePairs = _b.sent();
                        coinUsdtPair = gatePairs.data.find(function (pair) { return pair === (coinData.data.symbol.toUpperCase() + "_USDT"); });
                        if (!coinUsdtPair) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.requestService.get(this.GATE_PAIR_DATA_API_URL + coinUsdtPair)];
                    case 10:
                        gatePareInfo = _b.sent();
                        if (!gatePareInfo.data.last) return [3 /*break*/, 12];
                        gateSpread = new spread_model_1.Spread({
                            coinAddress: coinAddress,
                            coinSymbol: coinData.data.symbol,
                            platform: supportedPlatforms[i],
                            spreadChange: spreadChange,
                            coinUsdValue: gatePareInfo.data.last,
                            owner: user._id
                        });
                        spreads.push(gateSpread);
                        return [4 /*yield*/, gateSpread.save()];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12: return [3 /*break*/, 33];
                    case 13: return [4 /*yield*/, sushi_data_1.default.exchange.token({ token_address: coinAddress })];
                    case 14:
                        sushiSwapTokenData = _b.sent();
                        if (!sushiSwapTokenData) return [3 /*break*/, 16];
                        sushiswapCoinUsd = sushiSwapTokenData.volumeUSD / sushiSwapTokenData.volume;
                        sushiswapSpread = new spread_model_1.Spread({
                            coinAddress: coinAddress,
                            coinSymbol: coinData.data.symbol,
                            platform: supportedPlatforms[i],
                            spreadChange: spreadChange,
                            coinUsdValue: sushiswapCoinUsd,
                            owner: user._id
                        });
                        spreads.push(sushiswapSpread);
                        return [4 /*yield*/, sushiswapSpread.save()];
                    case 15:
                        _b.sent();
                        _b.label = 16;
                    case 16: return [3 /*break*/, 33];
                    case 17:
                        bithumb = new ccxt.bithumb;
                        return [4 /*yield*/, bithumb.publicGetTickerAll()];
                    case 18:
                        bithumbTokens = _b.sent();
                        if (!bithumbTokens.data[coinData.data.symbol.toUpperCase()]) return [3 /*break*/, 20];
                        bithumbCoinUsd = bithumbTokens.data[coinData.data.symbol.toUpperCase()].prev_closing_price * 0.001;
                        bithumbSpread = new spread_model_1.Spread({
                            coinAddress: coinAddress,
                            coinSymbol: coinData.data.symbol,
                            platform: supportedPlatforms[i],
                            spreadChange: spreadChange,
                            coinUsdValue: bithumbCoinUsd,
                            owner: user._id
                        });
                        spreads.push(bithumbSpread);
                        return [4 /*yield*/, bithumbSpread.save()];
                    case 19:
                        _b.sent();
                        _b.label = 20;
                    case 20: return [3 /*break*/, 33];
                    case 21: return [4 /*yield*/, this.requestService.get(this.BIBOX_PAIR_DATA_API_URL + coinData.data.symbol.toUpperCase() + "_USDT")];
                    case 22:
                        biboxTokenData = _b.sent();
                        if (!biboxTokenData.data.result) return [3 /*break*/, 24];
                        biboxCoinUsd = biboxTokenData.data.result.last_usd;
                        if (!biboxCoinUsd) return [3 /*break*/, 24];
                        biboxSpread = new spread_model_1.Spread({
                            coinAddress: coinAddress,
                            coinSymbol: coinData.data.symbol,
                            platform: supportedPlatforms[i],
                            spreadChange: spreadChange,
                            coinUsdValue: biboxCoinUsd,
                            owner: user._id
                        });
                        spreads.push(biboxSpread);
                        return [4 /*yield*/, biboxSpread.save()];
                    case 23:
                        _b.sent();
                        _b.label = 24;
                    case 24: return [3 /*break*/, 33];
                    case 25:
                        ftx = new ccxt.ftx;
                        return [4 /*yield*/, ftx.publicGetMarkets()];
                    case 26:
                        ftxTokens = _b.sent();
                        ftxCoin = ftxTokens.result.find(function (_a) {
                            var name = _a.name;
                            return name.includes(coinData.data.symbol.toUpperCase());
                        });
                        if (!ftxCoin) return [3 /*break*/, 28];
                        ftxCoinUsd = ftxCoin.last;
                        ftxSpread = new spread_model_1.Spread({
                            coinAddress: coinAddress,
                            coinSymbol: coinData.data.symbol,
                            platform: supportedPlatforms[i],
                            spreadChange: spreadChange,
                            coinUsdValue: ftxCoinUsd,
                            owner: user._id
                        });
                        spreads.push(ftxSpread);
                        return [4 /*yield*/, ftxSpread.save()];
                    case 27:
                        _b.sent();
                        _b.label = 28;
                    case 28: return [3 /*break*/, 33];
                    case 29: return [4 /*yield*/, this.requestService.get("" + this.HOTBIT_MARKET_DATA_API_URL + coinData.data.symbol.toUpperCase() + "/USDT")];
                    case 30:
                        hotbitToken = _b.sent();
                        hotbitCoinUsd = hotbitToken.data.result;
                        if (!hotbitCoinUsd) return [3 /*break*/, 32];
                        hotbitSpread = new spread_model_1.Spread({
                            coinAddress: coinAddress,
                            coinSymbol: coinData.data.symbol,
                            platform: supportedPlatforms[i],
                            spreadChange: spreadChange,
                            coinUsdValue: hotbitCoinUsd,
                            owner: user._id
                        });
                        spreads.push(hotbitSpread);
                        return [4 /*yield*/, hotbitSpread.save()];
                    case 31:
                        _b.sent();
                        _b.label = 32;
                    case 32: return [3 /*break*/, 33];
                    case 33:
                        i++;
                        return [3 /*break*/, 4];
                    case 34: return [2 /*return*/, spreads];
                }
            });
        });
    };
    SpreadService.prototype.editSpreads = function (tgUserId, coinAddress, spreadChange) {
        return __awaiter(this, void 0, void 0, function () {
            var addressTemplate, percentageTemplate, user, spreads, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addressTemplate = /^0x[a-fA-F0-9]{40}$/;
                        percentageTemplate = /^[0-9]*[.,]?[0-9]+$/;
                        if (!percentageTemplate.test(spreadChange))
                            return [2 /*return*/, null];
                        if (!addressTemplate.test(coinAddress))
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.userService.getUserByTgId(tgUserId)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, spread_model_1.Spread.find({ owner: user._id, coinAddress: coinAddress })];
                    case 2:
                        spreads = _a.sent();
                        if (spreads.length === 0)
                            return [2 /*return*/, null];
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < spreads.length)) return [3 /*break*/, 6];
                        spreads[i].spreadChange = parseFloat(spreadChange);
                        return [4 /*yield*/, spreads[i].save()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, spreads];
                }
            });
        });
    };
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
    SpreadService.prototype.compareSpreads = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                cron.schedule("6 * * * * *", function () { return __awaiter(_this, void 0, void 0, function () {
                    var uniswapSpread, uniswapCoin, pair, route, uniswapCoinEth, uniswapCoinUsd, etherscanKey, ethPriceResponse, ethPrice, spreads, _loop_1, this_1, i;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.loggerService.log('compare spreads');
                                etherscanKey = this.configService.get('ETHERSCAN_KEY');
                                return [4 /*yield*/, this.requestService.get(this.ETHER_PRICE_DATA_API_URL + etherscanKey)];
                            case 1:
                                ethPriceResponse = _a.sent();
                                ethPrice = ethPriceResponse.data.result.ethusd;
                                return [4 /*yield*/, spread_model_1.Spread.find()];
                            case 2:
                                spreads = _a.sent();
                                _loop_1 = function (i) {
                                    var _b, gatePairs, coinUsdtPair, gatePareInfo, coinGateUsd, user, sushiSwapTokenData, sushiswapCoinUsd, user, bithumb, bithumbTokens, bithumbCoinUsd, user, biboxTokenData, biboxCoinUsd, user, ftx, ftxTokens, ftxCoinUsd, user, hotbitToken, hotbitCoinUsd, user;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                _b = spreads[i].platform;
                                                switch (_b) {
                                                    case 'uniswap_v2': return [3 /*break*/, 1];
                                                    case 'gate': return [3 /*break*/, 2];
                                                    case 'sushiswap': return [3 /*break*/, 12];
                                                    case 'bithumb': return [3 /*break*/, 21];
                                                    case 'bibox': return [3 /*break*/, 30];
                                                    case 'ftx': return [3 /*break*/, 39];
                                                    case 'hotbit': return [3 /*break*/, 48];
                                                }
                                                return [3 /*break*/, 57];
                                            case 1: return [3 /*break*/, 57];
                                            case 2:
                                                this_1.loggerService.log('from gate');
                                                return [4 /*yield*/, spread_model_1.Spread.findOne({
                                                        owner: spreads[i].owner,
                                                        coinAddress: spreads[i].coinAddress,
                                                        platform: "uniswap_v2"
                                                    })];
                                            case 3:
                                                uniswapSpread = _c.sent();
                                                uniswapCoin = new sdk_1.Token(sdk_1.ChainId.MAINNET, spreads[i].coinAddress, 18);
                                                return [4 /*yield*/, sdk_1.Fetcher.fetchPairData(uniswapCoin, sdk_1.WETH[uniswapCoin.chainId])];
                                            case 4:
                                                pair = _c.sent();
                                                route = new sdk_1.Route([pair], sdk_1.WETH[uniswapCoin.chainId]);
                                                uniswapCoinEth = parseFloat(route.midPrice.toSignificant(6));
                                                uniswapCoinUsd = ethPrice / uniswapCoinEth;
                                                return [4 /*yield*/, this_1.requestService.get(this_1.GATE_PAIRS_DATA_API_URL)];
                                            case 5:
                                                gatePairs = _c.sent();
                                                coinUsdtPair = gatePairs.data.find(function (pair) { return pair === (spreads[i].coinSymbol.toUpperCase() + "_USDT"); });
                                                if (!coinUsdtPair) return [3 /*break*/, 11];
                                                return [4 /*yield*/, this_1.requestService.get(this_1.GATE_PAIR_DATA_API_URL + coinUsdtPair)];
                                            case 6:
                                                gatePareInfo = _c.sent();
                                                coinGateUsd = gatePareInfo.data.last;
                                                if (!((((Math.abs(uniswapCoinUsd - coinGateUsd) / uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && ((coinGateUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue)))) return [3 /*break*/, 11];
                                                spreads[i].coinUsdValue = coinGateUsd;
                                                uniswapSpread.coinUsdValue = uniswapCoinUsd;
                                                return [4 /*yield*/, spreads[i].save()];
                                            case 7:
                                                _c.sent();
                                                return [4 /*yield*/, uniswapSpread.save()];
                                            case 8:
                                                _c.sent();
                                                return [4 /*yield*/, user_model_1.User.findOne({ _id: spreads[i].owner })];
                                            case 9:
                                                user = _c.sent();
                                                return [4 /*yield*/, this_1.botService.sendMessage(user.tg_chat_id, "\u2757\uFE0F\u2757\uFE0F" + spreads[i].coinSymbol + ": " + uniswapSpread.platform + " (" + uniswapCoinUsd + "$) \u27A1\uFE0F " + spreads[i].platform + " (" + coinGateUsd + "$) \u2757\uFE0F\u2757\uFE0F \n spread: " + this_1.formatFloatToReadableString(Math.abs(uniswapCoinUsd - coinGateUsd)) + "$")];
                                            case 10:
                                                _c.sent();
                                                _c.label = 11;
                                            case 11: return [3 /*break*/, 57];
                                            case 12:
                                                this_1.loggerService.log('from sushiswap');
                                                return [4 /*yield*/, spread_model_1.Spread.findOne({
                                                        owner: spreads[i].owner,
                                                        coinAddress: spreads[i].coinAddress,
                                                        platform: "uniswap_v2"
                                                    })];
                                            case 13:
                                                uniswapSpread = _c.sent();
                                                uniswapCoin = new sdk_1.Token(sdk_1.ChainId.MAINNET, spreads[i].coinAddress, 18);
                                                return [4 /*yield*/, sdk_1.Fetcher.fetchPairData(uniswapCoin, sdk_1.WETH[uniswapCoin.chainId])];
                                            case 14:
                                                pair = _c.sent();
                                                route = new sdk_1.Route([pair], sdk_1.WETH[uniswapCoin.chainId]);
                                                uniswapCoinEth = parseFloat(route.midPrice.toSignificant(6));
                                                uniswapCoinUsd = ethPrice / uniswapCoinEth;
                                                return [4 /*yield*/, sushi_data_1.default.exchange.token({ token_address: spreads[i].coinAddress })];
                                            case 15:
                                                sushiSwapTokenData = _c.sent();
                                                sushiswapCoinUsd = sushiSwapTokenData.volumeUSD / sushiSwapTokenData.volume;
                                                if (!((((Math.abs(uniswapCoinUsd - sushiswapCoinUsd) / uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && ((sushiswapCoinUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue)))) return [3 /*break*/, 20];
                                                spreads[i].coinUsdValue = sushiswapCoinUsd;
                                                uniswapSpread.coinUsdValue = uniswapCoinUsd;
                                                return [4 /*yield*/, spreads[i].save()];
                                            case 16:
                                                _c.sent();
                                                return [4 /*yield*/, uniswapSpread.save()];
                                            case 17:
                                                _c.sent();
                                                return [4 /*yield*/, user_model_1.User.findOne({ _id: spreads[i].owner })];
                                            case 18:
                                                user = _c.sent();
                                                return [4 /*yield*/, this_1.botService.sendMessage(user.tg_chat_id, "\u2757\uFE0F\u2757\uFE0F" + spreads[i].coinSymbol + ": " + uniswapSpread.platform + " (" + uniswapCoinUsd + "$) \u27A1\uFE0F " + spreads[i].platform + " (" + sushiswapCoinUsd + "$) \u2757\uFE0F\u2757\uFE0F \n spread: " + this_1.formatFloatToReadableString(Math.abs(uniswapCoinUsd - sushiswapCoinUsd)) + "$")];
                                            case 19:
                                                _c.sent();
                                                _c.label = 20;
                                            case 20: return [3 /*break*/, 57];
                                            case 21:
                                                this_1.loggerService.log('from bithumb');
                                                return [4 /*yield*/, spread_model_1.Spread.findOne({
                                                        owner: spreads[i].owner,
                                                        coinAddress: spreads[i].coinAddress,
                                                        platform: "uniswap_v2"
                                                    })];
                                            case 22:
                                                uniswapSpread = _c.sent();
                                                uniswapCoin = new sdk_1.Token(sdk_1.ChainId.MAINNET, spreads[i].coinAddress, 18);
                                                return [4 /*yield*/, sdk_1.Fetcher.fetchPairData(uniswapCoin, sdk_1.WETH[uniswapCoin.chainId])];
                                            case 23:
                                                pair = _c.sent();
                                                route = new sdk_1.Route([pair], sdk_1.WETH[uniswapCoin.chainId]);
                                                uniswapCoinEth = parseFloat(route.midPrice.toSignificant(6));
                                                uniswapCoinUsd = ethPrice / uniswapCoinEth;
                                                bithumb = new ccxt.bithumb;
                                                return [4 /*yield*/, bithumb.publicGetTickerAll()];
                                            case 24:
                                                bithumbTokens = _c.sent();
                                                bithumbCoinUsd = bithumbTokens.data[spreads[i].coinSymbol.toUpperCase()].prev_closing_price * 0.001;
                                                if (!bithumbCoinUsd) return [3 /*break*/, 29];
                                                if (!((((Math.abs(uniswapCoinUsd - bithumbCoinUsd) / uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && ((bithumbCoinUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue)))) return [3 /*break*/, 29];
                                                spreads[i].coinUsdValue = bithumbCoinUsd;
                                                uniswapSpread.coinUsdValue = uniswapCoinUsd;
                                                return [4 /*yield*/, spreads[i].save()];
                                            case 25:
                                                _c.sent();
                                                return [4 /*yield*/, uniswapSpread.save()];
                                            case 26:
                                                _c.sent();
                                                return [4 /*yield*/, user_model_1.User.findOne({ _id: spreads[i].owner })];
                                            case 27:
                                                user = _c.sent();
                                                return [4 /*yield*/, this_1.botService.sendMessage(user.tg_chat_id, "\u2757\uFE0F\u2757\uFE0F" + spreads[i].coinSymbol + ": " + uniswapSpread.platform + " (" + uniswapCoinUsd + "$) \u27A1\uFE0F " + spreads[i].platform + " (" + bithumbCoinUsd + "$) \u2757\uFE0F\u2757\uFE0F \n spread: " + this_1.formatFloatToReadableString(Math.abs(uniswapCoinUsd - bithumbCoinUsd)) + "$")];
                                            case 28:
                                                _c.sent();
                                                _c.label = 29;
                                            case 29: return [3 /*break*/, 57];
                                            case 30:
                                                this_1.loggerService.log('from bibox');
                                                return [4 /*yield*/, spread_model_1.Spread.findOne({
                                                        owner: spreads[i].owner,
                                                        coinAddress: spreads[i].coinAddress,
                                                        platform: "uniswap_v2"
                                                    })];
                                            case 31:
                                                uniswapSpread = _c.sent();
                                                uniswapCoin = new sdk_1.Token(sdk_1.ChainId.MAINNET, spreads[i].coinAddress, 18);
                                                return [4 /*yield*/, sdk_1.Fetcher.fetchPairData(uniswapCoin, sdk_1.WETH[uniswapCoin.chainId])];
                                            case 32:
                                                pair = _c.sent();
                                                route = new sdk_1.Route([pair], sdk_1.WETH[uniswapCoin.chainId]);
                                                uniswapCoinEth = parseFloat(route.midPrice.toSignificant(6));
                                                uniswapCoinUsd = ethPrice / uniswapCoinEth;
                                                return [4 /*yield*/, this_1.requestService.get(this_1.BIBOX_PAIR_DATA_API_URL + spreads[i].coinSymbol.toUpperCase() + "_USDT")];
                                            case 33:
                                                biboxTokenData = _c.sent();
                                                biboxCoinUsd = biboxTokenData.data.result.last_usd;
                                                if (!biboxCoinUsd) return [3 /*break*/, 38];
                                                if (!((((Math.abs(uniswapCoinUsd - biboxCoinUsd) / uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && ((biboxCoinUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue)))) return [3 /*break*/, 38];
                                                spreads[i].coinUsdValue = biboxCoinUsd;
                                                uniswapSpread.coinUsdValue = uniswapCoinUsd;
                                                return [4 /*yield*/, spreads[i].save()];
                                            case 34:
                                                _c.sent();
                                                return [4 /*yield*/, uniswapSpread.save()];
                                            case 35:
                                                _c.sent();
                                                return [4 /*yield*/, user_model_1.User.findOne({ _id: spreads[i].owner })];
                                            case 36:
                                                user = _c.sent();
                                                return [4 /*yield*/, this_1.botService.sendMessage(user.tg_chat_id, "\u2757\uFE0F\u2757\uFE0F" + spreads[i].coinSymbol + ": " + uniswapSpread.platform + " (" + uniswapCoinUsd + "$) \u27A1\uFE0F " + spreads[i].platform + " (" + biboxCoinUsd + "$) \u2757\uFE0F\u2757\uFE0F \n spread: " + this_1.formatFloatToReadableString(Math.abs(uniswapCoinUsd - biboxCoinUsd)) + "$")];
                                            case 37:
                                                _c.sent();
                                                _c.label = 38;
                                            case 38: return [3 /*break*/, 57];
                                            case 39:
                                                this_1.loggerService.log('from ftx');
                                                return [4 /*yield*/, spread_model_1.Spread.findOne({
                                                        owner: spreads[i].owner,
                                                        coinAddress: spreads[i].coinAddress,
                                                        platform: "uniswap_v2"
                                                    })];
                                            case 40:
                                                uniswapSpread = _c.sent();
                                                uniswapCoin = new sdk_1.Token(sdk_1.ChainId.MAINNET, spreads[i].coinAddress, 18);
                                                return [4 /*yield*/, sdk_1.Fetcher.fetchPairData(uniswapCoin, sdk_1.WETH[uniswapCoin.chainId])];
                                            case 41:
                                                pair = _c.sent();
                                                route = new sdk_1.Route([pair], sdk_1.WETH[uniswapCoin.chainId]);
                                                uniswapCoinEth = parseFloat(route.midPrice.toSignificant(6));
                                                uniswapCoinUsd = ethPrice / uniswapCoinEth;
                                                ftx = new ccxt.ftx;
                                                return [4 /*yield*/, ftx.publicGetMarkets()];
                                            case 42:
                                                ftxTokens = _c.sent();
                                                ftxCoinUsd = ftxTokens.result.find(function (_a) {
                                                    var name = _a.name;
                                                    return name.includes(spreads[i].coinSymbol.toUpperCase());
                                                }).last;
                                                if (!ftxCoinUsd) return [3 /*break*/, 47];
                                                if (!((((Math.abs(uniswapCoinUsd - ftxCoinUsd) / uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && ((ftxCoinUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue)))) return [3 /*break*/, 47];
                                                spreads[i].coinUsdValue = ftxCoinUsd;
                                                uniswapSpread.coinUsdValue = uniswapCoinUsd;
                                                return [4 /*yield*/, spreads[i].save()];
                                            case 43:
                                                _c.sent();
                                                return [4 /*yield*/, uniswapSpread.save()];
                                            case 44:
                                                _c.sent();
                                                return [4 /*yield*/, user_model_1.User.findOne({ _id: spreads[i].owner })];
                                            case 45:
                                                user = _c.sent();
                                                return [4 /*yield*/, this_1.botService.sendMessage(user.tg_chat_id, "\u2757\uFE0F\u2757\uFE0F" + spreads[i].coinSymbol + ": " + uniswapSpread.platform + " (" + uniswapCoinUsd + "$) \u27A1\uFE0F " + spreads[i].platform + " (" + ftxCoinUsd + "$) \u2757\uFE0F\u2757\uFE0F \n spread: " + this_1.formatFloatToReadableString(Math.abs(uniswapCoinUsd - ftxCoinUsd)) + "$")];
                                            case 46:
                                                _c.sent();
                                                _c.label = 47;
                                            case 47: return [3 /*break*/, 57];
                                            case 48:
                                                this_1.loggerService.log('from hotbit');
                                                return [4 /*yield*/, spread_model_1.Spread.findOne({
                                                        owner: spreads[i].owner,
                                                        coinAddress: spreads[i].coinAddress,
                                                        platform: "uniswap_v2"
                                                    })];
                                            case 49:
                                                uniswapSpread = _c.sent();
                                                uniswapCoin = new sdk_1.Token(sdk_1.ChainId.MAINNET, spreads[i].coinAddress, 18);
                                                return [4 /*yield*/, sdk_1.Fetcher.fetchPairData(uniswapCoin, sdk_1.WETH[uniswapCoin.chainId])];
                                            case 50:
                                                pair = _c.sent();
                                                route = new sdk_1.Route([pair], sdk_1.WETH[uniswapCoin.chainId]);
                                                uniswapCoinEth = parseFloat(route.midPrice.invert().toSignificant(18));
                                                uniswapCoinUsd = ethPrice * uniswapCoinEth;
                                                return [4 /*yield*/, this_1.requestService.get("" + this_1.HOTBIT_MARKET_DATA_API_URL + spreads[i].coinSymbol.toUpperCase() + "/USDT")];
                                            case 51:
                                                hotbitToken = _c.sent();
                                                hotbitCoinUsd = hotbitToken.data.result;
                                                if (!hotbitCoinUsd) return [3 /*break*/, 56];
                                                if (!((((Math.abs(uniswapCoinUsd - hotbitCoinUsd) / uniswapCoinUsd) * 100) >= spreads[i].spreadChange) && ((hotbitCoinUsd != spreads[i].coinUsdValue) || (uniswapCoinUsd != uniswapSpread.coinUsdValue)))) return [3 /*break*/, 56];
                                                spreads[i].coinUsdValue = hotbitCoinUsd;
                                                uniswapSpread.coinUsdValue = uniswapCoinUsd;
                                                return [4 /*yield*/, spreads[i].save()];
                                            case 52:
                                                _c.sent();
                                                return [4 /*yield*/, uniswapSpread.save()];
                                            case 53:
                                                _c.sent();
                                                return [4 /*yield*/, user_model_1.User.findOne({ _id: spreads[i].owner })];
                                            case 54:
                                                user = _c.sent();
                                                return [4 /*yield*/, this_1.botService.sendMessage(user.tg_chat_id, "\u2757\uFE0F\u2757\uFE0F" + spreads[i].coinSymbol + ": " + uniswapSpread.platform + " (" + uniswapCoinUsd + "$) \u27A1\uFE0F " + spreads[i].platform + " (" + this_1.formatFloatToReadableString(hotbitCoinUsd) + "$) \u2757\uFE0F\u2757\uFE0F \n spread: " + this_1.formatFloatToReadableString(Math.abs(uniswapCoinUsd - hotbitCoinUsd)) + "$")];
                                            case 55:
                                                _c.sent();
                                                _c.label = 56;
                                            case 56: return [3 /*break*/, 57];
                                            case 57: return [2 /*return*/];
                                        }
                                    });
                                };
                                this_1 = this;
                                i = 0;
                                _a.label = 3;
                            case 3:
                                if (!(i < spreads.length)) return [3 /*break*/, 6];
                                return [5 /*yield**/, _loop_1(i)];
                            case 4:
                                _a.sent();
                                _a.label = 5;
                            case 5:
                                i++;
                                return [3 /*break*/, 3];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    SpreadService.prototype.formatFloatToReadableString = function (value) {
        var stringValue = value.toString();
        if (stringValue.includes('e')) {
            var arrValue = stringValue.split('e-');
            var result = "0." + '0'.repeat(+arrValue[1] - arrValue[0].length) + arrValue[0];
            return result;
        }
        else
            return stringValue;
    };
    SpreadService.prototype.formatFloatToReadableFloat = function (value) {
        var stringValue = value.toString();
        if (stringValue.includes('e')) {
            var arrValue = stringValue.split('e-');
            var result = "0." + '0'.repeat(+arrValue[1] - arrValue[0].length) + arrValue[0];
            return parseFloat(result);
        }
        else
            return value;
    };
    return SpreadService;
}());
exports.SpreadService = SpreadService;
//# sourceMappingURL=spread.service.js.map