const express = require('express');
const { signup } = require('../controller/siteController');
const router = express.Router();
const siteController = require('../controller/siteController');
const authMiddlewares = require('../middlewares/authmiddlewares');
const initPassPortLocal = require("../controller/passportController/local");
const passport = require("passport")
initPassPortLocal()
router.post("/login", function(req, res, next) {
    const userData = req.body.user;
    const passWord = req.body.passWord
    const check = req.body.mact;
    const check2 = req.body.mact2;
    if (userData === ''||passWord===''){
        const msg ='Vui lòng nhập đầy đủ!';
        res.render('login',{msg});
        return;
    }
    if(check === check2){
        passport.authenticate('local', function(err, user, info) {
            if (err) { 
                return res.render('login',{err});
            }
            if (!user) {  
                const msg ='Tài khoản hoặc mật khẩu không chính xác!!';
                return res.render('login',{msg}); 
            }
            // req / res held in closure
            req.logIn(user, function(err) {
              if (err) { 
                    const msg ='Vui lòng thử lại';
                    return res.render('login',{msg});
                }
              res.cookie('userId', user._id,{
                  signed: true
              });
              return res.redirect('/');
            });
        
          })(req, res, next);
    }else{
        const msg ='Mã xác thực không chính xác!!';
        res.render('login',{msg});
        return;
    }
    // generate the authenticate method and pass the req/res

  
  });
router.get('/profile',authMiddlewares.requireAuth,siteController.profile);
router.get('/backend', siteController.backend);
router.get('/frontend', siteController.frontend);
router.get('/logout', siteController.logout);
// router.post('/login', siteController.checklogin);
router.post('/signup', siteController.checksignup);
router.get('/course', siteController.course);
router.get('/signup', siteController.signup);
router.get('/login', siteController.login);
router.get('/', siteController.index);
router.get("/message", authMiddlewares.requireLogin, siteController.message)

module.exports = router;