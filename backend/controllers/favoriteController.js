import Favorite from '../models/Favorite.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Toggle favorite trip
// @route   POST /api/favorites/:tripId
export const toggleFavorite = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) throw new AppError('Trip not found', 404);

    const existing = await Favorite.findOne({ user: req.user._id, trip: tripId });

    if (existing) {
      await existing.deleteOne();
      await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarkedTrips: tripId } });
      res.json({ success: true, data: { isFavorited: false } });
    } else {
      await Favorite.create({ user: req.user._id, trip: tripId });
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookmarkedTrips: tripId } });
      res.json({ success: true, data: { isFavorited: true } });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user favorites
// @route   GET /api/favorites
export const getFavorites = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [favorites, total] = await Promise.all([
      Favorite.find({ user: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate({ path: 'trip', populate: { path: 'user', select: 'name avatar' } }),
      Favorite.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: {
        favorites,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if trip is favorited
// @route   GET /api/favorites/check/:tripId
export const checkFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({ user: req.user._id, trip: req.params.tripId });
    res.json({ success: true, data: { isFavorited: !!favorite } });
  } catch (error) {
    next(error);
  }
};
