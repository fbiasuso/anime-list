import { Router } from 'express';
import {
  getSeasonAnimes,
  getUserAnimes,
  updateProgress,
  rateAnime,
} from '../controllers/anime.controller';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Public: Get animes from season (fetches from AniList)
router.get('/season', getSeasonAnimes);

// Protected routes
router.get('/user', authenticateToken, getUserAnimes);
router.put('/:id/progress', authenticateToken, updateProgress);
router.post('/:id/rate', authenticateToken, rateAnime);

export default router;
