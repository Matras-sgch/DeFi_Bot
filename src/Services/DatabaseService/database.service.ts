import mongoose from 'mongoose';
import {IConfigService} from "../ConfigService/config.service";

export interface IDatabaseService {
    connect(): Promise<void>;
}

export class DatabaseService implements IDatabaseService {
    constructor(private readonly configService: IConfigService) {
    }

    public async connect(): Promise<void> {
        const mongodbUrl: string = this.configService.get<string>('MONGODB_URL');

        await mongoose.connect(mongodbUrl, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
    }
}