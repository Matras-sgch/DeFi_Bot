import * as mongoose from 'mongoose';

const addressTemplate = /^0x[a-fA-F0-9]{40}$/;

const coinSchema = new mongoose.Schema({
    coinAddress: {
        type: String,
        required: true,
        validate(value: string) {
            if (!addressTemplate.test(value)) {
                throw new Error('Address is invalid')
            }
        },
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

export const Coin = mongoose.model('Coin', coinSchema);

