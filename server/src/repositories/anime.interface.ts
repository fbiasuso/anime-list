export interface Anime {
  id: number;
  anilistId: number;
  title: string;
  titleEnglish: string | null;
  description: string | null;
  coverImage: string | null;
  format: string;
  season: string;
  seasonYear: number;
  episodes: number | null;
  airingDay: string | null;
}

export interface CreateAnimeDTO {
  anilistId: number;
  title: string;
  titleEnglish?: string;
  description?: string;
  coverImage?: string;
  format: string;
  season: string;
  seasonYear: number;
  episodes?: number;
  airingDay?: string;
}

export interface UpdateProgressDTO {
  status: 'WATCHING' | 'COMPLETED' | 'DROPPED' | 'PLAN_TO_WATCH';
  episode?: number;
  rating?: number;
}

export interface AnimeRepository {
  findByAnilistId(anilistId: number): Promise<Anime | null>;
  findById(id: number): Promise<Anime | null>;
  findAll(): Promise<Anime[]>;
  findBySeason(season: string, year: number): Promise<Anime[]>;
  create(data: CreateAnimeDTO): Promise<Anime>;
  upsert(data: CreateAnimeDTO): Promise<Anime>;
  updateAiringDay(id: number, day: string): Promise<Anime>;
}
