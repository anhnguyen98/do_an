const mmtimezone = require('moment-timezone');
let formatTime = (time) => {
    return mmtimezone(time).tz("Asia/Ho_Chi_Minh").format('DD-MM-YYYY HH:mm:ss');
}
module.exports = formatTime
