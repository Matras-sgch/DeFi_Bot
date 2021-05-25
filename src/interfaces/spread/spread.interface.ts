import { Document } from 'mongoose';
import mongoose from "mongoose";


export interface ISpread extends Document {
    id: string;
    coinAddress: string;
    coinSymbol: string;
    platform: string;
    spreadChange: number;
    coinUsdValue: number;
    owner: mongoose.Schema.Types.ObjectId;
}
