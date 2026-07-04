import express from 'express';
import {
  toggleFavorite,
  getFavorites,
  checkFavorite,
} from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getFavorites);
router.get('/check/:tripId', checkFavorite);
router.post('/:tripId', toggleFavorite);

export default router;
