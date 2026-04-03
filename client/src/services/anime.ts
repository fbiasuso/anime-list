import { api } from './api';

export type AnimeFormat = 'SERIES' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL';
export type Season = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
export type WatchStatus = 'WATCHING' | 'COMPLETED' | 'DROPPED' | 'PLAN_TO_WATCH';

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

export interface AnimeWithProgress extends Anime {
  status?: WatchStatus;
  userEpisode?: number;
  rating?: number;
}

export interface SeasonResponse {
  animes: AnimeWithProgress[];
}

export interface UserAnimeResponse {
  animes: AnimeWithProgress[];
}

export const animeService = {
  getSeasonAnimes: async (season: Season, year: number) => {
    return api.get<SeasonResponse>(`/anime/season?season=${season}&year=${year}`);
  },

  getUserAnimes: async () => {
    return api.get<UserAnimeResponse>('/anime/user');
  },

  updateProgress: async (
    animeId: number,
    data: { status: WatchStatus; episode?: number; rating?: number }
  ) => {
    return api.put<AnimeWithProgress>(`/anime/${animeId}/progress`, data);
  },

  rateAnime: async (animeId: number, rating: number) => {
    return api.post<{ id: number; title: string; rating: number }>(
      `/anime/${animeId}/rate`,
      { rating }
    );
  },

  removeProgress: async (animeId: number) => {
    return api.delete<{ success: boolean }>(`/anime/${animeId}/progress`);
  },
};
