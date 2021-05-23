const { mutipleMongooseToObject } = require('../ulti/mongoose');
const { mongooseToObject } = require('../ulti/mongoose');
const Course = require('./model/course');
const User = require('./model/user');
const NotificationModel = require('./model/notification');
const md5 = require('md5');
const ContactModel = require("../controller/model/contact")
const MessageModel = require("../controller/model/message");
const contact = require('../controller/model/contact');
class SiteController {

    index(req, res) {
        const title = 'Course Online';
        Course.countDocuments({})
            .then(num => {
                res.render('home', { title, num });
            })
    }
    course(req, res, next) {
        const title = 'Khóa học';
        Course.find({})
            .then(courses => {
                User.findOne({ _id: req.signedCookies.userId })
                    .then(data => {
                        Course.countDocuments({})
                            .then(async num => {
                                if (!req.signedCookies.userId) {
                                    res.render('course', {
                                        courses: mutipleMongooseToObject(courses), title, num
                                    });
                                }
                                if (req.signedCookies.userId) {
                                    let listCourseOfUser = await Course.find({ _id: { $nin: req.user.learning } })
                                    res.render('course', {
                                        courses: mutipleMongooseToObject(listCourseOfUser), num, data: mongooseToObject(data), title, user: { postion: req.user.postion }
                                    });
                                }
                            })
                    })
            })
            .catch(next);
    }
    courseOfUser(req, res, next) {
        const title = 'Khóa học';
        Course.find({})
            .then(courses => {
                User.findOne({ _id: req.signedCookies.userId })
                    .then(data => {
                        Course.countDocuments({})
                            .then(async num => {
                                if (req.signedCookies.userId) {
                                    let listCourseOfUser = await Course.find({ _id: { $in: req.user.learning } })
                                    res.render('course', {
                                        courses: mutipleMongooseToObject(listCourseOfUser), num, data: mongooseToObject(data), title, user: { postion: req.user.postion }
                                    });
                                }
                            })
                    })
            })
            .catch(next);
    }
    frontend(req, res, next) {
        const title = 'Frontend';
        Course.find({ classify: 'Frontend' })
            .then(courses => {
                User.findOne({ _id: req.signedCookies.userId })
                    .then(data => {
                        res.render('course', {
                            courses: mutipleMongooseToObject(courses), data: mongooseToObject(data), title, cast: true
                        });
                    });
            })
            .catch(next);
    }
    backend(req, res, next) {
        const title = 'Backend';
        Course.find({ classify: 'Backend' })
            .then(courses => {
                User.findOne({ _id: req.signedCookies.userId })
                    .then(data => {
                        res.render('course', {
                            courses: mutipleMongooseToObject(courses), data: mongooseToObject(data), title, cast: true
                        });
                    });
            })
            .catch(next);
    }
    login(req, res) {
        const title = 'Đăng nhập';
        res.render('login', { title });
    }
    checklogin(req, res) {
        const user = req.body.user;
        const passWord = md5(req.body.passWord);
        const check = req.body.mact;
        const check2 = req.body.mact2;
        if (user === '' || passWord === '') {
            const msg = 'Vui lòng nhập đầy đủ!';
            res.render('login', { msg });
            return;
        }
        if (check == check2) {
            User.findOne({ user: user, passWord: passWord })
                .then(data => {
                    if (data) {
                        res.cookie('userId', data._id, {
                            signed: true
                        });
                        res.redirect('/');
                    } else {
                        const msg = 'Tài khoản hoặc mật khẩu không chính xác!!';
                        res.render('login', { msg });
                    }
                })
        } else {
            const msg = 'Mã xác thực không chính xác!!';
            res.render('login', { msg });
        }
    }
    signup(req, res) {
        const title = 'Đăng ký';
        res.render('signup', { title });
    }
    checksignup(req, res) {
        const title = 'Đăng ký';
        const { fullName, user, email, passWord, passWord2 } = req.body;
        if (user === '' || fullName === '' || email === '' || passWord === '') {
            const msg = 'Vui lòng nhập đầy đủ thông tin!';
            res.render('signup', { msg, title, fullName, user, email, erro_up: true });
            return;
        }
        if (user.includes(" ")) {
            const msg = 'Tên đăng nhập phải viết liền';
            res.render('signup', { msg, title, fullName, email, erro_up: true });
            return;
        }
        if (email) {
            const test = (value) => {
                var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                return regex.test(value) ? true : false;
            }
            if (!test(email)) {
                const msg = 'Sai định dạng Email'
                res.render('signup', { msg, title, fullName, user, erro_up: true });
                return;
            }
        }
        if (user.length < 4) {
            const msg = 'Tên đăng nhập từ 4 kí tự trở lên';
            res.render('signup', { msg, title, fullName, email, erro_up: true });
            return;
        }
        if (passWord.length < 5 || passWord.length > 20) {
            const msg = 'Mật khẩu gồm 5-20 kí tự';
            res.render('signup', { msg, title, fullName, user, email, erro_up: true });
            return;
        }
        if (passWord == passWord2) {
            User.findOne({ email: email })
                .then(dataemail => {
                    if (dataemail) {
                        const msg = 'Email đã được sử dụng!';
                        res.render('signup', { msg, title, fullName, user, erro_up: true });
                        return;
                    } else {
                        User.findOne({ user: user })
                            .then(data => {
                                if (data) {
                                    const msg = 'Tài khoản đã tồn tại!';
                                    res.render('signup', { msg, title, fullName, email, erro_up: true });
                                    return;

                                } else {
                                    let errors = [];
                                    if (!user) {
                                        errors.push({ msg: 'Nhập tên tài khoản!' });
                                    } else {
                                        const md5passWord = md5(passWord);
                                        const newUser = new User({ user: user, fullName: fullName, email: email, passWord: md5passWord });
                                        newUser.save();
                                        res.render('signup', { success: true });
                                    }
                                }
                            });
                    }

                });
        }
        else {
            const msg = 'Mật khẩu không trùng khớp!';
            res.render('signup', { msg, fullName, user, email, erro_up: true });
        }
    }

