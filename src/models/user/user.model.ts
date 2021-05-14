import * as mongoose from 'mongoose';
import {IUser} from "../../interfaces/user/user.interface";


const userSchema = new mongoose.Schema({
    tg_chat_id: {
        type: String,
        required: true,
        trim: true
    },
}, {
    timestamps: true
});

userSchema.virtual('spreads', {
    ref: 'Spread',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.virtual('pools', {
    ref: 'Pool',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.virtual('coins', {
    ref: 'Coin',
    localField: '_id',
    foreignField: 'owner'
})

export const User = mongoose.model<IUser>('User', userSchema);

