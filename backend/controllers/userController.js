import User from '../models/User.js';
import Trip from '../models/Trip.js';
import { AppError } from '../middleware/errorHandler.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Update profile
// @route   PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   PUT /api/users/avatar
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Please upload an image', 400);
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    // Upload new avatar
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'traveldiary/avatars', transformation: [{ width: 300, height: 300, crop: 'fill' }] },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    user.avatar = { url: result.secure_url, publicId: result.public_id };
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, data: { avatar: user.avatar } });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.password = newPassword;
    user.refreshToken = null;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('tripCount');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const trips = await Trip.find({ user: req.params.id, isPublic: true })
      .sort('-createdAt')
      .limit(10);

    res.json({ success: true, data: { user, trips } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/users
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit).sort('-createdAt');
    const total = await User.countDocuments();

    res.json({
      success: true,
      data: { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await Trip.deleteMany({ user: req.params.id });
    await user.deleteOne();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