    logout(req, res) {
        res.clearCookie('userId')
        res.redirect('/');
    }
    profile(req, res, next) {
        const title = 'Setting';
        User.findOne({ _id: req.signedCookies.userId })
            .then(profile => {
                res.render('profile', { profile: mongooseToObject(profile), title });
            })
            .catch(next);
    }
    async message(req, res, next) {
        try {
            var countNotifi = 0;
            let infoUser = await User.findOne({ _id: req.signedCookies.userId })
            delete infoUser.passWord
            let listContact = await ContactModel.find({
                $or: [{
                    userId: req.signedCookies.userId
                }, {
                    contactId: req.signedCookies.userId
                }]
            })
                .populate("userId", "_id fullName user avatar")
                .populate("contactId", "_id fullName user avatar")
                .sort({ "updatedAt": 1 })
                .lean()
                .exec();
            //list contact của người dùng
            let getAllConversations = listContact.map((contactItem) => {
                let getUserContact = {};
                if (String(contactItem.userId._id) === String(req.signedCookies.userId)) {
                    getUserContact = Object.assign(getUserContact, contactItem.contactId)
                    getUserContact.updatedAt = contactItem.updatedAt;
                    return getUserContact
                } else {
                    getUserContact = Object.assign(getUserContact, contactItem.userId)
                    getUserContact.updatedAt = contactItem.updatedAt;
                    return getUserContact
                }
            })
            //hiển thị toàn bộ cuộc hội thoại
            let allConversationsWithMessagePromise = getAllConversations.map(async (converstationItem) => {
                let listMessage = await MessageModel.find({
                    $or: [{
                        $and: [{
                            "senderId": converstationItem._id,
                            "receiverId": req.signedCookies.userId
                        }]
                    }, {
                        $and: [{
                            "receiverId": converstationItem._id,
                            "senderId": req.signedCookies.userId
                        }]
                    }]
                })
                    .sort({ "updatedAt": 1 })
                    .lean()
                    .exec();

                let listNotification = await NotificationModel.find({
                    sender: converstationItem._id,
                    receiver: req.user._id,
                    isRead: false
                })
                
                converstationItem.messages = listMessage
                converstationItem.notification = listNotification
                if(listNotification.length) countNotifi++;
                return converstationItem
            })
            let allConversationsWithMessage = await Promise.all(allConversationsWithMessagePromise)
            if (req.query.thread) {
                let listMessage = await MessageModel.find({
                    $or: [{
                        $and: [{
                            "senderId": req.query.thread,
                            "receiverId": req.signedCookies.userId
                        }]
                    }, {
                        $and: [{
                            "receiverId": req.query.thread,
                            "senderId": req.signedCookies.userId
                        }]
                    }]
                })
                    .sort({ "updatedAt": 1 })
                    .lean()
                    .exec();
                let infoUserReceiver = await User.findOne({ _id: req.query.thread })
                await NotificationModel.updateMany({
                    sender: req.query.thread,
                    receiver: req.user._id,
                },{
                    isRead: true
                }, {upsert: true})
                delete infoUserReceiver.passWord
                let allConversationsWithMessagePromise = getAllConversations.map(async (converstationItem) => {
                    let listMessage = await MessageModel.find({
                        $or: [{
                            $and: [{
                                "senderId": converstationItem._id,
                                "receiverId": req.signedCookies.userId
                            }]
                        }, {
                            $and: [{
                                "receiverId": converstationItem._id,
                                "senderId": req.signedCookies.userId
                            }]
                        }]
                    })
                        .sort({ "updatedAt": 1 })
                        .lean()
                        .exec();
    
                    let listNotification = await NotificationModel.find({
                        sender: converstationItem._id,
                        receiver: req.user._id,
                        isRead: false
                    })
                    converstationItem.messages = listMessage
                    converstationItem.notification = listNotification
                    return converstationItem
                })
                let allConversationsWithMessage = await Promise.all(allConversationsWithMessagePromise)
                return res.render("message", {
                    getAllMessage: listMessage,
                    user: infoUser,
                    statusMessage: true,
                    allConversationsWithMessage,
                    infoUserReceiver,
                    showInputText: true
                })
            }
            // console.log(countNotifi)
            // if(countNotifi){
            //     res.locals.amountNoti=countNotifi
            // }else{
            //     res.locals.amountNoti = null;
            // }
            return res.render("message", {
                allConversationsWithMessage,
                getAllConversations,
                user: infoUser,
                statusMessage: false,
                showInputText: false
            })
        } catch (error) {
            return res.render("message")
        }
    }
}

module.exports = new SiteController();