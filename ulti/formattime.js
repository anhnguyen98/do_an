const moment = require('moment');
let formatTimeComment = (time) => {
    return moment(time).locale("vi").startOf("seconds").fromNow()
}
let formatTime = (d) => {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    var st = '';
    if (h != 0) {
        if (h <= 9) st += '0' + h + ':';
        else st += h + ':';
    }
    if (m <= 9) st += '0' + m + ':';
    else st += m + ':';
    if (s <= 9) st += '0' + s;
    else st += s;
    return st;
}
module.exports = {formatTimeComment, formatTime}
