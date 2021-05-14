import { Document } from 'mongoose';

export interface IUser extends Document {
    id: string;
    tg_chat_id: string;
}
