
const { find } = require('../controller/model/user');
const User = require('../controller/model/user');
module.exports.requireAuth =async function(req, res, next){
    if(!req.signedCookies.userId){
        res.redirect('/login');
        return;
    }
    else {
        try {
            var user = await User.findOne({ _id: req.signedCookies.userId })
            if(!user){
                res.redirect('/');
                return;
            } 
            req.user = user
            next();
        } catch (error) {
            return next(error)
        }
    }

};

module.exports.requireAdmin = function(req, res, next){
    User.findOne({_id: req.signedCookies.userId})
    .then(user => {
        if (user.position !== 'admin') {
            redirect('/')
            return;
        }
    })
    next();
};

module.exports.requireLogin = function(req, res, next){
    if(!req.signedCookies.userId){
        res.redirect('/');
        return;
    }
    next();
};

module.exports.requireUser = function(req, res, next){
    if(req.signedCookies.userId){
        User.findOne({_id: req.signedCookies.userId})
        .then(data=> {
            if(data){
                res.locals.name = data.user;
                res.locals.avatar = data.avatar;
            }
        })
    }
    next();
};

module.exports.requireAdminLogin = function(req, res, next){
    if(req.signedCookies.userId){
        User.findOne({_id: req.signedCookies.userId})
        .then(data=> {
            if (data.position == 'admin'){
                res.locals.admin = true;
                res.locals.avatar = data.avatar;
            } 
            
        })
    }
    next();
};

module.exports.requireUserlogin = function(req, res, next){
    if (req.signedCookies.userId){
        res.locals.login = true;
    }
    next();
};