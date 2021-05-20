const CommentModel = require('./model/comment');
const CourseModel = require('./model/course');
const ReplyCommentModel = require('./model/replyComment');
const blackListCharacter = require("../config/blackListCharacter")
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
            let listWordCheck = content.split(" ");
            let listWordChecked = listWordCheck.map(word => blackListCharacter.includes(word) ? //if word is in banned
                '*'.repeat(word.length) // replace with *
                :
            word)
            let contentChecked = listWordChecked.join(' ')
            let comment = await CommentModel.create({
                idUser: req.user._id,
                content: contentChecked,
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
            let {idComment} = req.params;
            let infoComment = await CommentModel.findOne({_id: idComment})
            await  CommentModel.deleteOne({_id: idComment});
            await CourseModel.updateOne({
                _id: infoComment.idCourse
            }, {
                $pull: {
                    commentId: idComment
                }
            })
            return res.json({
                status:200,
                message: "Xóa bình luận thành công",
            })
        } catch (error) {
            return res.json({
                status:400,
                message: "Xóa bình luận không thành công",
            })
        }
    }
    async updateRateComment(req, res, next){
        try {
            let {idComment} = req.params;
            let {rate} = req.body
            if(parseInt(rate) === 1){
                let body = {
                    rate: rate,
                    idUser: req.user._id
                }
                let newComment = await CommentModel.findOneAndUpdate({_id: idComment}, {
                    $push: {
                        rate: body
                    }
                }, {new: true})
                return res.status(200).json({
                    message: "Đánh giá thành công",
                    data: newComment,
                    status: 200
                })
            }
            let newComment = await CommentModel.findOneAndUpdate({_id: idComment}, {
                $pull: {
                    rate: {
                        idUser: req.user._id
                    }
                }
            }, { new: true })
            return res.status(200).json({
                message: "Đánh giá thành công",
                data: newComment,
                status: 200
            })
        } catch (error) {
            return res.json({
                status:400,
                message: "Đánh giá không thành công",
            })
        }
    }
}
module.exports = new CommentController();