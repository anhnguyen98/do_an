let {pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray} = require("../../helps/socketHelper")
let MessageModel = require("../../controller/model/message")
let chatComment = (io) => {
    let clients = {}
    io.on("connection", (socket) => {
        //lấy thông tin của người dùng hiện tại
        let currentUserId = socket.request.user._id;
        //lưu lại socket id của người dùng 
        //nếu ng dùng đã đăng nhập thì tiếp tục lưu
        //còn ng dùng chưa đăng nhập thì tạo ra giá trị mới cho nó
      
        clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id)
        socket.on("send-message", (data) => {
            try {
                let currentUser = {
                    id: socket.request.user._id
                }
                let receiverId = data.idReceiver;
                MessageModel.create({
                    senderId: socket.request.user._id,
                    receiverId: receiverId,
                    text: data.text
                }).then(function(res){
                    emitNotifyToArray(clients, receiverId, io, "response-send-chat", {currentUser, receiverId, text: data.text})

                })
            } catch (error) {
                socket.emit("send-message-error", {error: "true"})
            }
        })
        socket.on("disconnect", () => {
           clients = removeSocketIdFromArray(clients, socket.request.user._id, socket.id)
        })
        
    })
}
module.exports = chatComment