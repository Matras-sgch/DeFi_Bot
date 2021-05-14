import * as mongoose from 'mongoose';
import {IPool} from "../../interfaces/pool/pool.interface";

const addressTemplate = /^0x[a-fA-F0-9]{40}$/;

const poolSchema = new mongoose.Schema({
    poolAddress: {
        type: String,
        required: true,
        validate(value: string) {
            if (!addressTemplate.test(value)) {
                throw new Error('address is invalid')
            }
        }
    },
    assetChange: {
        type: Number,
        required: true,
    },
    usdLiquidity: {
        type: Number,
        required: true,
    },
    tokenCourse: {
        type: [[String, Number]],
        required: true,
        default: [],
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

export const Pool = mongoose.model<IPool>('Pool', poolSchema);

