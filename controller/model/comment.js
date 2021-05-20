const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    idUser: {
        type: String,
        ref:"users"
    },
    content: String,
    updatedAt: {
        type: Number,
        default: Date.now
    },
    createdAt: {
        type: Number,
        default: Date.now
    },
    replyComment: [{
        type: String,
        ref: "replyComments"
    }],
    idCourse: {
        type: String,
        ref: "posts"
    },
    rate: [{
        idUser: String,
        rate: Number
    }],
    status: {
        type: String,
        default: "active"
    }
}, {
   collection: 'comments'
});

module.exports = mongoose.model('comments', CommentSchema);