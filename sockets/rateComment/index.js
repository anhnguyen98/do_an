let rateComment = (io) => {
    io.on("connection", (socket) => {
        socket.on("rate-comment", (data) => {
            console.log(data, "dataaaaaaaaa");
            console.log(socket.request.user);
            
        })
    })
}
module.exports = rateComment