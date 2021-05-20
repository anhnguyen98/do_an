const moment = require('moment');
let formatTime = (time) => {
    return moment(time).locale("vi").startOf("seconds").fromNow()
}
module.exports = formatTime
