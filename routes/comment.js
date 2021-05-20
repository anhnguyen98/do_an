const express = require('express');
const router = express.Router();
const CommentController = require('../controller/commentController');
const authMiddlewares = require('../middlewares/authmiddlewares');
// newsController.indexs
router.post('/',authMiddlewares.requireAuth, CommentController.createComment);
router.get('/:idCourse', CommentController.getCommentOfCourse);
router.put('/change-status/:idComment', CommentController.changeStatusComment);
router.put('/rate/:idComment', authMiddlewares.requireAuth, CommentController.updateRateComment);
router.delete('/:idComment', CommentController.deleteComment);

module.exports = router;
