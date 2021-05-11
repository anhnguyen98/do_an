const CommentModel = require('./model/comment');
const CourseModel = require('./model/course');
const ReplyCommentModel = require('./model/replyComment');

class ReplyCommentController {
    async getReplyCommentOfComment(req, res, next) {
        try {
            let idComment = req.params.idComment;
            let getReplyComment = await ReplyCommentModel.find({
                idComment
            })
            .populate("idUser", "_id user")
            .lean()
            .exec()
            return res.status(200).json({
                message: "Hiển thị trả lời bình luận thành công",
                data: getReplyComment,
                idUser: req.user._id,
                idComment
            })
        } catch (error) {
            next(error)
        }
    }

    async createReplyComment(req, res, next) {
        try {
            let { idComment, content } = req.body;
            let replyComment = await ReplyCommentModel.create({
                idUser: req.user._id,
                content,
                idComment
            });
            await CommentModel.updateOne({ _id: idComment }, { $push: { replyComment: String(replyComment._id) } })
            return res.status(200).json({
                message: "Thêm trả lời bình luận thành công",
            })
        } catch (error) {
            next(error)
        }
    }
}
module.exports = new ReplyCommentController();