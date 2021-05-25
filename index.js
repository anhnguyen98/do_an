require("dotenv").config();
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');
const route = require('./routes');
const passport = require('passport');

const db = require('./config/db');
const http = require("http");
const socketio = require("socket.io");
const initSocket = require("./sockets/index")
const session = require('./config/session');
const passportSocketIo = require("passport.socketio");
const cookieParser = require("cookie-parser")

const {formatTimeComment} = require("./ulti/formatTime");
const app = express();
const server = http.createServer(app)
let io = socketio(server)


app.use(cookieparser('back-end-web-2020-vnua'));
db.connect();
session.config(app);

app.use(express.static(path.join(__dirname, 'public')));
//user cookie parser
app.use(cookieParser())
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: "express.sid",
    secret: "mySecret",
    store: session.sessionStore,
    success: (data, accept) => {
        if (!data.user.logged_in) {
            return accept("Invalid user", false)
        }
        return accept(null, true)
    },
    fail: (data, message, error, accept) => {
        if (error) {
            console.log("Failed connect to socket.io", message);
            return accept(new Error(message), false)
        }

    }
}))
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
        }, viewRateComment: (idUser, amountDating, courseId) => {
            if (amountDating.length) {
                for (let i = 0; i < amountDating.length; i++) {
                    if (String(amountDating[i].idUser) == String(idUser)) {
                        return `<span class="ui rating" data-rating="1" data-max-rating="1" data-idCourse="${courseId}"></span> ${amountDating.length}`
                    }
                }
            } else {
                return `<span class="ui rating" data-rating="0" data-max-rating="1" data-idCourse="${courseId}"></span>0`
            }
        },
        handleTimeComment: (createdAt, updatedAt) => {
            if (updatedAt > createdAt) {
                return `<span class="date">Thời gian đã chỉnh sửa ${updatedAt}</span>`
            }
            return `<span class="date">Thời gian ${createdAt}</span>`
        },
        viewReplyComment: (replyComment, idComment) => {
            if (replyComment.length) {
                return `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"> Hiển thị thêm trả lời bình luận </div>`
            }
            return `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"></div>`
        },
        displayComment: (commentItem, totalComment, indexCommentNow, userNow, idCourse) => {
            function viewReplyComment(replyComment, idComment) {
                // if (replyComment.length) {
                //     return `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"> Hiển thị thêm trả lời bình luận </div>`
                // }
                // return `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"></div>`
                return ""
            }
            function handleTimeComment(createdAt, updatedAt) {
                if (updatedAt > createdAt) {
                    return `<span class="date">Thời gian đã chỉnh sửa ${formatTimeComment(updatedAt)}</span>`
                }
                return `<span class="date">Thời gian ${formatTimeComment(createdAt)}</span>`
            }
            function viewRateComment(idUser, comment, courseId) {
                let amountDating = comment.rate;
                if (comment.status === "active") {
                    if (comment.rate && amountDating.length) {
                        let count = 0;
                        for (let i = 0; i < amountDating.length; i++) {
                            if (String(amountDating[i].idUser) == String(idUser)) {
                                count++;
                            }
                        }
                        if (count) {
                            return `
                                 <span class="ui rating" data-rating="1" data-max-rating="1" data-idcomment="${comment._id}"></span> 
                                 <span>${amountDating.length}</span> 
                             `
                        } else {
                            return `
                                 <span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}"></span>
                                 <span>${amountDating.length}</span> 
                             `
                        }
                    } else {
                        return `
                         <span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}"></span>
                         <span>0</span> 
                      `
                    }
                } else {
                    if (comment.rate && amountDating.length) {
                        let count = 0;
                        for (let i = 0; i < amountDating.length; i++) {
                            if (String(amountDating[i].idUser) == String(idUser)) {
                                count++;
                            }
                        }
                        if (count) {
                            return `
                                 <span class="ui rating" data-rating="1" data-max-rating="1" data-idcomment="${comment._id}" style="display: none"></span> 
                                 <span>${amountDating.length}</span> 
                             `
                        } else {
                            return `
                                 <span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}" style="display: none"></span>
                                 <span>${amountDating.length}</span> 
                             `
                        }
                    } else {
                        return `<span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}" style="display: none"></span>
                             <span></span>
                         `
                    }
                }

            };

            function displayNoneComment(position, comment) {

                if (position === "admin") {
                    if (comment.status === "active") {
                        return `<span style="color: blue !important; cursor: pointer; padding-right: 5px" status="none" onclick='displayNoneComment.call(this, "${comment._id}")'> Ẩn </span>`
                    } else {
                        return `<span style="color: blue !important; cursor: pointer; padding-right: 5px;" status="active" onclick='displayNoneComment.call(this, "${comment._id}")'> Hiện </span>`
                    }
                } else {
                    return ``
                }
            }
            function deleteComment(idUserNow, comment, position) {
                let idUserInComment = comment.idUser._id;
                if (String(idUserNow) === String(idUserInComment) || position === "admin") {
                    return `<span style="color: red !important; cursor: pointer" onclick="handleDeleteComment.call(this, '${comment._id}')"> Xóa </span>`
                } else {
                    return ``
                }
            }
            let templateComment = `
                 <div class="comment">
                     <a class="avatar">
                         <img src=${commentItem.idUser.avatar}>
                     </a>
                     <div class="content">
                         <a class="author">${commentItem.idUser.user}</a>
                         <div class="metadata">
                             ${handleTimeComment(commentItem.createdAt, commentItem.updatedAt)}
                         </div>
                         <div class="text">
                             <p>${commentItem.content}</p>
                         </div>
                         <div class="actions">
                             ${viewRateComment(userNow._id, commentItem, idCourse)}
                             <span class="reply" onclick='addReply.call(this, "${commentItem._id}")' style="cursor: pointer; padding: 0 5px">Trả lời</span>
                             ${displayNoneComment(userNow.position, commentItem)}
                             ${deleteComment(userNow._id, commentItem, userNow.position)}
                         </div>
                     </div>
                     <div class="comments reply-comment">
                         ${viewReplyComment(commentItem.replyComment, commentItem._id)}
                     </div>
                 </div>
             `
            let templateCommentBanned = `
                 <div class="comment banned">
                     <a class="avatar">
                        <img src=${commentItem.idUser.avatar}>
                     </a>
                     <div class="content">
                         <a class="author" style="text-decoration: line-through;">${commentItem.idUser.user}</a>
                         <div class="metadata">
                             ${handleTimeComment(commentItem.createdAt, commentItem.updatedAt)}
                         </div>
                         <div class="text">
                             <p>Nội dung bị ẩn do chứa nội dung bị cấm</p>
                         </div>
                         <div class="actions">
                             ${viewRateComment(userNow._id, commentItem, idCourse)}
                             <span class="reply" onclick='addReply.call(this, "${commentItem._id}")' style="cursor: pointer; padding: 0 5px; display: none">Trả lời</span>
                             ${displayNoneComment(userNow.position, commentItem)}
                             ${deleteComment(userNow._id, commentItem, userNow.position)}
                         </div>
                     </div>
                     <div class="comments reply-comment">
                         ${viewReplyComment(commentItem.replyComment, commentItem._id)}
                     </div>
                 </div>
             `
            if (indexCommentNow <= 1) {
                //nếu status comment là active thì hiển thị ra còn không thì thêm class banned
                if (commentItem.status === "none") {
                    return templateCommentBanned
                } else {
                    return templateComment
                }
            } else {
                let templateCommentBanned = ` <div class="comment banned" style="display: none">
                     <a class="avatar">
                     <img src=${commentItem.idUser.avatar}>
                     </a>
                     <div class="content">
                         <a class="author" style="text-decoration: line-through;">${commentItem.idUser.user}</a>
                         <div class="metadata">
                             ${handleTimeComment(commentItem.createdAt, commentItem.updatedAt)}
                         </div>
                         <div class="text">
                             <p>Nội dung bị ẩn do chứa nội dung bị cấm</p>
                         </div>
                         <div class="actions">
                             ${viewRateComment(userNow._id, commentItem, idCourse)}
                             <span class="reply" onclick='addReply.call(this, "${commentItem._id}")' style="cursor: pointer; display: none">Trả lời</span>
                             ${displayNoneComment(userNow.position, commentItem)}
                             ${deleteComment(userNow._id, commentItem, userNow.position)}
                         </div>
                     </div>
                     <div class="comments reply-comment">
                         ${viewReplyComment(commentItem.replyComment, commentItem._id)}
                     </div>
                 </div>`
                let templateCommentNone =
                    ` <div class="comment" style="display: none">
                     <a class="avatar">
                     <img src=${commentItem.idUser.avatar}>
                     </a>
                     <div class="content">
                         <a class="author">${commentItem.idUser.user}</a>
                         <div class="metadata">
                             ${handleTimeComment(commentItem.createdAt, commentItem.updatedAt)}
                         </div>
                         <div class="text">
                             <p>${commentItem.content}</p>
                         </div>
                         <div class="actions">
                             ${viewRateComment(userNow._id, commentItem, idCourse)}
                             <span class="reply" onclick='addReply.call(this, "${commentItem._id}")' style="cursor: pointer;">Trả lời</span>
                             ${displayNoneComment(userNow.position, commentItem)}
                             ${deleteComment(userNow._id, commentItem, userNow.position)}
                         </div>
                     </div>
                     <div class="comments reply-comment">
                         ${viewReplyComment(commentItem.replyComment, commentItem._id)}
                     </div>
                 </div>`
                let btnViewMoreComment =
                    `<div class="actions">
                     <button  
                         style="cursor: pointer; margin-bottom: 20px;outline: none;
                         border: 0px;
                         background: transparent;"
                         class="add-view-comment" 
                         data-now=1
                         data-comment=${totalComment.length}
                         onclick='viewMoreComment.call(this)'
                         id="view-more-comment"
                         data-perpage=2
                     >
                         Hiển thị thêm bình luận
                     </button>
                 </div>`

                if (commentItem.status === "none") {
                    if (indexCommentNow === totalComment.length - 1) {
                        return templateCommentBanned + btnViewMoreComment
                    }
                    return templateCommentBanned
                } else {
                    if (indexCommentNow === totalComment.length - 1) {
                        return templateCommentNone + btnViewMoreComment
                    }
                    return templateCommentNone
                }
            }


        },
        contact: (allConversationsWithMessage) => {
            if (allConversationsWithMessage && allConversationsWithMessage.length) {
                let previewMessage = (message) => {
                    let content = message[parseInt(message.length) - 1].text
                    if (content.length > 11) {
                        return message[message.length - 1].text.substr(0, 11) + "<span>...</span>"
                    }
                    return content;

                }
                let previewNewMessage = (notifi) => {
                    let content = notifi[parseInt(notifi.length) - 1].content
                    if (content.length > 11) {
                        return `<span class="noti-new-message">  ${notifi.length}</span>`+notifi[notifi.length - 1].content.substr(0, 11) + "<span>...</span>" 
                    }
                    return `<span class="noti-new-message">  ${notifi.length}</span>`+ content;

                }
                let listContact = "";
                for (let index = 0; index < allConversationsWithMessage.length; index++) {
                    let url = "/message?thread=" + allConversationsWithMessage[index]._id
                    if(allConversationsWithMessage[index].notification && allConversationsWithMessage[index].notification.length){
                        listContact += `
                            <a href=${url} class="room-chat">
                                <li class="person new-message" data-chat=${allConversationsWithMessage[index]._id} onClick="handleReadMessage.call(this)">
                                    <div class="left-avatar">
                                        <div class="dot"></div>
                                        <img src="${allConversationsWithMessage[index].avatar}" alt="">
                                    </div>
                                    <span class="name" style="display:block">${allConversationsWithMessage[index].fullName}</span>
                                    <p class="preview">${previewNewMessage(allConversationsWithMessage[index].notification )} </p>
                                    <span class="time">${formatTimeComment(allConversationsWithMessage[index].updatedAt)}</span>
                                </li>
                            </a>
                        `
                        continue;
                    }
                    listContact += `
                     <a href=${url} class="room-chat">
                         <li class="person" data-chat="contact._id">
                             <div class="left-avatar">
                                 <div class="dot"></div>
                                 <img src="${allConversationsWithMessage[index].avatar}" alt="">
                             </div>
                             <span class="name" style="display:block">${allConversationsWithMessage[index].fullName}</span>
                             <p class="preview">${previewMessage(allConversationsWithMessage[index].messages)} </p>
                             <span class="time">${formatTimeComment(allConversationsWithMessage[index].updatedAt)}</span>
                         </li>
                     </a>
                 `
                }
                return listContact
            } else {
                return `<li class="person"> Bạn chưa có tin nhắn nào </li>`
            }
        },
        viewMessage: (currentUser, messages, statusMessage, infoUserReceiver) => {
            let checkAuthorMessage = (message) => {
                let template = ``;
                for (let index = 0; index < messages.length; index++) {
                    if (String(currentUser._id) === String(message[index].senderId)) {
                        template += `
                             <div class="bubble you" data-mess-id="${message[index]._id}">
                                 ${message[index].text}
                             </div>
                         `
                    } else {
                        template += `
                             <div class="bubble me" data-mess-id="${message[index]._id}">
                                 ${message[index].text}
                             </div>
                         `
                    }
                }
                return template

            }
            if (statusMessage) {
                if (messages.length) {
                    return `
                             <div class="top" data-id=${infoUserReceiver._id}>
                                 <span>To: <span class="name">${infoUserReceiver.fullName}</span></span>
                             </div>
                             <div class="content-chat" id="content-chat">
                                 <div class="chat" id="chat-element">
                                     ${checkAuthorMessage(messages)}
                                 </div>                               
                             </div>
                         `
                }
                return `<p> Bạn chưa có cuộc hội thoại nào</p>`
            }
            return `<p style="    text-align: center;
            margin-top: 50px;
            font-weight: bold;
            font-size: 17px;"> Chọn một chuỗi tin nhắn mà bạn muốn đọc nó</p>`
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session())
//init all socket
route(app);
initSocket(io)
app.get("/*", function(req,res){
    res.sendFile(path.join(__dirname, "./views/404NotFound.html"))
})
const port = process.env.PORT || 8800;
server.listen(port, () => console.log(`App listening at http://localhost:${port}`));
