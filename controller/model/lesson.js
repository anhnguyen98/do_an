const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LessonSchema = new Schema({
    idCourse: {
        type: String,
        trim: true
    },
    nameLesson: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        trim: true
    },
    idIndexLesson:{
        type: String
    },
    idVideo:{
        type: String,
        trim: true
    },
    timeLesson: {
        type: String,
        trim: true
    }
}, {
    collection: "lessons"
});

module.exports = mongoose.model("lessons", LessonSchema)