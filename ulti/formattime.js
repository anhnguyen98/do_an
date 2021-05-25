const moment = require('moment');
let formatTimeComment = (time) => {
    return moment(time).locale("vi").startOf("seconds").fromNow()
}
module.exports = {formatTimeComment}
