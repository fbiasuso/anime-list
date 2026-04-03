import { Router } from 'express';
import {
  getSeasonAnimes,
  getUserAnimes,
  updateProgress,
  removeProgress,
  rateAnime,
} from '../controllers/anime.controller';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Public: Get animes from season (with optional auth for user progress)
router.get('/season', getSeasonAnimes);

// Protected routes
router.get('/user', authenticateToken, getUserAnimes);
router.put('/:id/progress', authenticateToken, updateProgress);
router.delete('/:id/progress', authenticateToken, removeProgress);
router.post('/:id/rate', authenticateToken, rateAnime);

export default router;
