import { ConfigService, IConfigService } from "./Services/ConfigService/config.service";
import { DatabaseService, IDatabaseService } from "./Services/DatabaseService/database.service";
import {BotService, IBotService} from "./Services/BotService/bot.service";
import {BotTaskService, IBotTaskService} from "./Services/BotTaskService/bot-task.service";
import {IPlatformService, PlatformService} from "./Services/PlatformService/platform.service";
import {IPoolService, PoolService} from "./Services/PoolService/pool.service";
import {ILoggerService, LoggerService} from "./Services/LoggerService/logger.service";
import {CoinService, ICoinService} from "./Services/CoinService/coin.service";
import {IRequestService, RequestService} from "./Services/RequestService/request.service";
import {IUserService, UserService} from "./Services/UserService/user.service";
import {ISpreadService, SpreadService} from "./Services/spreadService/spread.service";

(async () => {
    const configService: IConfigService = new ConfigService();
    const loggerService: ILoggerService = new LoggerService();
    const requestService: IRequestService = new RequestService();

    const databaseService: IDatabaseService = new DatabaseService(configService);
    await databaseService.connect();

    const platformService: IPlatformService = new PlatformService();
    const botService: IBotService = new BotService(configService);
    const userService: IUserService = new UserService();
    const spreadService: ISpreadService = new SpreadService(configService, requestService, platformService, userService, botService, loggerService);
    const poolService: IPoolService = new PoolService(configService, requestService, userService, botService, loggerService);
    const coinService: ICoinService = new CoinService(configService, requestService, userService, spreadService);

    const botTaskService: IBotTaskService = new BotTaskService(botService, coinService, userService, spreadService, poolService, databaseService, requestService, configService);

    // const poolAssets: unknown[] = await poolService.getPoolAssets();
    // loggerService.log(poolAssets);

    botService.onText(/\/start/, async (msg) => {
        const id = msg.chat.id;
        const user = await userService.add(id.toString());
        if (user) {
            await botService.sendMessage(id, 'New user was created!')
        } else {
            await botService.sendMessage(id, 'The user exists')
        }
    });

    botService.onText(/\/addCoin/, async (msg, data) => {
        const id = msg.chat.id;

        const [source, address, spreadChange] = data.input.split(' ');
        const coin = await coinService.add(id.toString(), address, spreadChange);

        if (!coin) {
            await botService.sendMessage(id, `problem with adding coin. Maybe: send /start command; wrong coin address; wrong spread persentage; you track this coin; we don't support this coin.`)
        } else {
            await botService.sendMessage(id, 'The coin was added!')
        }
    });

    botService.onText(/\/editSpreads/, async (msg, data) => {
        const id = msg.chat.id;

        const [source, address, spreadChange] = data.input.split(' ');
        const spreads = await spreadService.editSpreads(id.toString(), address, spreadChange);

        if (!spreads) {
            await botService.sendMessage(id, 'problem with editing spreads. Maybe: send /start command; wrong coin address; wrong spread persentage.')
        } else {
            await botService.sendMessage(id, 'Spreads were changed!')
        }
    });

    botService.onText(/\/coins/, async (msg) => {
        const id = msg.chat.id;

        const coins = await coinService.get(id.toString());
        if (!coins) {
            await botService.sendMessage(id, "You don't track any coin")
        } else {
            let message: string = `coins \n`;
            coins.forEach(({ name, usdLiquidity, ethLiquidity, coinAddress}) =>
                message += `\nname: ${name}, \nusdLiquidity: ${usdLiquidity}$, \nethLiquidity: ${ethLiquidity}💎, \ncoin address: ${coinAddress}\n`
            );
            await botService.sendMessage(id, message);
        }
    });

    botService.onText(/\/getCoin/, async (msg, data) => {
        const id = msg.chat.id;

        const [source, address] = data.input.split(' ');
        const coin = await coinService.getCoinByAddress(id.toString(), address);
        if (!coin) {
            await botService.sendMessage(id, "You don't track this coin")
        } else {
            await botService.sendMessage(id, `name: ${coin.name}, \nusdLiquidity: ${coin.usdLiquidity}$, \nethLiquidity: ${coin.ethLiquidity}, \ncoin address: ${coin.coinAddress}`);
        }
    });

    botService.onText(/\/addPool/, async (msg, data) => {
        const id = msg.chat.id;

        const [source, address, assetsChange] = data.input.split(' ');
        const pool = await poolService.addPool(id.toString(), address, assetsChange);

        if (!pool) {
            await botService.sendMessage(id, `problem with adding pool. Maybe: send /start command; wrong pool address; wrong asset change persentage; you track this pool; we don't support this pool.`)
        } else {
            await botService.sendMessage(id, 'The pool was added!')
        }
    });

    botService.onText(/\/editPool/, async (msg, data) => {
        const id = msg.chat.id;

        const [source, address, assetsChange] = data.input.split(' ');
        const pool = await poolService.editPool(id.toString(), address, assetsChange);

        if (!pool) {
            await botService.sendMessage(id, `problem with editing pool. Maybe: send /start command; wrong pool address; wrong asset change persentage; you don't track this pool.`)
        } else {
            await botService.sendMessage(id, 'The pool was edited!')
        }
    });

    botService.onText(/\/funding/, async (msg) => {
        const id = msg.chat.id;

        const funding: string = await botTaskService.getFunding();
        await botService.sendMessage(id, funding);
    });

    botService.onText(/\/gas/, async (msg) => {
        const id = msg.chat.id;

        const gas: string = await botTaskService.getGas();
        await botService.sendMessage(id, gas);
    });

    spreadService.compareSpreads();
    // poolService.comparePools();

})();