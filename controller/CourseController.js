const { mutipleMongooseToObject } = require('../ulti/mongoose');
const { mongooseToObject } = require('../ulti/mongoose');
const Course = require('./model/course');
const User = require('./model/user');
const Feed = require('./model/feedback');
const ContactModel = require("./model/contact")
const MessageModel = require("./model/message")
class CourseController{
    show(req, res, next){
        Course.findOne({ _id: req.params.idCourse })
        .populate({ 
            path: 'commentId',
            populate: {
              path: 'idUser',
              model: 'users'
            } 
         })
         .populate("teacher", "_id user fullName")
         .exec()
        .then(course =>{
            const title = 'Khóa học '+course.slug;
            if(course){
                User.findOne({_id: req.signedCookies.userId})
                .then(async data=>{
                    if (data.learning.includes(req.params.idCourse) == false){
                        User.update({_id: req.signedCookies.userId}, {$push:{learning: req.params.idCourse}})
                        .then()
                        Course.updateOne({idCourse: req.params.idCourse}, {numberStudents: course.numberStudents+1})
                        .then() 
                        ContactModel.create({
                            userId: course.teacher._id,
                            contactId: data._id
                        }).then() 
                        MessageModel.create({
                            senderId: course.teacher._id,
                            receiverId: req.signedCookies.userId,
                        })
                    }
                    let listMessage = await MessageModel.find({
                        $or: [{
                           $and: [{
                               "senderId" : course.teacher._id,
                               "receiverId":  req.signedCookies.userId
                           }] 
                        },{
                            $and: [{
                                "receiverId" : course.teacher._id,
                                "senderId": req.signedCookies.userId
                            }] 
                         }] 
                    }).sort({"createdAt": 1}).limit(10).exec();
                    res.cookie('khoahoc',course.idCourse)
                    res.render('show', {
                        user: {_id: data._id, position: data.position}, 
                        position: data.position, 
                        course: mongooseToObject(course), 
                        title,
                        listMessage,
                        countMessage: 0
                    })
                });
                
            }else{
                res.redirect('/');
            }
        })
        .catch(next);   
        return;
    }
    feedback(req, res, next) {
            const title = 'Góp ý';
                Feed.findOne({_id: req.signedCookies.userId})
                .then(info =>{
                    res.render('feedback', {title, info: mongooseToObject(info)});   
                })
                .catch(next)      
    } 
    send(req, res, next) {
            const title = 'Góp ý';
            const feedBack = req.body.feedBack;
            const lengthLetter = feedBack.length;
            const id = req.signedCookies.userId;
            const date = Date.now();
                User.findOne({_id: req.signedCookies.userId})
                .then(data =>{
                    const name = data.user;
                    const newPost = new Feed({_id: id, name: name, feedBack: feedBack});
                    Feed.findOne({name: name})
                    .then(info =>{
                        if (lengthLetter == 0) {
                            const msg = 'Nội dung góp ý không được để trống!';
                            res.render('feedback', {title, msg, info: mongooseToObject(info)});  
                        }
                        else if (lengthLetter > 600) {
                            const msg = 'Nội dung góp ý không vượt quá 600 kí tự!';
                            res.render('feedback', {title, msg, info: mongooseToObject(info)});
                        }
                        else {
                            if (!info){
                                newPost.save();
                                res.render('feedback', {title, info: mongooseToObject(info), success: true});  
                            }
                            else {
                                const time = Number(info.dateLast);
                                const counttime = date - time;
                                if (counttime < 1800000) {
                                    const msg = 'Mỗi lần góp ý cách nhau 30 phút!';
                                    res.render('feedback', {title, msg, info: mongooseToObject(info)});  
                                }
                                else {
                                    Feed.updateMany({name: name}, { $push:{feedBack: feedBack, dateWrite: date}, dateLast: date, new: 'chưa đọc' })
                                    .then()
                                    res.render('feedback', {title, info: mongooseToObject(info), success: true});  
                                }
                            }
                        }
                    })
                      
                })
                .catch(next)       
    } 
}
module.exports = new CourseController();