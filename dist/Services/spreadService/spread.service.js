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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpreadService = void 0;
var spread_model_1 = require("../../models/spread/spread.model");
var user_model_1 = require("../../models/user/user.model");
var cron = __importStar(require("node-cron"));
var SpreadService = /** @class */ (function () {
    function SpreadService(configService, requestService, platformService, userService, botService) {
        this.configService = configService;
        this.requestService = requestService;
        this.platformService = platformService;
        this.userService = userService;
        this.botService = botService;
        this.COINlIST_DATA_API_URL = "https://api.coingecko.com/api/v3/coins/list?include_platform=true";
        this.COIN_DATA_API_URL = "https://api.coingecko.com/api/v3/coins/";
    }
    SpreadService.prototype.addSpreads = function (tgUserId, coinAddress, spreadChange) {
        return __awaiter(this, void 0, void 0, function () {
            var user, coinsList, supportedPlatforms, coinFromList, coinData, spreads, _loop_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userService.getUserByTgId(tgUserId)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.requestService.get(this.COINlIST_DATA_API_URL)];
                    case 2:
                        coinsList = _a.sent();
                        supportedPlatforms = this.platformService.get();
                        coinFromList = coinsList.data.find(function (_a) {
                            var platforms = _a.platforms;
                            return platforms.ethereum === coinAddress.toLowerCase();
                        });
                        return [4 /*yield*/, this.requestService.get(this.COIN_DATA_API_URL + coinFromList.id)];
                    case 3:
                        coinData = _a.sent();
                        spreads = [];
                        _loop_1 = function (i) {
                            var platformSpread, oldSpread, spread;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        platformSpread = coinData.data.tickers.find(function (_a) {
                                            var market = _a.market;
                                            return supportedPlatforms[i] === market.identifier;
                                        });
                                        if (!platformSpread) return [3 /*break*/, 3];
                                        return [4 /*yield*/, spread_model_1.Spread.findOne({
                                                coinAddress: coinAddress,
                                                platform: supportedPlatforms[i],
                                                owner: user._id
                                            })];
                                    case 1:
                                        oldSpread = _b.sent();
                                        if (!!oldSpread) return [3 /*break*/, 3];
                                        spread = new spread_model_1.Spread({
                                            coinAddress: coinAddress,
                                            platform: supportedPlatforms[i],
                                            spreadValue: platformSpread.bid_ask_spread_percentage,
                                            spreadChange: spreadChange,
                                            coinUsdValue: platformSpread.converted_last.usd,
                                            owner: user._id
                                        });
                                        spreads.push(spread);
                                        return [4 /*yield*/, spread.save()];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < supportedPlatforms.length)) return [3 /*break*/, 7];
                        return [5 /*yield**/, _loop_1(i)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, spreads];
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
    SpreadService.prototype.compareSpreads = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                cron.schedule("5 * * * * *", function () { return __awaiter(_this, void 0, void 0, function () {
                    var coinList, spreads, _loop_2, this_1, i;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log('from compare spreads');
                                return [4 /*yield*/, this.requestService.get(this.COINlIST_DATA_API_URL)];
                            case 1:
                                coinList = _a.sent();
                                console.log('after request');
                                return [4 /*yield*/, spread_model_1.Spread.find()];
                            case 2:
                                spreads = _a.sent();
                                _loop_2 = function (i) {
                                    var uniswapSpread, coin, coinData, platformMarket, uniswapMarket, user;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                if (!!(spreads[i].platform === "uniswap")) return [3 /*break*/, 6];
                                                return [4 /*yield*/, spread_model_1.Spread.findOne({
                                                        owner: spreads[i].owner,
                                                        coinAddress: spreads[i].coinAddress,
                                                        platform: "uniswap"
                                                    })];
                                            case 1:
                                                uniswapSpread = _b.sent();
                                                coin = coinList.data.find(function (_a) {
                                                    var platforms = _a.platforms;
                                                    return platforms.ethereum === spreads[i].coinAddress.toLowerCase();
                                                });
                                                return [4 /*yield*/, this_1.requestService.get(this_1.COIN_DATA_API_URL + coin.id)];
                                            case 2:
                                                coinData = _b.sent();
                                                platformMarket = coinData.data.tickers.find(function (_a) {
                                                    var market = _a.market;
                                                    return spreads[i].platform === market.identifier;
                                                });
                                                uniswapMarket = coinData.data.tickers.find(function (_a) {
                                                    var market = _a.market;
                                                    return market.identifier === "uniswap";
                                                });
                                                if (!!(!platformMarket || (spreads[i].coinUsdValue === platformMarket.converted_last.usd && uniswapSpread.coinUsdValue === uniswapMarket.converted_last.usd))) return [3 /*break*/, 6];
                                                if (!(((Math.abs(uniswapMarket.converted_last.usd - platformMarket.converted_last.usd) / uniswapMarket.converted_last.usd) * 100) >= spreads[i].spreadChange)) return [3 /*break*/, 6];
                                                spreads[i].coinUsdValue = platformMarket.converted_last.usd;
                                                uniswapSpread.coinUsdValue = uniswapMarket.converted_last.usd;
                                                return [4 /*yield*/, uniswapSpread.save()];
                                            case 3:
                                                _b.sent();
                                                return [4 /*yield*/, spreads[i].save()];
                                            case 4:
                                                _b.sent();
                                                return [4 /*yield*/, user_model_1.User.findOne({ _id: spreads[i].owner })];
                                            case 5:
                                                user = _b.sent();
                                                this_1.botService.sendMessage(user.tg_chat_id, "\u2757\uFE0F\u2757\uFE0F" + coinData.data.symbol + ": " + uniswapMarket.market.identifier + " (" + uniswapMarket.converted_last.usd + "$) \u27A1\uFE0F " + platformMarket.market.identifier + " (" + platformMarket.converted_last.usd + "$) \u2757\uFE0F\u2757\uFE0F \n spread: " + Math.abs(uniswapMarket.converted_last.usd - platformMarket.converted_last.usd) + "$");
                                                _b.label = 6;
                                            case 6: return [2 /*return*/];
                                        }
                                    });
                                };
                                this_1 = this;
                                i = 0;
                                _a.label = 3;
                            case 3:
                                if (!(i < spreads.length)) return [3 /*break*/, 6];
                                return [5 /*yield**/, _loop_2(i)];
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
    return SpreadService;
}());
exports.SpreadService = SpreadService;
//# sourceMappingURL=spread.service.js.map