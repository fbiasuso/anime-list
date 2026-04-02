import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaUserRepository } from '../infrastructure/user.repository';
import { generateToken, AuthRequest } from '../middleware/auth';

const userRepository = new PrismaUserRepository();

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
