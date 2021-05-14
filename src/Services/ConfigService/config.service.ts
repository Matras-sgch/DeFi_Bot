import { config } from "dotenv";

export interface IConfigService {
    get<T>(key: string): T;
}

export interface ApplicationConfig {
    POOLS_API_KEY: string;
    COINMARKETCAP_KEY: string;
    ETHERSCAN_KEY: string;
    BOT_TOKEN: string;
    MONGODB_URL: string;
}

export class ConfigService implements IConfigService {
    private readonly config: ApplicationConfig;

    constructor() {
        config();
        this.config = {
            POOLS_API_KEY: String(process.env.POOLS_API_KEY),
            COINMARKETCAP_KEY: String(process.env.COINMARKETCAP_KEY),
            ETHERSCAN_KEY: String(process.env.ETHERSCAN_KEY),
            BOT_TOKEN: String(process.env.BOT_TOKEN),
            MONGODB_URL: String(process.env.MONGODB_URL),
        }
    }

    public get<T>(key: string) {
        // @ts-ignore
        return this.config[key];
    }
}