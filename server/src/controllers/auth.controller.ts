import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaUserRepository } from '../infrastructure/user.repository';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';

const userRepository = new PrismaUserRepository();

// Available timezones
export const TIMEZONES = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (ART - UTC-3)', offset: -3 },
  { value: 'America/New_York', label: 'EE.UU. Este (EST - UTC-5)', offset: -5 },
  { value: 'America/Los_Angeles', label: 'EE.UU. Pacífico (PST - UTC-8)', offset: -8 },
  { value: 'Europe/London', label: 'Reino Unido (GMT/BST)', offset: 0 },
  { value: 'Asia/Tokyo', label: 'Japón (JST - UTC+9)', offset: 9 },
];

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user exists
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already in use', code: 'EMAIL_EXISTS' });
    }

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken', code: 'USERNAME_EXISTS' });
    }

    const user = await userRepository.create(data);
    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        timezone: user.timezone,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        timezone: user.timezone,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/auth/timezones - Get available timezones
export const getTimezones = async (req: AuthRequest, res: Response) => {
  res.json({ timezones: TIMEZONES });
};

// PUT /api/auth/timezone - Update user's timezone
export const updateTimezone = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { timezone } = req.body;

    if (!timezone || !TIMEZONES.some(tz => tz.value === timezone)) {
      return res.status(400).json({ error: 'Invalid timezone' });
    }

    const user = await userRepository.update(userId, { timezone });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        timezone: user.timezone,
      },
    });
  } catch (error) {
    console.error('Update timezone error:', error);
    res.status(500).json({ error: 'Failed to update timezone' });
  }
};
