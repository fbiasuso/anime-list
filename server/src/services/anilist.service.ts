export interface AniListAnime {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  format: string;
  episodes: number | null;
  season: string;
  seasonYear: number;
  coverImage: {
    large: string | null;
    medium: string | null;
  };
  description: string | null;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  airingSchedule?: {
    edges?: Array<{
      node: {
        airingAt: number;
        episode: number;
      };
    }>;
  };
}

export interface AniListPageResponse {
  data: {
    Page: {
      media: AniListAnime[];
      pageInfo: {
        hasNextPage: boolean;
        currentPage: number;
      };
    };
  };
}

export class AniListService {
  private readonly endpoint = 'https://graphql.anilist.co';
  private readonly headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  async getSeasonAnimes(season: string, year: number): Promise<AniListAnime[]> {
    const query = `
      query GetSeasonAnimes($season: MediaSeason!, $seasonYear: Int!) {
        Page(perPage: 50) {
          media(
            type: ANIME,
            season: $season,
            seasonYear: $seasonYear,
            sort: POPULARITY_DESC
          ) {
            id
            title {
              romaji
              english
              native
            }
            format
            episodes
            season
            seasonYear
            coverImage {
              large
              medium
            }
            description
            startDate {
              year
              month
              day
            }
          }
        }
      }
    `;

    const variables = { season, seasonYear: year };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`AniList API error: ${response.status}`);
      }

      const result = (await response.json()) as AniListPageResponse;
      return result.data.Page.media;
    } catch (error) {
      console.error('AniList fetch error:', error);
      throw error;
    }
  }
}

export const aniListService = new AniListService();
