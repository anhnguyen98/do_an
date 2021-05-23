const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let NotificaionSchema = new Schema({
  sender:{
   type: String,
   ref: 'users'
  },
  receiver:{
    type: String,
    ref: 'users'
  },
  content: String,
  isRead:{type:Boolean, default:false},
  createdAt: {type: Number, default:Date.now},
})
module.exports = mongoose.model("notification",NotificaionSchema)