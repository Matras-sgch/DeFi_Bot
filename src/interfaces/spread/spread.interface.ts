import { Document } from 'mongoose';
import mongoose from "mongoose";


export interface ISpread extends Document {
    id: string;
    coinAddress: string;
    platform: string;
    spreadValue: number;
    spreadChange: number;
    coinUsdValue: number;
    owner: mongoose.Schema.Types.ObjectId;
}
