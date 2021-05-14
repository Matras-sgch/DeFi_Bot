"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformService = void 0;
var platform_service_constants_1 = require("./platform.service.constants");
var PlatformService = /** @class */ (function () {
    function PlatformService() {
    }
    PlatformService.prototype.get = function () {
        return platform_service_constants_1.SUPPORTED_PLATFORMS;
    };
    return PlatformService;
}());
exports.PlatformService = PlatformService;
//# sourceMappingURL=platform.service.js.map