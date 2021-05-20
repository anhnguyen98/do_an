const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let ContactSchema = new Schema({
  userId: {
    type: String,
    ref: "users"
  },
  contactId: {
    type: String,
    ref: "users"
  },
  status: {type:Boolean,default:false},
  createdAt: {type: Number, default:Date.now},
  updatedAt: {type: Number, default:null},
  deletedAt: {type: Number, default:null},
})

module.exports = mongoose.model("contact",ContactSchema)