const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');
const route = require('./routes');

const db = require('./config/db');

const app = express();
app.use(cookieparser('back-end-web-2020-vnua'));
db.connect();
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', exphbs({
    helpers: {
        formatTime: (d) => {
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
        },
        handleItemOfVideos: (videos) => {
            var elm = "";
            for (var i = 0; i < videos.length; i++) {
                d = Number(videos[i].timeLesson);
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
                elm += `<li class="list-group-item list-group-item-light mt-2">`
                    + 'Bài ' + (i + 1) + ': '
                    + videos[i].nameLesson
                    + `<span class="float-right">`
                    + st
                    + `</span></li>
                <div class="mt-1">
                    <a class="btn btn-success btn-sm" href="edit/` + videos[i].idVideo + `" style="">Sửa</a>
                    <a class="btn btn-danger btn-sm" href="delete/`+ videos[i].idVideo + `" style="">Xóa</a>
                </div>`
            }
            return elm;
        },
        handleItemOfVideosInViewUser: (videos) => {
            var elm = "";
            for (var i = 0; i < videos.length; i++) {
                d = Number(videos[i].timeLesson);
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
                elm += `<li class="list-group-item list-group-item-light mt-2 col-12">`
                    + 'Bài ' + (i + 1) + ': '
                    + videos[i].nameLesson
                    + `<span class="float-right">`
                    + st
                    + `</span></li>`;
            }
            return elm;
        },
        handleItemOfVideosInShowCourse: (videos) => {
            var elm = "";
            for (var i = 0; i < videos.length; i++) {
                d = Number(videos[i].timeLesson);
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
                elm += `<li class="lesson-mask py-1 list-group-item list-group-item-light mt-2" data-idVideo="`
                    + videos[i].idVideo + `" data-contentVideo="`
                    + videos[i].content + `"`
                    + `style="cursor: pointer;font-size: 14px">`
                    + 'Bài ' + (i + 1) + ': '
                    + videos[i].nameLesson
                    + `<br/><span class=""><i class="fa fa-play mr-1"></i>`
                    + st
                    + `</span></li>`;
            }
            return elm;
        },
        selectedSource: (nameSource) => {
            //console.log(nameSource);
            if (nameSource === "Frontend")
                return `<option value="Frontend" selected="selected">Frontend</option>
            <option value="Backend">Backend</option>
            `;
            return `<option value="Frontend">Frontend</option>
            <option value="Backend" selected="selected">Backend</option>`;
        },
        sum: (a, b) => a + b,
        admin: (position, color) => {
            if (position === 'admin') {
                let out = `<td class="text-warning">`;
                out = out + color;
                return out + `</td>`;
            } else {
                let out = `<td>`;
                out = out + color;
                return out + `</td>`;
            }
        },
        pagination: (total, size, page) => {
            var pages = Math.ceil(total / size);
            let out = `<ul class="pagination">
                            <li class="page-item">
                                <a class="page-link" href="?page=`+ 1 + `">Trang đầu</a>
                            </li>
            `;
            for (var i = 1; i <= pages; i++) {
                if (i == page) {
                    out = out + `
               <li class="page-item active">
                    <a class="page-link" href ="?page=`+ i + `">` + i + `</a>
               </li>
               `   } else {
                    out = out + `
                <li class="page-item">
                     <a class="page-link" href ="?page=`+ i + `">` + i + `</a>
                </li>
                `
                }
            }
            return out + `<li class="page-item">
                <a class="page-link" href="?page=`+ pages + `">Trang cuối</a>
              </li>
            </ul>`;
        },
        time: (timesta) => {
            var time = Number(timesta);
            var datenow = new Date();
            var age = Math.abs(datenow - time);
            var unti = '';
            var out = '';
            if (age < 60000) {
                return out = "Vừa xong";
            }
            else {
                if (age >= 60000 && age < 3600000) {
                    age = Math.round(age / 1000 / 60);
                    unti = 'phút';
                }
                else if (age >= 3600000 && age <= 86400000) {
                    age = Math.round(age / 1000 / 60 / 60);
                    unti = 'giờ';
                }
                else {
                    age = Math.round(age / 1000 / 60 / 60 / 24);
                    unti = 'ngày';
                }
                return out = age + " " + unti + " trước";
            }
        },

        count: (num) => {
            if (num == 0) {
                return `<p class ="text-center">Không có góp ý nào trong hòm thư <a href="/"> Quay về trang chủ </a></p>`
            } else {
                return `<p class ="text-right"><a href="/admin/pinread" class ="text-danger">Đánh dấu tất cả là đã đọc</a></p>`
            }
        },
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.json());

route(app);
const port = process.env.PORT || 8800;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));