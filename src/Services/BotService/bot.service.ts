import TelegramBot from 'node-telegram-bot-api';
import { IConfigService } from "../ConfigService/config.service";

export interface IBotService {
    onText(regexp: RegExp, callback: ((msg: TelegramBot.Message, match: RegExpExecArray | null) => void)): void;
    sendMessage(chatId: number | string, text: string): Promise<TelegramBot.Message>;
}

export class BotService implements IBotService {
    private readonly bot: TelegramBot;

    constructor(private readonly configService: IConfigService) {
        const token: string = configService.get<string>('BOT_TOKEN');

        this.bot = new TelegramBot(token, { polling: true });
    }

    public onText(regexp: RegExp, callback: ((msg: TelegramBot.Message, match: RegExpExecArray | null) => void)): void {
        this.bot.onText(regexp, callback);
    }

    public sendMessage(chatId: number | string, text: string): Promise<TelegramBot.Message> {
        return this.bot.sendMessage(chatId, text);
    }
}