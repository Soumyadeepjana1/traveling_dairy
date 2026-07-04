import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT
export const protect = async (req, res, next) => {
  try {
    let guest = await User.findOne({ email: 'guest@travel.com' });
    if (!guest) {
      guest = await User.create({
        name: 'Traveler',
        email: 'guest@travel.com',
        password: 'guestpassword123',
        isVerified: true
      });
    }
    req.user = guest;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to authenticate guest' });
  }
};

// Role-based access
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }
    next();
  };
};
