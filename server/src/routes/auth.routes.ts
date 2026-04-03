import { Router } from 'express';
import { register, login, getTimezones, updateTimezone } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/timezones', getTimezones);
router.put('/timezone', authenticateToken, updateTimezone);

export default router;
