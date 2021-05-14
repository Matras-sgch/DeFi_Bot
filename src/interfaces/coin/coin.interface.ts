import { Document } from 'mongoose';
import mongoose from "mongoose";


export interface ICoin extends Document {
    id?: string;
    coinAddress?: string;
    owner?: mongoose.Schema.Types.ObjectId;
}
