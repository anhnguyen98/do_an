const { mongooseToObject } = require('../ulti/mongoose');
const Course = require('./model/course');
const Lesson = require('./model/lesson');
const User = require('./model/user');
const Feed = require('./model/feedback');
const getVideoId = require('get-video-id');
class CourseController {
    show(req, res, next) {
        const title = 'Khóa học ' + req.params.slug;
        Course.findOne({ slug: req.params.slug })
            .then(async (course) => {
                if (course) {
                    User.findOne({ _id: req.signedCookies.userId })
                        .then(data => {
                            if (data.learning.includes(req.params.slug) == false) {
                                User.updateOne({ _id: req.signedCookies.userId }, { $push: { learning: req.params.slug } })
                                    .then()
                                Course.updateOne({ slug: req.params.slug }, { numberStudents: course.numberStudents + 1 })
                                    .then()
                            }
                        });

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
                    res.cookie('khoahoc', course.slug);
                    res.render('show', {
                        timeCourse,
                        indexLesson: arrTmp,
                        course: mongooseToObject(course),
                        title
                    })
                } else {
                    res.redirect('/');
                }
            })
            .catch(next);
        return;
    }
    async seemorecourse(req, res, next) {
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
        for (var i = 0; i < user.learning.length;i++){
            if (JSON.stringify(user.learning[i]) === JSON.stringify(course.slug)){
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