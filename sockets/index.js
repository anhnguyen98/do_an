const rateComment = require("./rateComment/index")
const chatComment = require("./chat/index")

let initSocket = (io) => { 
    // rateComment(io)
    chatComment(io)
}

module.exports = initSocket