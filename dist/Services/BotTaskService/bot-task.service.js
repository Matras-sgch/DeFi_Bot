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
exports.BotTaskService = void 0;
var BotTaskService = /** @class */ (function () {
    function BotTaskService(botService, coinService, userService, spreadService, poolService, databaseService, requestService, configService) {
        this.botService = botService;
        this.coinService = coinService;
        this.userService = userService;
        this.spreadService = spreadService;
        this.poolService = poolService;
        this.databaseService = databaseService;
        this.requestService = requestService;
        this.configService = configService;
        this.GAS_DATA_API_URL = "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=";
        this.FUNDING_DATA_API_URL = "https://fapi.binance.com/fapi/v1/fundingRate";
    }
    BotTaskService.prototype.getGas = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gasResp, gas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requestService.get(this.GAS_DATA_API_URL + this.configService.get('ETHERSCAN_KEY'))];
                    case 1:
                        gasResp = _a.sent();
                        gas = "fast - " + gasResp.data.result.FastGasPrice + " \nAverage - " + gasResp.data.result.ProposeGasPrice + "\nLow - " + gasResp.data.result.SafeGasPrice;
                        return [2 /*return*/, gas];
                }
            });
        });
    };
    BotTaskService.prototype.getFunding = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fundingResp, funding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requestService.get(this.FUNDING_DATA_API_URL)];
                    case 1:
                        fundingResp = _a.sent();
                        funding = "Binance Futures and Funding rates: ";
                        fundingResp.data.forEach(function (element) {
                            return (funding +=
                                "\n " + element.symbol + ": " + element.fundingRate * 100 + ";");
                        });
                        return [2 /*return*/, funding];
                }
            });
        });
    };
    return BotTaskService;
}());
exports.BotTaskService = BotTaskService;
//# sourceMappingURL=bot-task.service.js.map