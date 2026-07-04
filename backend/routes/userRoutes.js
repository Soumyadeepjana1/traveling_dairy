import express from 'express';
import {
  updateProfile,
  uploadAvatar,
  changePassword,
  getUserProfile,
  getAllUsers,
  deleteUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.put(
  '/profile',
  [body('name').optional().trim().notEmpty(), body('bio').optional().trim()],
  validate,
  updateProfile
);
router.put('/avatar', uploadSingle, uploadAvatar);
router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  changePassword
);
router.get('/', authorize('admin'), getAllUsers);
router.delete('/:id', authorize('admin'), deleteUser);
router.get('/:id', getUserProfile);

export default router;
