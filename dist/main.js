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
var config_service_1 = require("./Services/ConfigService/config.service");
var database_service_1 = require("./Services/DatabaseService/database.service");
var bot_service_1 = require("./Services/BotService/bot.service");
var bot_task_service_1 = require("./Services/BotTaskService/bot-task.service");
var platform_service_1 = require("./Services/PlatformService/platform.service");
var pool_service_1 = require("./Services/PoolService/pool.service");
var logger_service_1 = require("./Services/LoggerService/logger.service");
var coin_service_1 = require("./Services/CoinService/coin.service");
var request_service_1 = require("./Services/RequestService/request.service");
var user_service_1 = require("./Services/UserService/user.service");
var spread_service_1 = require("./Services/spreadService/spread.service");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var configService, loggerService, requestService, databaseService, platformService, botService, userService, spreadService, poolService, coinService, botTaskService;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                configService = new config_service_1.ConfigService();
                loggerService = new logger_service_1.LoggerService();
                requestService = new request_service_1.RequestService();
                databaseService = new database_service_1.DatabaseService(configService);
                return [4 /*yield*/, databaseService.connect()];
            case 1:
                _a.sent();
                platformService = new platform_service_1.PlatformService();
                botService = new bot_service_1.BotService(configService);
                userService = new user_service_1.UserService();
                spreadService = new spread_service_1.SpreadService(configService, requestService, platformService, userService, botService, loggerService);
                poolService = new pool_service_1.PoolService(configService, requestService, userService, botService, loggerService);
                coinService = new coin_service_1.CoinService(configService, requestService, userService, spreadService);
                botTaskService = new bot_task_service_1.BotTaskService(botService, coinService, userService, spreadService, poolService, databaseService, requestService, configService);
                // const poolAssets: unknown[] = await poolService.getPoolAssets();
                // loggerService.log(poolAssets);
                botService.onText(/\/start/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, user;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = msg.chat.id;
                                return [4 /*yield*/, userService.add(id.toString())];
                            case 1:
                                user = _a.sent();
                                if (!user) return [3 /*break*/, 3];
                                return [4 /*yield*/, botService.sendMessage(id, 'New user was created!')];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 5];
                            case 3: return [4 /*yield*/, botService.sendMessage(id, 'The user exists')];
                            case 4:
                                _a.sent();
                                _a.label = 5;
                            case 5: return [2 /*return*/];
                        }
                    });
                }); });
                botService.onText(/\/addCoin/, function (msg, data) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, _a, source, address, spreadChange, coin;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                id = msg.chat.id;
                                _a = data.input.split(' '), source = _a[0], address = _a[1], spreadChange = _a[2];
                                return [4 /*yield*/, coinService.add(id.toString(), address, spreadChange)];
                            case 1:
                                coin = _b.sent();
                                if (!!coin) return [3 /*break*/, 3];
                                return [4 /*yield*/, botService.sendMessage(id, "problem with adding coin. Maybe: send /start command; wrong coin address; wrong spread persentage; you track this coin; we don't support this coin.")];
                            case 2:
                                _b.sent();
                                return [3 /*break*/, 5];
                            case 3: return [4 /*yield*/, botService.sendMessage(id, 'The coin was added!')];
                            case 4:
                                _b.sent();
                                _b.label = 5;
                            case 5: return [2 /*return*/];
                        }
                    });
                }); });
                botService.onText(/\/editSpreads/, function (msg, data) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, _a, source, address, spreadChange, spreads;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                id = msg.chat.id;
                                _a = data.input.split(' '), source = _a[0], address = _a[1], spreadChange = _a[2];
                                return [4 /*yield*/, spreadService.editSpreads(id.toString(), address, spreadChange)];
                            case 1:
                                spreads = _b.sent();
                                if (!!spreads) return [3 /*break*/, 3];
                                return [4 /*yield*/, botService.sendMessage(id, 'problem with editing spreads. Maybe: send /start command; wrong coin address; wrong spread persentage.')];
                            case 2:
                                _b.sent();
                                return [3 /*break*/, 5];
                            case 3: return [4 /*yield*/, botService.sendMessage(id, 'Spreads were changed!')];
                            case 4:
                                _b.sent();
                                _b.label = 5;
                            case 5: return [2 /*return*/];
                        }
                    });
                }); });
                botService.onText(/\/coins/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, coins, message_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = msg.chat.id;
                                return [4 /*yield*/, coinService.get(id.toString())];
                            case 1:
                                coins = _a.sent();
                                if (!!coins) return [3 /*break*/, 3];
                                return [4 /*yield*/, botService.sendMessage(id, "You don't track any coin")];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 5];
                            case 3:
                                message_1 = "coins \n";
                                coins.forEach(function (_a) {
                                    var name = _a.name, usdLiquidity = _a.usdLiquidity, ethLiquidity = _a.ethLiquidity, coinAddress = _a.coinAddress;
                                    return message_1 += "\nname: " + name + ", \nusdLiquidity: " + usdLiquidity + "$, \nethLiquidity: " + ethLiquidity + "\uD83D\uDC8E, \ncoin address: " + coinAddress + "\n";
                                });
                                return [4 /*yield*/, botService.sendMessage(id, message_1)];
                            case 4:
                                _a.sent();
                                _a.label = 5;
                            case 5: return [2 /*return*/];
                        }
                    });
                }); });
                botService.onText(/\/getCoin/, function (msg, data) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, _a, source, address, coin;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                id = msg.chat.id;
                                _a = data.input.split(' '), source = _a[0], address = _a[1];
                                return [4 /*yield*/, coinService.getCoinByAddress(id.toString(), address)];
                            case 1:
                                coin = _b.sent();
                                if (!!coin) return [3 /*break*/, 3];
                                return [4 /*yield*/, botService.sendMessage(id, "You don't track this coin")];
                            case 2:
                                _b.sent();
                                return [3 /*break*/, 5];
                            case 3: return [4 /*yield*/, botService.sendMessage(id, "name: " + coin.name + ", \nusdLiquidity: " + coin.usdLiquidity + "$, \nethLiquidity: " + coin.ethLiquidity + ", \ncoin address: " + coin.coinAddress)];
                            case 4:
                                _b.sent();
                                _b.label = 5;
                            case 5: return [2 /*return*/];
                        }
                    });
                }); });
                botService.onText(/\/addPool/, function (msg, data) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, _a, source, address, assetsChange, pool;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                id = msg.chat.id;
                                _a = data.input.split(' '), source = _a[0], address = _a[1], assetsChange = _a[2];
                                return [4 /*yield*/, poolService.addPool(id.toString(), address, assetsChange)];
                            case 1:
                                pool = _b.sent();
                                if (!!pool) return [3 /*break*/, 3];
                                return [4 /*yield*/, botService.sendMessage(id, "problem with adding pool. Maybe: send /start command; wrong pool address; wrong asset change persentage; you track this pool; we don't support this pool.")];
                            case 2:
                                _b.sent();
                                return [3 /*break*/, 5];
                            case 3: return [4 /*yield*/, botService.sendMessage(id, 'The pool was added!')];
                            case 4:
                                _b.sent();
                                _b.label = 5;
                            case 5: return [2 /*return*/];
                        }
                    });
                }); });
                botService.onText(/\/editPool/, function (msg, data) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, _a, source, address, assetsChange, pool;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                id = msg.chat.id;
                                _a = data.input.split(' '), source = _a[0], address = _a[1], assetsChange = _a[2];
                                return [4 /*yield*/, poolService.editPool(id.toString(), address, assetsChange)];
                            case 1:
                                pool = _b.sent();
                                if (!!pool) return [3 /*break*/, 3];
                                return [4 /*yield*/, botService.sendMessage(id, "problem with editing pool. Maybe: send /start command; wrong pool address; wrong asset change persentage; you don't track this pool.")];
                            case 2:
                                _b.sent();
                                return [3 /*break*/, 5];
                            case 3: return [4 /*yield*/, botService.sendMessage(id, 'The pool was edited!')];
                            case 4:
                                _b.sent();
                                _b.label = 5;
                            case 5: return [2 /*return*/];
                        }
                    });
                }); });
                botService.onText(/\/funding/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, funding;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = msg.chat.id;
                                return [4 /*yield*/, botTaskService.getFunding()];
                            case 1:
                                funding = _a.sent();
                                return [4 /*yield*/, botService.sendMessage(id, funding)];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                botService.onText(/\/gas/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, gas;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = msg.chat.id;
                                return [4 /*yield*/, botTaskService.getGas()];
                            case 1:
                                gas = _a.sent();
                                return [4 /*yield*/, botService.sendMessage(id, gas)];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                spreadService.compareSpreads();
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=main.js.map