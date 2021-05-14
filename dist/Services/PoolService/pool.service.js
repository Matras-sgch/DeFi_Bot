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
exports.PoolService = void 0;
var pool_service_constants_1 = require("./pool.service.constants");
var sdk_1 = require("@uniswap/sdk");
var pool_model_1 = require("../../models/pool/pool.model");
var user_model_1 = require("../../models/user/user.model");
var cron = __importStar(require("node-cron"));
var PoolService = /** @class */ (function () {
    function PoolService(configService, requestService, userService, botService) {
        this.configService = configService;
        this.requestService = requestService;
        this.userService = userService;
        this.botService = botService;
        this.POOL_DATA_API_URL = "https://data-api.defipulse.com/api/v1/blocklytics/pools/v1/exchanges";
        this.ETH_PRICE_API_URL = "https://api.etherscan.io/api?module=stats&action=ethprice";
        this.COINlIST_DATA_API_URL = "https://api.coingecko.com/api/v3/coins/list?include_platform=true";
    }
    PoolService.prototype.getPoolAssets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supportedPoolExchanges, poolsApiKey, pools, assets, _loop_1, _i, supportedPoolExchanges_1, supportedPoolExchange;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        supportedPoolExchanges = this.getSupportedPoolExchanges();
                        poolsApiKey = this.configService.get('POOLS_API_KEY');
                        return [4 /*yield*/, this.requestService.get(this.POOL_DATA_API_URL + "?api-key=" + poolsApiKey)];
                    case 1:
                        pools = _a.sent();
                        assets = [];
                        _loop_1 = function (supportedPoolExchange) {
                            var pool = pools.data.results.find(function (pool) { return pool.exchange === supportedPoolExchange; });
                            assets.push.apply(assets, pool.assets);
                        };
                        for (_i = 0, supportedPoolExchanges_1 = supportedPoolExchanges; _i < supportedPoolExchanges_1.length; _i++) {
                            supportedPoolExchange = supportedPoolExchanges_1[_i];
                            _loop_1(supportedPoolExchange);
                        }
                        return [2 /*return*/, assets];
                }
            });
        });
    };
    PoolService.prototype.editPool = function (tgUserId, poolAddress, assetChange) {
        return __awaiter(this, void 0, void 0, function () {
            var addressTemplate, percentageTemplate, user, pool;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addressTemplate = /^0x[a-fA-F0-9]{40}$/;
                        percentageTemplate = /^[0-9]*[.,]?[0-9]+$/;
                        if (!percentageTemplate.test(assetChange))
                            return [2 /*return*/, null];
                        if (!addressTemplate.test(poolAddress))
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.userService.getUserByTgId(tgUserId)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, pool_model_1.Pool.findOne({
                                owner: user._id,
                                poolAddress: poolAddress,
                            })];
                    case 2:
                        pool = _a.sent();
                        if (!pool)
                            return [2 /*return*/, null];
                        pool.assetChange = parseFloat(assetChange);
                        return [4 /*yield*/, pool.save()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, pool];
                }
            });
        });
    };
    PoolService.prototype.addPool = function (tgUserId, poolAddress, assetChange) {
        return __awaiter(this, void 0, void 0, function () {
            var addressTemplate, percentageTemplate, user, usersPool, supportedPoolExchanges, poolInSupported, poolsApiKey, ethPriceKey, pools, pool, ethPrice, tokenCourse, i, assetToken, assetPair, assetRoute, assetUsd, floatAssetChange, poolToSave;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addressTemplate = /^0x[a-fA-F0-9]{40}$/;
                        percentageTemplate = /^[0-9]*[.,]?[0-9]+$/;
                        if (!percentageTemplate.test(assetChange))
                            return [2 /*return*/, null];
                        if (!addressTemplate.test(poolAddress))
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.userService.getUserByTgId(tgUserId)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, pool_model_1.Pool.findOne({
                                owner: user._id,
                                poolAddress: poolAddress
                            })];
                    case 2:
                        usersPool = _a.sent();
                        if (usersPool)
                            return [2 /*return*/, null];
                        supportedPoolExchanges = this.getSupportedPoolExchanges();
                        poolInSupported = supportedPoolExchanges.includes(poolAddress);
                        if (!poolInSupported)
                            return [2 /*return*/, null];
                        poolsApiKey = this.configService.get('POOLS_API_KEY');
                        ethPriceKey = this.configService.get('ETHERSCAN_KEY');
                        return [4 /*yield*/, this.requestService.get(this.POOL_DATA_API_URL + "?api-key=" + poolsApiKey)];
                    case 3:
                        pools = _a.sent();
                        pool = pools.data.results.find(function (_a) {
                            var exchange = _a.exchange;
                            return exchange === poolAddress.toLowerCase();
                        });
                        if (!pool)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.requestService.get(this.ETH_PRICE_API_URL + "&apikey=" + ethPriceKey)];
                    case 4:
                        ethPrice = _a.sent();
                        tokenCourse = [];
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < pool.assets.length)) return [3 /*break*/, 9];
                        if (!(pool.assets[i].address === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")) return [3 /*break*/, 6];
                        tokenCourse.push([
                            pool.assets[i].address,
                            parseFloat(ethPrice.data.result.ethusd),
                        ]);
                        return [3 /*break*/, 8];
                    case 6:
                        assetToken = new sdk_1.Token(sdk_1.ChainId.MAINNET, pool.assets[i].address, 18);
                        return [4 /*yield*/, sdk_1.Fetcher.fetchPairData(assetToken, sdk_1.WETH[assetToken.chainId])];
                    case 7:
                        assetPair = _a.sent();
                        assetRoute = new sdk_1.Route([assetPair], sdk_1.WETH[assetToken.chainId]);
                        assetUsd = ethPrice.data.result.ethusd /
                            assetRoute.midPrice.toSignificant(6);
                        tokenCourse.push([pool.assets[i].address, assetUsd]);
                        _a.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 5];
                    case 9:
                        floatAssetChange = parseFloat(assetChange);
                        poolToSave = new pool_model_1.Pool({
                            poolAddress: poolAddress,
                            assetChange: floatAssetChange,
                            usdLiquidity: pool.usdLiquidity,
                            tokenCourse: tokenCourse,
                            owner: user._id
                        });
                        return [4 /*yield*/, poolToSave.save()];
                    case 10:
                        _a.sent();
                        return [2 /*return*/, poolToSave];
                }
            });
        });
    };
    PoolService.prototype.comparePools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                cron.schedule("10 * * * * *", function () { return __awaiter(_this, void 0, void 0, function () {
                    var ethPriceKey, ethPrice, coinList, pools, _loop_2, this_1, i;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log('from compare pools');
                                ethPriceKey = this.configService.get('ETHERSCAN_KEY');
                                return [4 /*yield*/, this.requestService.get(this.ETH_PRICE_API_URL + "&apikey=" + ethPriceKey)];
                            case 1:
                                ethPrice = _a.sent();
                                return [4 /*yield*/, this.requestService.get(this.COINlIST_DATA_API_URL)];
                            case 2:
                                coinList = _a.sent();
                                return [4 /*yield*/, pool_model_1.Pool.find()];
                            case 3:
                                pools = _a.sent();
                                _loop_2 = function (i) {
                                    var user, _loop_3, j;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0: return [4 /*yield*/, user_model_1.User.findOne({ _id: pools[i].owner })];
                                            case 1:
                                                user = _b.sent();
                                                _loop_3 = function (j) {
                                                    var coinFromList, assetToken, assetPair, assetRoute, assetUsd;
                                                    return __generator(this, function (_c) {
                                                        switch (_c.label) {
                                                            case 0:
                                                                coinFromList = coinList.data.find(function (_a) {
                                                                    var platforms = _a.platforms;
                                                                    return platforms.ethereum === pools[i].tokenCourse[j][0].toLowerCase();
                                                                });
                                                                if (!(pools[i].tokenCourse[j][0] === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")) return [3 /*break*/, 7];
                                                                if (!(((Math.abs(pools[i].tokenCourse[j][1] - parseFloat(ethPrice.data.result.ethusd))) / pools[i].tokenCourse[j][1]) >= pools[i].assetChange)) return [3 /*break*/, 6];
                                                                if (!((pools[i].tokenCourse[j][1] - parseFloat(ethPrice.data.result.ethusd)) > 0)) return [3 /*break*/, 3];
                                                                pools[i].tokenCourse[j][1] = parseFloat(ethPrice.data.result.ethusd);
                                                                return [4 /*yield*/, pools[i].save()];
                                                            case 1:
                                                                _c.sent();
                                                                return [4 /*yield*/, this_1.botService.sendMessage(user.tg_chat_id, "\uD83D\uDD3B\uFE0F\uD83D\uDD3B\uFE0F " + coinFromList.id + " is " + pools[i].tokenCourse[j][1] + "$")];
                                                            case 2:
                                                                _c.sent();
                                                                return [3 /*break*/, 6];
                                                            case 3:
                                                                pools[i].tokenCourse[j][1] = parseFloat(ethPrice.data.result.ethusd);
                                                                return [4 /*yield*/, pools[i].save()];
                                                            case 4:
                                                                _c.sent();
                                                                return [4 /*yield*/, this_1.botService.sendMessage(user.tg_chat_id, "\uD83D\uDE80\uD83D\uDE80 " + coinFromList.id + " is " + pools[i].tokenCourse[j][1] + "$")];
                                                            case 5:
                                                                _c.sent();
                                                                _c.label = 6;
                                                            case 6: return [3 /*break*/, 14];
                                                            case 7:
                                                                assetToken = new sdk_1.Token(sdk_1.ChainId.MAINNET, pools[i].tokenCourse[j][0], 18);
                                                                return [4 /*yield*/, sdk_1.Fetcher.fetchPairData(assetToken, sdk_1.WETH[assetToken.chainId])];
                                                            case 8:
                                                                assetPair = _c.sent();
                                                                assetRoute = new sdk_1.Route([assetPair], sdk_1.WETH[assetToken.chainId]);
                                                                assetUsd = ethPrice.data.result.ethusd /
                                                                    assetRoute.midPrice.toSignificant(6);
                                                                if (!(((Math.abs(pools[i].tokenCourse[j][1] - assetUsd)) / pools[i].tokenCourse[j][1]) >= pools[i].assetChange)) return [3 /*break*/, 14];
                                                                if (!((pools[i].tokenCourse[j][1] - assetUsd) > 0)) return [3 /*break*/, 11];
                                                                pools[i].tokenCourse[j][1] = assetUsd;
                                                                return [4 /*yield*/, pools[i].save()];
                                                            case 9:
                                                                _c.sent();
                                                                return [4 /*yield*/, this_1.botService.sendMessage(user.tg_chat_id, "\uD83D\uDD3B\uFE0F\uD83D\uDD3B\uFE0F " + coinFromList.id + " is " + pools[i].tokenCourse[j][1] + "$")];
                                                            case 10:
                                                                _c.sent();
                                                                return [3 /*break*/, 14];
                                                            case 11:
                                                                pools[i].tokenCourse[j][1] = assetUsd;
                                                                return [4 /*yield*/, pools[i].save()];
                                                            case 12:
                                                                _c.sent();
                                                                return [4 /*yield*/, this_1.botService.sendMessage(user.tg_chat_id, "\uD83D\uDE80\uD83D\uDE80 " + coinFromList.id + " is " + pools[i].tokenCourse[j][1] + "$")];
                                                            case 13:
                                                                _c.sent();
                                                                _c.label = 14;
                                                            case 14: return [2 /*return*/];
                                                        }
                                                    });
                                                };
                                                j = 0;
                                                _b.label = 2;
                                            case 2:
                                                if (!(j < pools[i].tokenCourse.length)) return [3 /*break*/, 5];
                                                return [5 /*yield**/, _loop_3(j)];
                                            case 3:
                                                _b.sent();
                                                _b.label = 4;
                                            case 4:
                                                j++;
                                                return [3 /*break*/, 2];
                                            case 5: return [2 /*return*/];
                                        }
                                    });
                                };
                                this_1 = this;
                                i = 0;
                                _a.label = 4;
                            case 4:
                                if (!(i < pools.length)) return [3 /*break*/, 7];
                                return [5 /*yield**/, _loop_2(i)];
                            case 5:
                                _a.sent();
                                _a.label = 6;
                            case 6:
                                i++;
                                return [3 /*break*/, 4];
                            case 7: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    PoolService.prototype.getSupportedPoolExchanges = function () {
        return pool_service_constants_1.SUPPORTED_POOLS;
    };
    return PoolService;
}());
exports.PoolService = PoolService;
//# sourceMappingURL=pool.service.js.map