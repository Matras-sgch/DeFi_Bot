const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    tg_chat_id: {
        type: String,
        required: true,
        trim: true
    },
    coins: {
        type: [String]
    },
    pools: {
        type: [String]
    },
    spreadChange: {
        type: Number,
        default: 5
    },
    previousSpreadsValues: {
        type: [Object],
        default: []
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
