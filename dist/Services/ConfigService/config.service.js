"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
var dotenv_1 = require("dotenv");
var ConfigService = /** @class */ (function () {
    function ConfigService() {
        dotenv_1.config();
        this.config = {
            POOLS_API_KEY: String(process.env.POOLS_API_KEY),
            COINMARKETCAP_KEY: String(process.env.COINMARKETCAP_KEY),
            ETHERSCAN_KEY: String(process.env.ETHERSCAN_KEY),
            BOT_TOKEN: String(process.env.BOT_TOKEN),
            MONGODB_URL: String(process.env.MONGODB_URL),
        };
    }
    ConfigService.prototype.get = function (key) {
        // @ts-ignore
        return this.config[key];
    };
    return ConfigService;
}());
exports.ConfigService = ConfigService;
//# sourceMappingURL=config.service.js.map