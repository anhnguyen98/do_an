let path = require("path")
require("dotenv").config({path: path.join(__dirname,  "../.env")})
const session = require("express-session");
const connectMongo =  require('connect-mongo');
/*
    *this variable is where session, in this case is mongodb
*/
let mongoStore = connectMongo(session);
let sessionStore = new mongoStore({
    url: process.env.DB_URL_LOCAL,
    autoReconnect: true
})
/*
    *Config session for app
    *@param app from exactly express module
*/
let configSession = (app)=>{
    app.use(session({
        key:"express.sid",
        secret:"mySecret",
        store:sessionStore,
        resave:true,
        saveUninitialized:false,
        cookie:{
            maxAge:60*60*24*1000
        }
    }))
}
module.exports= {
    config: configSession,
    sessionStore
};