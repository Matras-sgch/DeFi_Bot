import * as mongoose from 'mongoose';
import {ISpread} from "../../interfaces/spread/spread.interface";


const spreadSchema = new mongoose.Schema({
    coinAddress: {
        type: String,
        required: true,
    },
    coinSymbol: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        required:true,
    },
    spreadChange: {
      type: Number,
      required: true,
    },
    coinUsdValue: {
       type: Number,
       required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

export const Spread = mongoose.model<ISpread>('Spread', spreadSchema);

