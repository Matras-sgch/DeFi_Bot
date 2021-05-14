"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
var node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
var BotService = /** @class */ (function () {
    function BotService(configService) {
        this.configService = configService;
        var token = configService.get('BOT_TOKEN');
        this.bot = new node_telegram_bot_api_1.default(token, { polling: true });
    }
    BotService.prototype.onText = function (regexp, callback) {
        this.bot.onText(regexp, callback);
    };
    BotService.prototype.sendMessage = function (chatId, text) {
        return this.bot.sendMessage(chatId, text);
    };
    return BotService;
}());
exports.BotService = BotService;
//# sourceMappingURL=bot.service.js.map