let { pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray } = require("../../helps/socketHelper")
let MessageModel = require("../../controller/model/message")
const User = require('../../controller/model/user');
const NotificationModel = require('../../controller/model/notification');
const ContactModel = require("../../controller/model/contact")
let chatComment = (io) => {
    let clients = {}
    io.on("connection", async (socket) => {
        let countNotifi = 0;
        clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id)
        let infoUser = await User.findOne({ _id: socket.request.user._id })
        delete infoUser.passWord
        let listContact = await ContactModel.find({
            $or: [{
                userId: socket.request.user._id
            }, {
                contactId: socket.request.user._id
            }]
        })
            .populate("userId", "_id fullName user avatar")
            .populate("contactId", "_id fullName user avatar")
            .sort({ "updatedAt": 1 })
            .lean()
            .exec();
        //list contact của người dùng
        let getAllConversations = listContact.map((contactItem) => {
            let getUserContact = {};
            if (String(contactItem.userId._id) === String(socket.request.user._id)) {
                getUserContact = Object.assign(getUserContact, contactItem.contactId)
                getUserContact.updatedAt = contactItem.updatedAt;
                return getUserContact
            } else {
                getUserContact = Object.assign(getUserContact, contactItem.userId)
                getUserContact.updatedAt = contactItem.updatedAt;
                return getUserContact
            }
        })
        //hiển thị toàn bộ cuộc hội thoại
        let allConversationsWithMessagePromise = getAllConversations.map(async (converstationItem) => {
            let listNotification = await NotificationModel.find({
                sender: converstationItem._id,
                receiver: socket.request.user._id,
                isRead: false
            })
            converstationItem.notification = listNotification
            if (listNotification.length) countNotifi++;
            return converstationItem
        })
        await Promise.all(allConversationsWithMessagePromise)

        var amountNoti = null;
        if (countNotifi) {
            amountNoti = countNotifi
        } 
        socket.on("req-notifi", function(){
            socket.emit("response-notifi", {amountNoti})
        })
       
        socket.on("disconnect", () => {
            clients = removeSocketIdFromArray(clients, socket.request.user._id, socket.id)
        })

    })
}
module.exports = chatComment