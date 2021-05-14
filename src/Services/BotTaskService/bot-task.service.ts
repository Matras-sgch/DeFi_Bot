import {IBotService} from "../BotService/bot.service";
import {IDatabaseService} from "../DatabaseService/database.service";
import {ICoinService} from "../CoinService/coin.service";
import {IUserService} from "../UserService/user.service";
import {ISpreadService} from "../spreadService/spread.service";
import {IPoolService} from "../PoolService/pool.service";
import {IRequestService} from "../RequestService/request.service";
import {IConfigService} from "../ConfigService/config.service";


export interface IBotTaskService {
    getGas (): Promise<string>;
    getFunding (): Promise<string>;
}

export class BotTaskService implements IBotTaskService {
    private readonly GAS_DATA_API_URL: string = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=`;
    private readonly FUNDING_DATA_API_URL: string = `https://fapi.binance.com/fapi/v1/fundingRate`;

    constructor(
        private readonly botService: IBotService,
        private readonly coinService: ICoinService,
        private readonly userService: IUserService,
        private readonly spreadService: ISpreadService,
        private readonly poolService: IPoolService,
        private readonly databaseService: IDatabaseService,
        private readonly requestService: IRequestService,
        private readonly configService: IConfigService,
    ) {}

    public async getGas (): Promise<string> {
        const gasResp: any = await this.requestService.get(
            this.GAS_DATA_API_URL+this.configService.get<string>('ETHERSCAN_KEY')
        );
        const gas = `fast - ${gasResp.data.result.FastGasPrice} 
Average - ${gasResp.data.result.ProposeGasPrice}
Low - ${gasResp.data.result.SafeGasPrice}`;
        return gas;
    }

    public async getFunding (): Promise<string> {
        const fundingResp: any = await this.requestService.get(
            this.FUNDING_DATA_API_URL
        );

        let funding = "Binance Futures and Funding rates: ";

        fundingResp.data.forEach(
            (element) =>
                (funding +=
                    "\n " + element.symbol + ": " + element.fundingRate * 100 + ";")
        );

        return funding;
    }
}