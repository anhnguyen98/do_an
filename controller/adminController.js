const { mutipleMongooseToObject } = require('../ulti/mongoose');
const { mongooseToObject } = require('../ulti/mongoose');
const { v4: uuidv4 } = require('uuid');
const Course = require('./model/course');
const Lesson = require('./model/lesson');
const User = require('./model/user');
const Feed = require('./model/feedback');
var slugify = require('slugify');
var { parse } = require('tinyduration');
const axios = require('axios');
const c = require('config');
const convertObjToSecond = (time) => {
    var arr = Object.keys(time).map((key) => time[key]);
    var sec = 0;
    for (var i = arr.length - 1; i >=0 ; i--){
        sec += arr[i]*Math.pow(60, arr.length - i - 1);
    }
    return String (sec);
}
const compareIndexLesson = (a, b) => {
    while (a.length < b.length) a = " " + a;
    while (b.length < a.length) b = " " + b;
    return a < b;
}
function removeElement(array, elem) {
    var index = array.indexOf(elem);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
}
class adminController {

    admin(req, res, next) {
        const title = 'Admin';
        Course.find({})
            .then(courses => {
                Feed.countDocuments({ new: 'chưa đọc' })
                    .then(news => {
                        if (news) {
                            res.render('admin/admin', {
                                courses: mutipleMongooseToObject(courses), title, news, newLetter: true
                            });
                        }
                        else {
                            res.render('admin/admin', {
                                courses: mutipleMongooseToObject(courses), title
                            });
                        }
                    })
            })
            .catch(next);
    }
    insert(req, res, next) {
        const title = 'Insert Course';
        res.render('admin/insert', { title });
    }
    insertup(req, res) {
        const img = 'img/' + req.file.filename;
        const { nameCourse, classify, description } = req.body;
        var newCourse = new Course({
            nameCourse: nameCourse,
            classify: classify,
            description: description,
            img: img,
        });
        newCourse.save();
        res.redirect('/admin');
    }
    edit(req, res, next) {
        const title = 'Sửa khóa học';
        Course.findOne({ _id: req.params.id })
            .then(courses => {
                res.render('admin/edit', {
                    courses: mongooseToObject(courses), title
                });
            })
            .catch(next);
    }
    update(req, res, next) {
        const { nameCourse, classify, description } = req.body;
        var slug = slugify(nameCourse.toLowerCase());
        if (req.file === undefined) {
            Course.updateOne({ _id: req.params.id }, { nameCourse, classify, description, slug })
                .then(() => res.redirect('/admin'))
                .catch(next);
        }
        else {
            const img = 'img/' + req.file.filename;
            Course.updateOne({ _id: req.params.id }, { nameCourse, classify, description, img, slug })
                .then(() => res.redirect('/admin'))
                .catch(next);
        }
    }
    async addvideo(req, res, next) {
        var course = await Course.findOne({ _id: req.params.id });
        const title = 'Khóa học ' + course.nameCourse;
        var indexLesson = course.indexLesson;
        // sort 
        for (var i = 0; i < indexLesson.length; i++) {
            for (var j = 0; j < indexLesson.length; j++) {
                if (compareIndexLesson(indexLesson[i].level, indexLesson[j].level)) {
                    let temp;
                    temp = indexLesson[i];
                    indexLesson[i] = indexLesson[j];
                    indexLesson[j] = temp;
                }
            }
        }
        await Course.updateOne({ _id: req.params.id }, { indexLesson });

        var courses = await Course.findOne({ _id: req.params.id });

        var indexLesson = courses.indexLesson;
        var arrTmp = [];
        var timeCourse = 0;
        for (var i = 0; i < indexLesson.length; i++) {
            var tmpIndex = indexLesson[i];
            var videos = await Lesson.find({ idIndexLesson: tmpIndex.id });
            var timeIndexLesson = 0;
            for (var j = 0; j < videos.length; j++){
                timeIndexLesson += parseInt(videos[j].timeLesson);
                timeCourse += parseInt(videos[j].timeLesson);
            }
            tmpIndex["videos"] = videos;
            tmpIndex["timeIndexLesson"] = timeIndexLesson;
            arrTmp.push(tmpIndex);
        }
        res.render('admin/addvideo', {
            timeCourse,
            indexLesson: arrTmp,
            courses: mongooseToObject(courses),
            title
        });

    }
    async deletevideo(req, res, next) {
        const title = 'Thêm video khóa học';
        let idVideo = req.params.idVideo;
        let curCourse = await Course.findOne({ _id: req.params.id });
        for (let i = 0; i < curCourse.idVideo.length; i++) {
            if (JSON.stringify(curCourse.idVideo[i]) === JSON.stringify(idVideo)) {
                curCourse.idVideo.splice(i, 1);
                break;
            }
        }
        await curCourse.save();
        await Lesson.deleteOne({ idVideo: idVideo });
        res.redirect('/admin/' + req.params.id + '/addvideo');
    }
    async postvideoiseditting(req, res, next) {
        let lesson = await Lesson.findOne({ idVideo: req.params.idVideo });
        lesson.nameLesson = req.body.nameLesson;
        lesson.idVideo = req.body.idVideo;
        lesson.idCourse = req.body.idCourse;
        lesson.content = req.body.content;
        var data = await axios.get('https://www.googleapis.com/youtube/v3/videos?id='
                    + req.body.idVideo
                    + '&part=contentDetails&key=AIzaSyDSL2pI1oK57zrscHlUr5s96ag6rgEzCYQ');
                
        var timeLesson = convertObjToSecond(parse(data.data.items[0].contentDetails.duration));
        lesson.timeLesson = timeLesson;
        var idIndexLesson = -1;
        var course = await Course.findOne({ _id: req.params.id });
        for (var i = 0; i < course.indexLesson.length; i++) {
            if (JSON.stringify(course.indexLesson[i].level) === JSON.stringify(req.body.indexVideo)) {
                idIndexLesson = course.indexLesson[i].id;
                break;
            }
        }
        if (idIndexLesson == -1) {
            res.redirect('/admin/' + req.params.id + '/addvideo');
            return;
        }
        
        lesson.idIndexLesson = idIndexLesson;
        await lesson.save();
        res.redirect('/admin/' + req.params.id + '/addvideo');
    }
    async editvideo(req, res, next) {
        var lesson = await Lesson.findOne({ idVideo: req.params.idVideo });
        var title = 'Chỉnh sửa bài học';
        var idCourse = req.params.id;
        var course = await Course.findOne({ _id: req.params.id });
        var indexLesson = -1;
        for (var i = 0; i < course.indexLesson.length; i++) {
            if (JSON.stringify(course.indexLesson[i].id) === JSON.stringify(lesson.idIndexLesson)) {
                indexLesson = course.indexLesson[i].level;
                break;
            }
        }
        if (indexLesson == -1) {
            res.redirect('/admin/' + req.params.id + '/addvideo');
            return;
        }
        res.render('admin/editvideo', {
            title,
            idCourse,
            idVideo: lesson.idVideo,
            nameLesson: lesson.nameLesson,
            content: lesson.content,
            indexLesson
        });
    }
    async postindexlesson(req, res, next) {
        var course = await Course.findOne({ _id: req.params.id });
        course.indexLesson.push({
            level: req.body.levelIndexVideo,
            id: uuidv4(),
            name: req.body.nameIndexVideo
        })
        await course.save();
        res.redirect('/admin/' + req.params.id + '/addvideo');
    }
    async editindexlesson(req, res, next) {
        var course = await Course.findById({ _id: req.params.id });
        var tmpCourse = course;
        for (var i = 0; i < tmpCourse.indexLesson.length; i++) {
            var item = tmpCourse.indexLesson[i];
            if (JSON.stringify(item.level) === JSON.stringify(req.body.levelIndexVideo)) {
                tmpCourse.indexLesson[i].name = req.body.newNameIndexVideo;
                break;
            }
        }
        await Course.updateOne({ _id: req.params.id }, tmpCourse);
        course = await Course.findById({ _id: req.params.id });
        res.redirect('/admin/' + req.params.id + '/addvideo');
    }
    async deleteindexlesson(req, res, next) {
        var course = await Course.findById({ _id: req.params.id });
        var idIndexLesson = -1;
        for (var i = 0; i < course.indexLesson.length; i++) {
            var item = course.indexLesson[i];
            if (item.level === req.body.levelIndexVideo) {
                idIndexLesson = item.id;
                break;
            }
        }
        if (idIndexLesson == -1) {
            res.redirect('/admin/' + req.params.id + '/addvideo');
            return;
        }
        var lessons = await Lesson.find({idIndexLesson});
        for (let i = 0; i < lessons.length; i++){
            course.idVideo = removeElement(course.idVideo, lessons[i].idVideo);
        }
        for (let i = 0; i < course.indexLesson.length; i++) {
            if (JSON.stringify(course.indexLesson[i].id) === JSON.stringify(idIndexLesson)) {
                course.indexLesson.splice(i, 1);
                break;
            }
        }
        await course.save();
        await Lesson.deleteMany({ idIndexLesson: idIndexLesson });
        res.redirect('/admin/' + req.params.id + '/addvideo');
    }
    async postvideo(req, res, next) {
        const title = 'Thêm video khóa học';
        const { idVideo, nameLesson, content, indexVideo } = req.body;
        var lessonCheck = await Lesson.findOne({
            idVideo: idVideo
        });
        if (lessonCheck !== null) {
            res.redirect('/admin/' + req.params.id + '/addvideo');
            return;
        }
        var course = await Course.findById({ _id: req.params.id });
        var idIndexLesson = -1;
        for (var i = 0; i < course.indexLesson.length; i++) {
            var item = course.indexLesson[i];
            if (item.level === indexVideo) {
                idIndexLesson = item.id;
                break;
            }
        }
        if (idIndexLesson == -1) {
            res.redirect('/admin/' + req.params.id + '/addvideo');
            return;
        }
        var data = await axios.get('https://www.googleapis.com/youtube/v3/videos?id='
                    + idVideo
                    + '&part=contentDetails&key=AIzaSyDSL2pI1oK57zrscHlUr5s96ag6rgEzCYQ');
        if (data.data.items[0] === undefined){
            res.redirect('/admin/' + req.params.id + '/addvideo');
            return;
        }
        var timeLesson = convertObjToSecond(parse(data.data.items[0].contentDetails.duration));
        let lesson = new Lesson({
            idCourse: req.params.id,
            idVideo,
            nameLesson,
            content,
            indexLesson: indexVideo,
            idIndexLesson,
            timeLesson
        });
        await lesson.save();
        course.idVideo.push(idVideo);
        await course.save();
        //
        res.redirect('/admin/' + req.params.id + '/addvideo');
    }
    delete(req, res, next) {
        Course.deleteMany({ _id: req.params.id })
            .then(() => res.redirect('/admin'))
            .catch(next)
    }
    thanhvien(req, res, next) {
        const title = 'Quản lí thành viên';
        var page = req.query.page || 1;
        var perpage = 10;
        User.find({})
            .sort({ date: 1 })
            .skip((perpage * page) - perpage)
            .limit(perpage)
            .then(user => {
                User.countDocuments({})
                    .then(num => {
                        res.render('admin/thanhvien', { title, user: mutipleMongooseToObject(user), num, page, perpage })
                    });
            })
            .catch(next);
    }
    deleteuser(req, res, next) {
        User.deleteMany({ _id: req.params.id })
            .then(() => res.redirect('/admin/thanhvien'))
            .catch(next)
    }
    chitiet(req, res, next) {
        const title = 'Quản lí thành viên';
        User.findOne({ user: req.params.name })
            .then(info => {
                if (info) {
                    res.render('admin/chitiet', { title, info: mongooseToObject(info) });
                } else {
                    res.redirect('/admin/thanhvien');
                }
            })
            .catch(next);
    }
    timkiem(req, res, next) {
        const title = 'Quản lí thành viên';
        const tukhoa = req.query.tukhoa;
        if (tukhoa === '') {
            var warning = "Nhập tên thành viên muốn tìm kiếm!";
            res.render('admin/timkiem', { title, warning })
        } else {
            User.find({ $text: { $search: "\"" + tukhoa + "\"" } })
                .then(user => {
                    res.render('admin/timkiem', { title, user: mutipleMongooseToObject(user) })
                })
                .catch(next);
        }
    }
    thongbao(req, res, next) {
        const title = 'Thông báo';
        Feed.find({})
            .then(news => {
                Feed.countDocuments({})
                    .then(num => {
                        Feed.countDocuments({ new: 'chưa đọc' })
                            .then(newnum => {
                                res.render('admin/thongbao', { title, newnum, num, news: mutipleMongooseToObject(news) })
                            })
                    })
            })
            .catch(next);
    }
    read(req, res, next) {
        const title = 'Thông báo';
        Feed.updateMany({ name: req.params.name }, { new: 'đã đọc' })
            .then()
        Feed.find({})
            .then(news => {
                Feed.findOne({ name: req.params.name })
                    .then(readLetter => {
                        res.render('admin/thongbao', {
                            title, read: 'chưa đọc',
                            news: mutipleMongooseToObject(news), readLetter: mongooseToObject(readLetter)
                        })
                    })
            })
            .catch(next);
    }

    delletter(req, res, next) {
        const title = 'Thông báo';
        Feed.deleteOne({ _id: req.params.id })
            .then()
        res.redirect('/admin/thongbao')
    }

    pinread(req, res, next) {
        Feed.updateMany({ new: 'chưa đọc' }, { new: 'đã đọc' })
            .then()
        res.redirect('/admin/thongbao')
    }

}

module.exports = new adminController();