const mongoose = require('mongoose');
async function connect(){
    try{
        await mongoose.connect('mongodb+srv://anhnguyen:Cntt123@cluster0.6a0yh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
         });
        console.log("Connect successfully!!!");
    }catch (error) {
        console.log("Connect failure!!!");
    }
} 
module.exports = { connect };
