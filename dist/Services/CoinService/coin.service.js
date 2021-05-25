"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinService = void 0;
var coin_model_1 = require("../../models/coin/coin.model");
var CoinService = /** @class */ (function () {
    function CoinService(configService, requestService, userService, spreadService) {
        this.configService = configService;
        this.requestService = requestService;
        this.userService = userService;
        this.spreadService = spreadService;
        this.COINlIST_DATA_API_URL = "https://api.coingecko.com/api/v3/coins/list?include_platform=true";
        this.COIN_DATA_API_URL = "https://api.coingecko.com/api/v3/coins/";
    }
    CoinService.prototype.get = function (tgUserId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, coins, coinList, coinsFromList, coinsData, i, coinData, res;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userService.getUserByTgId(tgUserId)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, coin_model_1.Coin.find({ owner: user._id })];
                    case 2:
                        coins = _a.sent();
                        if (coins.length === 0)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.requestService.get(this.COINlIST_DATA_API_URL)];
                    case 3:
                        coinList = _a.sent();
                        coinsFromList = [];
                        coins.forEach(function (coin) {
                            var coinFromList = coinList.data.find(function (_a) {
                                var platforms = _a.platforms;
                                return platforms.ethereum === coin.coinAddress.toLowerCase();
                            });
                            if (!coinFromList)
                                return;
                            coinsFromList.push(coinFromList);
                        });
                        coinsData = [];
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < coinsFromList.length)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.requestService.get(this.COIN_DATA_API_URL + coinsFromList[i].id)];
                    case 5:
                        coinData = _a.sent();
                        coinsData.push(coinData.data);
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 4];
                    case 7:
                        res = [];
                        coinsData.forEach(function (coin) {
                            var uniswapMarket = coin.tickers.findIndex(function (_a) {
                                var market = _a.market;
                                return market.identifier === "uniswap_v2";
                            });
                            res.push({ name: coin.symbol, usdLiquidity: _this.formatFloatToReadableString(coin.tickers[uniswapMarket].converted_last.usd), ethLiquidity: _this.formatFloatToReadableString(coin.tickers[uniswapMarket].converted_last.eth), coinAddress: coin.platforms.ethereum });
                        });
                        return [2 /*return*/, res];
                }
            });
        });
    };
    CoinService.prototype.getCoinByAddress = function (tgUserId, address) {
        return __awaiter(this, void 0, void 0, function () {
            var user, coin, coinList, coinFromList, coinData, uniswapMarket;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userService.getUserByTgId(tgUserId)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, coin_model_1.Coin.findOne({ owner: user._id, coinAddress: address })];
                    case 2:
                        coin = _a.sent();
                        if (!coin)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.requestService.get(this.COINlIST_DATA_API_URL)];
                    case 3:
                        coinList = _a.sent();
                        coinFromList = coinList.data.find(function (_a) {
                            var platforms = _a.platforms;
                            return platforms.ethereum === coin.coinAddress.toLowerCase();
                        });
                        if (!coinFromList)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.requestService.get(this.COIN_DATA_API_URL + coinFromList.id)];
                    case 4:
                        coinData = _a.sent();
                        uniswapMarket = coinData.data.tickers.findIndex(function (_a) {
                            var market = _a.market;
                            return market.identifier === "uniswap_v2";
                        });
                        return [2 /*return*/, {
                                name: coinData.data.symbol,
                                usdLiquidity: coinData.data.tickers[uniswapMarket].converted_last.usd,
                                ethLiquidity: coinData.data.tickers[uniswapMarket].converted_last.eth,
                                coinAddress: coinData.data.platforms.ethereum
                            }];
                }
            });
        });
    };
    CoinService.prototype.add = function (tgUserId, address, spreadChange) {
        return __awaiter(this, void 0, void 0, function () {
            var addressTemplate, percentageTemplate, user, coin, newCoin, coinList, coinFromList, coinData, spreads;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addressTemplate = /^0x[a-fA-F0-9]{40}$/;
                        percentageTemplate = /^[0-9]*[.,]?[0-9]+$/;
                        if (!percentageTemplate.test(spreadChange))
                            return [2 /*return*/, null];
                        if (!addressTemplate.test(address))
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.userService.getUserByTgId(tgUserId)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, coin_model_1.Coin.findOne({ coinAddress: address, owner: user._id })];
                    case 2:
                        coin = _a.sent();
                        if (coin)
                            return [2 /*return*/, null];
                        newCoin = new coin_model_1.Coin({
                            coinAddress: address,
                            owner: user._id,
                        });
                        return [4 /*yield*/, this.requestService.get(this.COINlIST_DATA_API_URL)];
                    case 3:
                        coinList = _a.sent();
                        coinFromList = coinList.data.find(function (_a) {
                            var platforms = _a.platforms;
                            return platforms.ethereum === address.toLowerCase();
                        });
                        if (!coinFromList)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.requestService.get(this.COIN_DATA_API_URL + coinFromList.id)];
                    case 4:
                        coinData = _a.sent();
                        if (coinData.data.market_data.current_price.usd < 0.000001) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.spreadService.addSpreads(user.tg_chat_id, address, parseFloat(spreadChange))];
                    case 5:
                        spreads = _a.sent();
                        if (!spreads)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, newCoin.save()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, newCoin];
                }
            });
        });
    };
    CoinService.prototype.formatFloatToReadableString = function (value) {
        var stringValue = value.toString();
        if (stringValue.includes('e')) {
            var arrValue = stringValue.split('e-');
            var result = "0." + '0'.repeat(+arrValue[1] - arrValue[0].length) + arrValue[0];
            return result;
        }
        else
            return stringValue;
    };
    return CoinService;
}());
exports.CoinService = CoinService;
//# sourceMappingURL=coin.service.js.map