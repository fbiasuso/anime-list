import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaAnimeRepository } from '../infrastructure/anime.repository';
import { aniListService } from '../services/anilist.service';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { PrismaClient, UserAnimeProgress } from '@prisma/client';

const prisma = new PrismaClient();
const animeRepository = new PrismaAnimeRepository();

const seasonSchema = z.object({
  season: z.enum(['WINTER', 'SPRING', 'SUMMER', 'FALL']),
  year: z.coerce.number().min(2000).max(2030),
});

const progressSchema = z.object({
  status: z.enum(['WATCHING', 'COMPLETED', 'DROPPED', 'PLAN_TO_WATCH']),
  episode: z.number().min(0).optional(),
  rating: z.number().min(1).max(10).optional(),
});

// GET /api/anime/season?season=SPRING&year=2024
export const getSeasonAnimes = async (req: AuthRequest, res: Response) => {
  try {
    const { season, year } = seasonSchema.parse(req.query);
    
    // Try to extract userId from token if present (optional auth)
    let userId: number | undefined;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const secret = process.env.JWT_SECRET || 'default-secret';
          const decoded = jwt.verify(token, secret) as { userId: number };
          userId = decoded.userId;
        } catch (e) {
          // Token invalid, ignore
        }
      }
    }

    // Fetch from AniList
    const animes = await aniListService.getSeasonAnimes(season, year);

    // Save to local DB (upsert)
    const savedAnimes = await Promise.all(
      animes.map((anime) =>
        animeRepository.upsert({
          anilistId: anime.id,
          title: anime.title.romaji,
          titleEnglish: anime.title.english ?? undefined,
          description: anime.description ?? undefined,
          coverImage: anime.coverImage.large ?? undefined,
          format: anime.format,
          season: anime.season,
          seasonYear: anime.seasonYear,
          episodes: anime.episodes ?? undefined,
        })
      )
    );

    // Calculate airing day from startDate
    const dayMap: Record<number, string> = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
    };

    const animesWithDay = savedAnimes.map((anime, idx) => {
      const original = animes[idx];
      let airingDay = anime.airingDay;
      if (original.startDate?.day && original.startDate?.month && original.startDate?.year) {
        const date = new Date(original.startDate.year, original.startDate.month - 1, original.startDate.day);
        airingDay = dayMap[date.getDay()] || null;
      }
      return { ...anime, airingDay };
    });

    // Get user progress for these animes (if user is authenticated)
    let animesWithProgress = animesWithDay.map((anime) => ({
      ...anime,
      status: undefined as string | undefined,
      userEpisode: undefined as number | undefined,
      rating: undefined as number | undefined,
    }));

    // If user is authenticated, get their progress
    if (userId) {
      const animeIds = animesWithDay.map((a) => a.id);
      const progress = await prisma.userAnimeProgress.findMany({
        where: {
          userId: req.userId,
          animeId: { in: animeIds },
        },
      });

      const progressMap = new Map(progress.map((p) => [p.animeId, p]));

      animesWithProgress = animesWithDay.map((anime) => {
        const userProgress = progressMap.get(anime.id);
        return {
          ...anime,
          status: userProgress?.status,
          userEpisode: userProgress?.episode,
          rating: userProgress?.rating ?? undefined,
        };
      });
    }

    res.json({ animes: animesWithProgress });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid parameters', details: error.errors });
    }
    console.error('Get season animes error:', error);
    res.status(500).json({ error: 'Failed to fetch animes' });
  }
};

// GET /api/anime/user - Get user's anime list with progress
export const getUserAnimes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const progress = await prisma.userAnimeProgress.findMany({
      where: { userId },
      include: { anime: true },
    });

    res.json({
      animes: progress.map((p) => ({
        id: p.anime.id,
        anilistId: p.anime.anilistId,
        title: p.anime.title,
        titleEnglish: p.anime.titleEnglish,
        coverImage: p.anime.coverImage,
        format: p.anime.format,
        season: p.anime.season,
        seasonYear: p.anime.seasonYear,
        episodes: p.anime.episodes,
        airingDay: p.anime.airingDay,
        status: p.status,
        userEpisode: p.episode,
        rating: p.rating,
      })),
    });
  } catch (error) {
    console.error('Get user animes error:', error);
    res.status(500).json({ error: 'Failed to fetch user animes' });
  }
};

// PUT /api/anime/:id/progress - Update anime progress
export const updateProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const animeId = parseInt(req.params.id);
    const data = progressSchema.parse(req.body);

    const progress = await prisma.userAnimeProgress.upsert({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
      update: {
        status: data.status,
        episode: data.episode,
        rating: data.rating,
      },
      create: {
        userId,
        animeId,
        status: data.status,
        episode: data.episode || 0,
        rating: data.rating,
      },
      include: { anime: true },
    });

    res.json({
      id: progress.anime.id,
      anilistId: progress.anime.anilistId,
      title: progress.anime.title,
      status: progress.status,
      episode: progress.episode,
      rating: progress.rating,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};

// POST /api/anime/:id/rate - Rate an anime
export const rateAnime = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const animeId = parseInt(req.params.id);
    const { rating } = req.body;

    if (typeof rating !== 'number' || rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }

    const progress = await prisma.userAnimeProgress.upsert({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
      update: { rating },
      create: {
        userId,
        animeId,
        status: 'PLAN_TO_WATCH',
        rating,
      },
      include: { anime: true },
    });

    res.json({
      id: progress.anime.id,
      title: progress.anime.title,
      rating: progress.rating,
    });
  } catch (error) {
    console.error('Rate anime error:', error);
    res.status(500).json({ error: 'Failed to rate anime' });
  }
};
