const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchame = new Schema({
    user: { type: String, required: true},
    fullName: { type: String, required: true },
    email:{ type: String, required: true },
    passWord: { type: String, required: true },
    learning: { type: Array},
    position: {type: String, required: true, default: 'user'},
    date: {type:String, default: Date.now},
    avatar: {
        type: String,
        default: process.env.NODE_ENV !== "production" ? `${process.env.HOST_DOMAIN_DEV}/img/user_default.jpg` : `${process.env.DOMAIN}/img/user_default.jpg`
    },
}, {
    timestamps:true,
});

module.exports = mongoose.model('users', userSchame);