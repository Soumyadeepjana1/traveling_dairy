import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Create a trip
// @route   POST /api/trips
export const createTrip = async (req, res, next) => {
  try {
    const tripData = { ...req.body, user: req.user._id };

    // Parse tags if string
    if (typeof tripData.tags === 'string') {
      tripData.tags = tripData.tags.split(',').map((t) => t.trim());
    }
    // Parse expenses if string
    if (typeof tripData.expenses === 'string') {
      try {
        tripData.expenses = JSON.parse(tripData.expenses);
      } catch {
        tripData.expenses = [];
      }
    }

    // Calculate total spent
    if (tripData.expenses?.length) {
      tripData.spent = tripData.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    }

    const trip = await Trip.create(tripData);

    res.status(201).json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all trips (with search, filter, sort, pagination)
// @route   GET /api/trips
export const getTrips = async (req, res, next) => {
  try {
    const {
      search, category, country, mood, weather,
      favorite, sortBy, page = 1, limit = 12, user: userId,
    } = req.query;

    const filter = {};

    // Only show public trips or user's own
    if (userId) {
      filter.user = userId;
    }

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) filter.category = category;
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (mood) filter.mood = mood;
    if (weather) filter.weather = weather;
    if (favorite === 'true') filter.isFavorite = true;

    // Sort
    let sort = { createdAt: -1 };
    if (sortBy === 'oldest') sort = { createdAt: 1 };
    else if (sortBy === 'rating') sort = { rating: -1 };
    else if (sortBy === 'budget') sort = { budget: -1 };
    else if (sortBy === 'alpha') sort = { title: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [trips, total] = await Promise.all([
      Trip.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).populate('user', 'name avatar'),
      Trip.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        trips,
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

// @desc    Get single trip
// @route   GET /api/trips/:id
export const getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('user', 'name avatar bio');
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }
    res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
export const updateTrip = async (req, res, next) => {
  try {
    let trip = await Trip.findById(req.params.id);
    if (!trip) throw new AppError('Trip not found', 404);

    const updates = { ...req.body };
    if (typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t) => t.trim());
    }
    if (typeof updates.expenses === 'string') {
      try { updates.expenses = JSON.parse(updates.expenses); } catch { updates.expenses = trip.expenses; }
    }
    if (updates.expenses?.length) {
      updates.spent = updates.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    }).populate('user', 'name avatar');

    res.json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new AppError('Trip not found', 404);

    // Delete images from cloudinary
    if (trip.coverImage?.publicId) {
      await cloudinary.uploader.destroy(trip.coverImage.publicId);
    }
    for (const img of trip.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
    }

    await trip.deleteOne();
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite
// @route   PUT /api/trips/:id/favorite
export const toggleFavorite = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new AppError('Trip not found', 404);

    const index = trip.likes.indexOf(req.user._id);
    if (index === -1) {
      trip.likes.push(req.user._id);
      trip.likesCount += 1;

      if (trip.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: trip.user,
          sender: req.user._id,
          type: 'like',
          trip: trip._id,
          message: `${req.user.name} liked your trip "${trip.title}"`,
        });
      }
    } else {
      trip.likes.splice(index, 1);
      trip.likesCount -= 1;
    }

    await trip.save();
    res.json({ success: true, data: { isFavorited: index === -1, likesCount: trip.likesCount } });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload trip cover image
// @route   PUT /api/trips/:id/cover
export const uploadCoverImage = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new AppError('Trip not found', 404);

    if (!req.file) throw new AppError('Please upload an image', 400);

    if (trip.coverImage?.publicId) {
      await cloudinary.uploader.destroy(trip.coverImage.publicId);
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'traveldiary/covers', transformation: [{ width: 1200, height: 600, crop: 'fill' }] },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    trip.coverImage = { url: result.secure_url, publicId: result.public_id };
    await trip.save();

    res.json({ success: true, data: { coverImage: trip.coverImage } });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload trip images
// @route   PUT /api/trips/:id/images
export const uploadTripImages = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new AppError('Trip not found', 404);
    if (!req.files?.length) throw new AppError('Please upload at least one image', 400);

    const uploaded = [];
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'traveldiary/trips', transformation: [{ width: 1200, height: 800, crop: 'limit' }] },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });
      uploaded.push({ url: result.secure_url, publicId: result.public_id });
    }

    trip.images.push(...uploaded);
    await trip.save();

    res.json({ success: true, data: { images: trip.images } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trip image
// @route   DELETE /api/trips/:id/images/:imageId
export const deleteTripImage = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new AppError('Trip not found', 404);

    const image = trip.images.id(req.params.imageId);
    if (!image) throw new AppError('Image not found', 404);

    if (image.publicId) await cloudinary.uploader.destroy(image.publicId);
    trip.images.pull(req.params.imageId);
    await trip.save();

    res.json({ success: true, data: { images: trip.images } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/trips/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalTrips, favoriteTrips, upcomingTrips, recentTrips, categoryStats, monthlyStats] =
      await Promise.all([
        Trip.countDocuments({ user: userId }),
        Trip.countDocuments({ user: userId, isFavorite: true }),
        Trip.countDocuments({ user: userId, startDate: { $gte: new Date() } }),
        Trip.find({ user: userId }).sort('-createdAt').limit(5).populate('user', 'name avatar'),
        Trip.aggregate([
          { $match: { user: userId } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Trip.aggregate([
          { $match: { user: userId } },
          {
            $group: {
              _id: { year: { $year: '$startDate' }, month: { $month: '$startDate' } },
              count: { $sum: 1 },
              totalBudget: { $sum: '$budget' },
            },
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 },
        ]),
      ]);

    // Unique countries
    const countries = await Trip.distinct('country', { user: userId });

    res.json({
      success: true,
      data: {
        totalTrips,
        favoriteTrips,
        upcomingTrips,
        countriesVisited: countries.length,
        recentTrips,
        categoryStats,
        monthlyStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
