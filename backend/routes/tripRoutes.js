import express from 'express';
import {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  toggleFavorite,
  uploadCoverImage,
  uploadTripImages,
  deleteTripImage,
  getDashboardStats,
} from '../controllers/tripController.js';
import { protect } from '../middleware/auth.js';
import { uploadMultiple, uploadSingle } from '../middleware/upload.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/dashboard/stats', protect, getDashboardStats);

router.get('/', getTrips);
router.get('/:id', getTrip);

router.use(protect);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('destination').trim().notEmpty().withMessage('Destination is required'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
  ],
  validate,
  createTrip
);

router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.put('/:id/favorite', toggleFavorite);
router.put('/:id/cover', uploadSingle, uploadCoverImage);
router.put('/:id/images', uploadMultiple, uploadTripImages);
router.delete('/:id/images/:imageId', deleteTripImage);

export default router;
