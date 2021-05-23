
const chatComment = require("./chat/index")
const notifiMess = require("./notifiMess/index")

let initSocket = (io) => { 
    // rateComment(io)
    chatComment(io)
    notifiMess(io)
}

module.exports = initSocket