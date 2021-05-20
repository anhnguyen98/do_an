const { mongooseToObject } = require('../ulti/mongoose');
const Course = require('./model/course');
const Lesson = require('./model/lesson');
const User = require('./model/user');
const Feed = require('./model/feedback');
const getVideoId = require('get-video-id');
const ContactModel = require("./model/contact")
const MessageModel = require("./model/message")
let _ = require("lodash");
class CourseController {
    show(req, res, next) {
        Course.findOne({ _id: req.params.idCourse })
            .populate({
                path: 'commentId',
                populate: {
                    path: 'idUser',
                    model: 'users'
                }
            })
            .populate("teacher", "_id user fullName avatar")
            .exec()
            .then(async (course) => {
                course.commentId = _.orderBy(course.commentId, ['createdAt'],['desc']);
                const title = 'Khóa học '+course.slug;
                if (course) {
                    User.findOne({ _id: req.signedCookies.userId })
                        .then(async data => {
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
                            var indexLesson = course.indexLesson;
                            var arrTmp = [];
                            var timeCourse = 0;
                            for (var i = 0; i < indexLesson.length; i++) {
                                var tmpIndex = indexLesson[i];
                                var videos = await Lesson.find({ idIndexLesson: tmpIndex.id });
                                var timeIndexLesson = 0;
                                for (var j = 0; j < videos.length; j++) {
                                    timeIndexLesson += parseInt(videos[j].timeLesson);
                                    timeCourse += parseInt(videos[j].timeLesson);
                                }
                                tmpIndex["videos"] = videos;
                                tmpIndex["timeIndexLesson"] = timeIndexLesson;
                                arrTmp.push(tmpIndex);
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
                            res.cookie('khoahoc', course.idCourse);
                            res.render('show', {
                                timeCourse,
                                indexLesson: arrTmp,
                                course: mongooseToObject(course),
                                title,
                                user: {_id: data._id, position: data.position}, 
                                position: data.position, 
                                listMessage,
                                countMessage: 0
                            })
                        });

  
                } else {
                    res.redirect('/');
                }
            })
            .catch(next);
        return;
    }
    async seemorecourse(req, res, next) {
        console.log(req.signedCookies);
        var user = await User.findOne({ _id: req.signedCookies.userId });

        var course = await Course.findOne({ slug: req.params.slug })
        const title = 'Khóa học ' + course.nameCourse;

        var indexLesson = course.indexLesson;
        var arrTmp = [];
        var timeCourse = 0;
        for (var i = 0; i < indexLesson.length; i++) {
            var tmpIndex = indexLesson[i];
            var videos = await Lesson.find({ idIndexLesson: tmpIndex.id });
            var timeIndexLesson = 0;
            for (var j = 0; j < videos.length; j++) {
                timeIndexLesson += parseInt(videos[j].timeLesson);
                timeCourse += parseInt(videos[j].timeLesson);
            }
            tmpIndex["videos"] = videos;
            tmpIndex["timeIndexLesson"] = timeIndexLesson;
            arrTmp.push(tmpIndex);
        }
        var learned = 'Đăng kí';
        var cssLearned = 'btn__go_course_locked';
        for (var i = 0; i < user.learning.length; i++) {
            if (JSON.stringify(user.learning[i]) === JSON.stringify(course.slug)) {
                learned = 'Học tiếp';
                cssLearned = 'btn__go_course_unlocked';
                break;
            }
        }
        res.render('seemorecourse', {
            cssLearned,
            learned,
            timeCourse,
            indexLesson: arrTmp,
            course: mongooseToObject(course),
            title
        })
    }
    feedback(req, res, next) {
        const title = 'Góp ý';
        Feed.findOne({ _id: req.signedCookies.userId })
            .then(info => {
                res.render('feedback', { title, info: mongooseToObject(info) });
            })
            .catch(next)
    }
    send(req, res, next) {
        const title = 'Góp ý';
        const feedBack = req.body.feedBack;
        const lengthLetter = feedBack.length;
        const id = req.signedCookies.userId;
        const date = Date.now();
        User.findOne({ _id: req.signedCookies.userId })
            .then(data => {
                const name = data.user;
                const newPost = new Feed({ _id: id, name: name, feedBack: feedBack });
                Feed.findOne({ name: name })
                    .then(info => {
                        if (lengthLetter == 0) {
                            const msg = 'Nội dung góp ý không được để trống!';
                            res.render('feedback', { title, msg, info: mongooseToObject(info) });
                        }
                        else if (lengthLetter > 600) {
                            const msg = 'Nội dung góp ý không vượt quá 600 kí tự!';
                            res.render('feedback', { title, msg, info: mongooseToObject(info) });
                        }
                        else {
                            if (!info) {
                                newPost.save();
                                res.render('feedback', { title, info: mongooseToObject(info), success: true });
                            }
                            else {
                                const time = Number(info.dateLast);
                                const counttime = date - time;
                                if (counttime < 1800000) {
                                    const msg = 'Mỗi lần góp ý cách nhau 30 phút!';
                                    res.render('feedback', { title, msg, info: mongooseToObject(info) });
                                }
                                else {
                                    Feed.updateMany({ name: name }, { $push: { feedBack: feedBack, dateWrite: date }, dateLast: date, new: 'chưa đọc' })
                                        .then()
                                    res.render('feedback', { title, info: mongooseToObject(info), success: true });
                                }
                            }
                        }
                    })

            })
            .catch(next)
    }
}
module.exports = new CourseController();