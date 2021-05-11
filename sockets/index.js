const rateComment = require("./rateComment/index")

let initSocket = (io) => { 
    rateComment(io)
}

module.exports = initSocket