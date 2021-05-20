const express = require('express');
const router = express.Router();
const ReplyCommentController = require('../controller/replyCommentController');
const authMiddlewares = require('../middlewares/authmiddlewares');

router.post('/',authMiddlewares.requireAuth, ReplyCommentController.createReplyComment);
router.get('/:idComment',authMiddlewares.requireAuth, ReplyCommentController.getReplyCommentOfComment);

module.exports = router;
