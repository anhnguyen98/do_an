const passport = require('passport');
const passportLocal = require('passport-local');
let LocalStrategy = passportLocal.Strategy;
const md5 = require('md5');

const UserModel = require('../model/user');
/*
valid user account type: local
*/
let initPassPortLocal = () => {
    passport.use(new LocalStrategy({
        usernameField: "user",
        passwordField: "passWord",
        passReqToCallback: true
    }, async (req, account, passWord, done) => {
        try {
            let infoUser = await UserModel.findOne({ user: account, passWord: md5(passWord) });
            if (!infoUser) {
                return done("không tìm thấy user")
            }
            return done(null, infoUser)
        } catch (error) {
            return done( "lỗi server")
        }
    }));
    // Save userId to session
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })
    passport.deserializeUser((id, done) => {
        UserModel.findOne({_id: id})
        .lean()
        .exec()
        .then((user) => {
            return done(null, user)
        }).catch((err) => {
            return done(err, null)
        });
    })
}

module.exports = initPassPortLocal