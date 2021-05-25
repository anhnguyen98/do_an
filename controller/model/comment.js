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
CommentSchema.virtual('listReplyComment', {
    ref: 'replyComments', // The model to use
    localField: 'replyComment', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false,
  })
  CommentSchema.set('toObject', { virtuals: true });
CommentSchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('comments', CommentSchema);