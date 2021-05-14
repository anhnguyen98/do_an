const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let MessageSchema = new Schema({
  senderId: {
    type: String,
    ref: 'users'
  },
  receiverId:{
    type: String,
    ref: 'users'
  },
  // conversationType: String,
  // messageType: String,
  text: String,
  // file:{data:Buffer,contentType:String, fileName: String},
  createdAt: {type: Number, default:Date.now},
  updatedAt: {type: Number, default:null},
  deletedAt: {type: Number, default:null},
})
module.exports = mongoose.model("message",MessageSchema)