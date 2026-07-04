import Comment from '../models/Comment.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Add comment to trip
// @route   POST /api/trips/:tripId/comments
export const addComment = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) throw new AppError('Trip not found', 404);

    const comment = await Comment.create({
      user: req.user._id,
      trip: req.params.tripId,
      text: req.body.text,
      parentComment: req.body.parentComment || null,
    });

    trip.commentsCount += 1;
    await trip.save();

    // Notify trip owner
    if (trip.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: trip.user,
        sender: req.user._id,
        type: 'comment',
        trip: trip._id,
        message: `${req.user.name} commented on your trip "${trip.title}"`,
      });
    }

    const populated = await comment.populate('user', 'name avatar');

    res.status(201).json({ success: true, data: { comment: populated } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a trip
// @route   GET /api/trips/:tripId/comments
export const getComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [comments, total] = await Promise.all([
      Comment.find({ trip: req.params.tripId })
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name avatar'),
      Comment.countDocuments({ trip: req.params.tripId }),
    ]);

    res.json({
      success: true,
      data: {
        comments,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
export const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) throw new AppError('Comment not found', 404);
    if (comment.user.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    comment.text = req.body.text;
    await comment.save();

    const populated = await comment.populate('user', 'name avatar');
    res.json({ success: true, data: { comment: populated } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) throw new AppError('Comment not found', 404);
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AppError('Not authorized', 403);
    }

    await Trip.findByIdAndUpdate(comment.trip, { $inc: { commentsCount: -1 } });
    await comment.deleteOne();

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on comment
// @route   PUT /api/comments/:id/like
export const toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) throw new AppError('Comment not found', 404);

    const index = comment.likes.indexOf(req.user._id);
    if (index === -1) {
      comment.likes.push(req.user._id);
      comment.likesCount += 1;
    } else {
      comment.likes.splice(index, 1);
      comment.likesCount -= 1;
    }

    await comment.save();
    res.json({ success: true, data: { liked: index === -1, likesCount: comment.likesCount } });
  } catch (error) {
    next(error);
  }
};
