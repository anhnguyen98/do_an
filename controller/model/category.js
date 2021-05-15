const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CateSchema = new Schema({
    idCourse: String,
    nameLesson: String,
    idVideo: String,
    content: String,
}, {
    collection: "lessons"
});

module.exports = mongoose.model("lessons", LessonSchema)