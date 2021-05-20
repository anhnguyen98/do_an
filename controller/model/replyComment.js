const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplyCommentSchema = new Schema({
    idUser: {
        type: String,
        ref: "users"
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
    idComment: String,
    rate: [],
    status: {
        type: String,
        default: "active"
    }
}, {
   collection: 'replyComments'
});

module.exports = mongoose.model('replyComments', ReplyCommentSchema);