require("dotenv").config();
const path = require('path');
const express = require('express');
const exphbs  = require('express-handlebars');
const bodyparser= require('body-parser');
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

const formatTime = require("./ulti/formatTime")

const app = express();

const server = http.createServer(app)
let io = socketio(server)

app.use(cookieparser('back-end-web-2020-vnua'));
db.connect();
app.use(express.static(path.join(__dirname, 'public')));
session.config(app); 

//user cookie parser
app.use(cookieParser())
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key:"express.sid",
    secret:"mySecret",
    store: session.sessionStore,
    success: (data, accept) => {
        if(!data.user.logged_in){
            return accept("Invalid user", false)
        }
        return accept(null, true)
    },
    fail: (data, message, error, accept) => {
        if(error) {
            console.log("Failed connect to socket.io", message);
            return accept(new Error(message), false)
        }

    }
}))

app.engine('handlebars', exphbs({
    helpers: {
        sum: (a, b)=>a+b,
        admin: (position, color)=>{
            if (position === 'admin'){
                let out = `<td class="text-warning">`;
                out = out +color;
                return out + `</td>`;
            }else {
                let out = `<td>`;
                out = out +color;
                return out+`</td>`;
            }
        },
        pagination: ( total,size,page ) =>{
            var pages = Math.ceil(total / size); 
            let out = `<ul class="pagination">
                            <li class="page-item">
                                <a class="page-link" href="?page=`+1+`">Trang đầu</a>
                            </li>
            `;
            for (var i = 1; i <= pages;i++){
                if (i == page){
                  out = out + `
               <li class="page-item active">
                    <a class="page-link" href ="?page=`+i+`">`+i+`</a>
               </li>
               `   }else{
                out = out + `
                <li class="page-item">
                     <a class="page-link" href ="?page=`+i+`">`+i+`</a>
                </li>
                `
               }
            }
                return out + `<li class="page-item">
                <a class="page-link" href="?page=`+pages+`">Trang cuối</a>
              </li>
            </ul>`;
        },
        time: (timesta) => {
            var time = Number(timesta);
            var datenow = new Date();
            var age = Math.abs(datenow - time);
            var unti ='';
            var out = '';
                if (age < 60000) {
                    return out = "Vừa xong";
                }
                else {
                    if (age >=60000 && age <3600000) {
                    age = Math.round(age/1000/60);
                    unti = 'phút';
                    }
                    else if (age >= 3600000 && age <= 86400000) {
                        age = Math.round(age/1000/60/60);
                        unti = 'giờ';
                    }
                    else{
                        age = Math.round(age/1000/60/60/24);
                        unti = 'ngày';
                    }
                    return out = age +" "+ unti + " trước";
                }
        },

        count: (num) => {
            if (num == 0) {
                return `<p class ="text-center">Không có góp ý nào trong hòm thư <a href="/"> Quay về trang chủ </a></p>`
            }else {
                return `<p class ="text-right"><a href="/admin/pinread" class ="text-danger">Đánh dấu tất cả là đã đọc</a></p>`
            }
        },
        viewRateComment: (idUser, amountDating, courseId) => {
           if(amountDating.length){
                for(let i = 0; i < amountDating.length; i++){
                    if(String(amountDating[i].idUser) == String(idUser)){
                        return `<span class="ui rating" data-rating="1" data-max-rating="1" data-idCourse="${courseId}"></span> ${amountDating.length}`
                    }
                }
           }else{
             return `<span class="ui rating" data-rating="0" data-max-rating="1" data-idCourse="${courseId}"></span>0`
           }
        },
        handleTimeComment: (createdAt, updatedAt) => {
            if(updatedAt > createdAt){
                return `<span class="date">Thời gian đã chỉnh sửa ${updatedAt}</span>`
            }
            return `<span class="date">Thời gian ${createdAt}</span>`
        },
        viewReplyComment: (replyComment, idComment) => {
            if(replyComment.length){
                return `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"> Hiển thị thêm trả lời bình luận </div>`
            }
            return  `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"></div>`
        },
        displayComment: (commentItem, totalComment, indexCommentNow, userNow, idCourse) => {
            function viewReplyComment(replyComment, idComment){
                if(replyComment.length){
                    return `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"> Hiển thị thêm trả lời bình luận </div>`
                }
                return  `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"></div>`
            }
            function handleTimeComment(createdAt, updatedAt) {
                if(updatedAt > createdAt){
                    return `<span class="date">Thời gian đã chỉnh sửa ${formatTime(updatedAt)}</span>`
                }
                return `<span class="date">Thời gian ${formatTime(createdAt)}</span>`
            }
            function viewRateComment(idUser, comment, courseId){
                let amountDating = comment.rate;
                if(comment.status === "active"){
                    if(comment.rate && amountDating.length){
                        let count = 0;
                        for(let i = 0; i < amountDating.length; i++){
                            if(String(amountDating[i].idUser) == String(idUser)){
                                count++;
                            }
                        }
                        if(count){
                            return `
                                <span class="ui rating" data-rating="1" data-max-rating="1" data-idcomment="${comment._id}"></span> 
                                <span>${amountDating.length}</span> 
                            `
                        }else{
                            return `
                                <span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}"></span>
                                <span>${amountDating.length}</span> 
                            `
                        }
                   }else{
                     return `
                        <span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}"></span>
                        <span>0</span> 
                     `
                   }
                }else{
                    if(comment.rate && amountDating.length){
                        let count = 0;
                        for(let i = 0; i < amountDating.length; i++){
                            if(String(amountDating[i].idUser) == String(idUser)){
                                count++;
                            }
                        }
                        if(count){
                            return `
                                <span class="ui rating" data-rating="1" data-max-rating="1" data-idcomment="${comment._id}" style="display: none"></span> 
                                <span>${amountDating.length}</span> 
                            `
                        }else{
                            return `
                                <span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}" style="display: none"></span>
                                <span>${amountDating.length}</span> 
                            `
                        }
                   }else{
                     return `<span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}" style="display: none"></span>
                            <span></span>
                        `
                   }
                }
                
            };
            
            function displayNoneComment(position, comment){
                if(position === "admin"){
                    if(comment.status === "active"){
                        return `<span style="color: blue !important; cursor: pointer; padding-right: 5px" status="none" onclick='displayNoneComment.call(this, "${comment._id}")'> Ẩn </span>`
                    }else{
                        return `<span style="color: blue !important; cursor: pointer; padding-right: 5px;" status="active" onclick='displayNoneComment.call(this, "${comment._id}")'> Hiện </span>`
                    }
                }else{
                    return ``
                }
            }
            function deleteComment(idUserNow, comment, position){
                let idUserInComment = comment.idUser._id;
                if(idUserNow === idUserInComment || position === "admin"){
                    return `<span style="color: red !important; cursor: pointer" onclick="handleDeleteComment.call(this, '${comment._id}')"> Xóa </span>`
                }else{
                    return ``
                }
            }

            let templateComment = `
                <div class="comment">
                    <a class="avatar">
                        <img src='https://o.vdoc.vn/data/image/2020/09/07/hinh-nen-cute-de-thuong-10.jpg'>
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
                        <img src='https://o.vdoc.vn/data/image/2020/09/07/hinh-nen-cute-de-thuong-10.jpg'>
                    </a>
                    <div class="content">
                        <a class="author" style="text-decoration: line-through;">${commentItem.idUser.user}</a>
                        <div class="metadata">
                            ${handleTimeComment(commentItem.createdAt, commentItem.updatedAt)}
                        </div>
                        <div class="text">
                            <p>Nội dung bị ẩn vì vi phạm do chứa nội dung bị cấm</p>
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
            if(indexCommentNow <= 1){
                //nếu status comment là active thì hiển thị ra còn không thì thêm class banned
                if(commentItem.status === "none"){
                    return templateCommentBanned
                }else{
                    return templateComment
                }
            }else{
                let templateCommentBanned = ` <div class="comment banned" style="display: none">
                    <a class="avatar">
                        <img src='https://o.vdoc.vn/data/image/2020/09/07/hinh-nen-cute-de-thuong-10.jpg'>
                    </a>
                    <div class="content">
                        <a class="author" style="text-decoration: line-through;">${commentItem.idUser.user}</a>
                        <div class="metadata">
                            ${handleTimeComment(commentItem.createdAt, commentItem.updatedAt)}
                        </div>
                        <div class="text">
                            <p>Nội dung bị ẩn vì vi phạm do chứa nội dung bị cấm</p>
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
                        <img src='https://o.vdoc.vn/data/image/2020/09/07/hinh-nen-cute-de-thuong-10.jpg'>
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
                
                if(commentItem.status === "none"){
                    if(indexCommentNow === totalComment.length - 1){
                        return templateCommentBanned + btnViewMoreComment
                    }
                    return templateCommentBanned
                }else{
                    if(indexCommentNow === totalComment.length - 1){
                        return templateCommentNone + btnViewMoreComment
                    }
                    return templateCommentNone
                }
            }
                
            
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

const port = process.env.PORT || 8800;

server.listen(port, () => console.log(`App listening at http://localhost:${port}`));