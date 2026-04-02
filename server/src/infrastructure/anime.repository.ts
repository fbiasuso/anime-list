import { PrismaClient, Anime } from '@prisma/client';
import {
  AnimeRepository,
  CreateAnimeDTO,
  Anime as AnimeEntity,
} from '../repositories/anime.interface';

const prisma = new PrismaClient();

const mapToEntity = (anime: Anime): AnimeEntity => ({
  id: anime.id,
  anilistId: anime.anilistId,
  title: anime.title,
  titleEnglish: anime.titleEnglish,
  description: anime.description,
  coverImage: anime.coverImage,
  format: anime.format,
  season: anime.season,
  seasonYear: anime.seasonYear,
  episodes: anime.episodes,
  airingDay: anime.airingDay,
});

export class PrismaAnimeRepository implements AnimeRepository {
  async findByAnilistId(anilistId: number): Promise<AnimeEntity | null> {
    const anime = await prisma.anime.findUnique({ where: { anilistId } });
    if (!anime) return null;
    return mapToEntity(anime);
  }

  async findById(id: number): Promise<AnimeEntity | null> {
    const anime = await prisma.anime.findUnique({ where: { id } });
    if (!anime) return null;
    return mapToEntity(anime);
  }

  async findAll(): Promise<AnimeEntity[]> {
    const animes = await prisma.anime.findMany();
    return animes.map(mapToEntity);
  }

  async findBySeason(season: string, year: number): Promise<AnimeEntity[]> {
    const animes = await prisma.anime.findMany({
      where: { season, seasonYear: year },
    });
    return animes.map(mapToEntity);
  }

  async create(data: CreateAnimeDTO): Promise<AnimeEntity> {
    const anime = await prisma.anime.create({ data });
    return mapToEntity(anime);
  }

  async upsert(data: CreateAnimeDTO): Promise<AnimeEntity> {
    const anime = await prisma.anime.upsert({
      where: { anilistId: data.anilistId },
      update: data,
      create: data,
    });
    return mapToEntity(anime);
  }

  async updateAiringDay(id: number, day: string): Promise<AnimeEntity> {
    const anime = await prisma.anime.update({
      where: { id },
      data: { airingDay: day },
    });
    return mapToEntity(anime);
  }
}
