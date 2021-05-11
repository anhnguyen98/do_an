const CommentModel = require('./model/comment');
const CourseModel = require('./model/course');
const ReplyCommentModel = require('./model/replyComment');

class CommentController {
    async getCommentOfCourse(req, res, next) {
        try {
            let idCourse = req.params.idCourse;
            let getComment = await CommentModel.find({
                idCourse
            })
                .populate("idUser", "_id user")
                .populate("replyComments")
            return res.status(200).json({
                message: "Hiển thị bình luận thành công",
                data: getComment,
                idUser: req.user._id
            })
        } catch (error) {
            next(error)
        }
    }

    async createComment(req, res, next) {
        try {
            let { idCourse, content } = req.body;
            let comment = await CommentModel.create({
                idUser: req.user._id,
                content,
                idCourse
            });
            let addCommentToCourse = await CourseModel.updateOne({ _id: idCourse }, { $push: { commentId: String(comment._id) } })
            return res.status(200).json({
                message: "Thêm bình luận thành công",
                data: comment
            })
        } catch (error) {
            next(error)
        }
    }

    async changeStatusComment(req, res, next) {
        try {
            let {idComment} = req.params
            let {status} = req.body;
            let newStatusComment = await  CommentModel.findOneAndUpdate({_id: idComment}, {status}, {new: true});
            return res.json({
                status:200,
                message: "Cập nhật trạng thái thành công",
                data: newStatusComment
            })
        } catch (error) {
            return res.json({
                status:400,
                message: "Cập nhật trạng thái không thành công",
            })
        }
    }

    async deleteComment(req, res, next){
        try {
            let {idComment} = req.params
            await  CommentModel.deleteOne({_id: idComment});
            return res.json({
                status:200,
                message: "Xóa bình luận thành công",
            })
        } catch (error) {
            return res.json({
                status:200,
                message: "Xóa bình luận không thành công",
            })
        }
    }
}
module.exports = new CommentController();