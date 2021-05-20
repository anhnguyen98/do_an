const { mutipleMongooseToObject } = require('../ulti/mongoose');
const { mongooseToObject } = require('../ulti/mongoose');
const MessageModel = require('./model/message');
class MessageController{
    getMessage(req, res, next){
        let {senderId, receiverId} = req.params
        MessageModel.find({
            $or: [{
               $and: [{
                   "senderId" : senderId,
                   "receiverId": receiverId
               }] 
            },{
                $and: [{
                    "receiverId" : senderId,
                    "senderId": receiverId
                }] 
             }] 
        }).sort({"createdAt": -1}).limit(10).exec();
    } 
}
module.exports = new MessageController();