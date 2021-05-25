import {IRequestService} from "../RequestService/request.service";
import {IConfigService} from "../ConfigService/config.service";
import {Coin} from "../../models/coin/coin.model";
import {ICoin} from "../../interfaces/coin/coin.interface";
import {IUserService} from "../UserService/user.service";
import {ICoinInfo} from "../../interfaces/coin/coinInfo.interface";
import {ISpreadService} from "../spreadService/spread.service";


export interface ICoinService {
    get(tgUserId: string): Promise<Array<ICoinInfo>>;
    add(tgUserId: string, address: string, spreadChange: string): Promise<ICoin | null>;
    getCoinByAddress(tgUserId: string, address: string): Promise<ICoinInfo>;
}


export class CoinService implements ICoinService {
    private readonly COINlIST_DATA_API_URL: string = `https://api.coingecko.com/api/v3/coins/list?include_platform=true`;
    private readonly COIN_DATA_API_URL: string = `https://api.coingecko.com/api/v3/coins/`;

    constructor(
        private readonly configService: IConfigService,
        private readonly requestService: IRequestService,
        private readonly userService: IUserService,
        private readonly spreadService: ISpreadService,
    ) {}

    public async get(tgUserId: string): Promise<Array<ICoinInfo>> {
        const user = await this.userService.getUserByTgId(tgUserId);
        if (!user) return null;
        const coins: ICoin[] = await Coin.find({ owner: user._id });
        if (coins.length === 0) return null;
        const coinList: any = await this.requestService.get(this.COINlIST_DATA_API_URL);

        let coinsFromList = [];

        coins.forEach(coin => {
            const coinFromList = coinList.data.find(
                ({ platforms }) => platforms.ethereum === coin.coinAddress.toLowerCase()
            );
            if (!coinFromList) return;
            coinsFromList.push(coinFromList);
        });

        let coinsData = [];

        for(let i = 0; i < coinsFromList.length; i++) {
            const coinData: any = await this.requestService.get(this.COIN_DATA_API_URL+coinsFromList[i].id);
            coinsData.push(coinData.data)
        }

        let res: ICoinInfo[] = [];
        coinsData.forEach(coin => {
            const uniswapMarket = coin.tickers.findIndex(({ market }) => market.identifier === "uniswap_v2");
            res.push({ name: coin.symbol, usdLiquidity: this.formatFloatToReadableString(coin.tickers[uniswapMarket].converted_last.usd), ethLiquidity: this.formatFloatToReadableString(coin.tickers[uniswapMarket].converted_last.eth), coinAddress: coin.platforms.ethereum })
        })

        return res;
    }

    public async getCoinByAddress(tgUserId: string, address: string): Promise<ICoinInfo | null> {
        const user = await this.userService.getUserByTgId(tgUserId);
        if (!user) return null;
        const coin: ICoin= await Coin.findOne({ owner: user._id, coinAddress: address });
        if (!coin) return null;
        const coinList: any = await this.requestService.get(this.COINlIST_DATA_API_URL);
        const coinFromList = coinList.data.find(
            ({ platforms }) => platforms.ethereum === coin.coinAddress.toLowerCase()
        );
        if (!coinFromList) return null;

        const coinData: any = await this.requestService.get(this.COIN_DATA_API_URL+coinFromList.id);

        const uniswapMarket = coinData.data.tickers.findIndex(({ market }) => market.identifier === "uniswap_v2");

        return {
            name: coinData.data.symbol,
            usdLiquidity: coinData.data.tickers[uniswapMarket].converted_last.usd,
            ethLiquidity: coinData.data.tickers[uniswapMarket].converted_last.eth,
            coinAddress: coinData.data.platforms.ethereum
        }
    }

    public async add(tgUserId: string, address: string, spreadChange: string): Promise<ICoin | null> {
        const addressTemplate = /^0x[a-fA-F0-9]{40}$/;
        const percentageTemplate = /^[0-9]*[.,]?[0-9]+$/;
        if (!percentageTemplate.test(spreadChange)) return null;
        if (!addressTemplate.test(address)) return null;
        const user = await this.userService.getUserByTgId(tgUserId);
        if (!user) return null;

        const coin = await Coin.findOne({ coinAddress: address, owner: user._id });

        if (coin) return null;
        const newCoin = new Coin({
            coinAddress: address,
            owner: user._id,
        });

        const coinList: any =await this.requestService.get(this.COINlIST_DATA_API_URL);
        const coinFromList = coinList.data.find(
            ({ platforms }) => platforms.ethereum === address.toLowerCase()
        );
        if (!coinFromList) return null;

        const coinData: any = await this.requestService.get(this.COIN_DATA_API_URL+coinFromList.id);
        // if (coinData.data.market_data.current_price.usd < 0.000001) {
        //     return null
        // }

        const spreads = await this.spreadService.addSpreads(user.tg_chat_id, address, parseFloat(spreadChange));
        if (!spreads) return null;

        await newCoin.save();
        return newCoin;
    }

    private formatFloatToReadableString (value: number): string {
        const stringValue = value.toString();
        if(stringValue.includes('e')) {

            const arrValue = stringValue.split('e-');
            const result = `0.${'0'.repeat(+arrValue[1]-arrValue[0].length)}${arrValue[0]}`;
            return result;
        } else return stringValue
    }
}