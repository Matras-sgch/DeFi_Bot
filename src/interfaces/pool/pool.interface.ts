import { Document } from 'mongoose';
import mongoose from "mongoose";


export interface IPool extends Document {
    id: string;
    poolAddress: string;
    assetChange: number;
    usdLiquidity: number;
    tokenCourse: Array<[string, number]>
    owner: mongoose.Schema.Types.ObjectId;
}
