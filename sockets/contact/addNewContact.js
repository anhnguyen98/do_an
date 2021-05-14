let {pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray} = require("../../helps/socketHelper")

let addNewContact = (io) => {
    let clients = {}
    io.on("connection", (socket) => {
        //lấy thông tin của người dùng hiện tại
        let currentUserId = socket.request.user._id;
        //lưu lại socket id của người dùng 
        //nếu ng dùng đã đăng nhập thì tiếp tục lưu
        //còn ng dùng chưa đăng nhập thì tạo ra giá trị mới cho nó
        clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id)

        
        socket.on("chat", (data) => {
            let currentUser = {
                id: socket.request.user._id
            }
            if(clients[data.contactId]){
                io.sockets.connected[socketId].emit("", currentUser)
            }
            emitNotifyToArray(clients, data.contactId, io, "response-remove-request-user", currentUser)
        })
        socket.on("disconnect", () => {
           clients = removeSocketIdFromArray(clients, socket.request.user._id, socket.id)
        })
        
    })
}
module.exports = addNewContact