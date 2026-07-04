import express from 'express';
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Comment routes mounted at /api
router.get('/trips/:tripId/comments', getComments);
router.post(
  '/trips/:tripId/comments',
  protect,
  [body('text').trim().notEmpty().withMessage('Comment text is required')],
  validate,
  addComment
);

router.put('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);
router.put('/comments/:id/like', protect, toggleCommentLike);

export default router;
