import {SUPPORTED_PLATFORMS} from "./platform.service.constants";

export interface IPlatformService {
    get(): string[];
}

export class PlatformService implements IPlatformService {
    public get(): string[] {
        return SUPPORTED_PLATFORMS;
    }
}