"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
var LoggerService = /** @class */ (function () {
    function LoggerService() {
        this.transport = console;
    }
    LoggerService.prototype.log = function () {
        var _a;
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        (_a = this.transport).log.apply(_a, data);
    };
    return LoggerService;
}());
exports.LoggerService = LoggerService;
//# sourceMappingURL=logger.service.js.map