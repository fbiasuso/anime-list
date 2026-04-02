# AGENTS.md - Anime List Project

## Project Overview

Webapp para gestionar y seguir animes de cada temporada. Permite ver lista de animes por temporada, calendario de emisiones semanales, y tracking del progreso de visionado.

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React + Vite + TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| State | TanStack Query + Zustand |
| Backend | Express + JWT + Prisma ORM |
| Database | SQLite (adaptable a PostgreSQL) |
| API Data | AniList GraphQL |

## Architecture

```
anime-list/
├── client/                    # React Frontend (localhost:5173)
│   └── src/
│       ├── components/        # Componentes UI (shadcn)
│       ├── pages/             # Vistas (Lista, Calendario, Perfil)
│       ├── hooks/             # Custom hooks
│       ├── services/          # API calls al backend
│       └── stores/            # Estado Zustand
└── server/                     # Express Backend (localhost:3000)
    └── src/
        ├── controllers/       # Controladores HTTP
        ├── middleware/        # Auth JWT
        ├── routes/            # Rutas API
        ├── services/          # Lógica de negocio
        ├── repositories/      # Repository Pattern (interfaces)
        └── infrastructure/   # Implementaciones DB (Prisma)
```

## Key Features

1. **Lista de Animes**: Ver animes por temporada/año con filtros
2. **Calendario**: Vista semanal con animes por día de emisión
3. **Tracking**: Marcar como "viendo", "abandonado", "completado"
4. **Perfil**: Usuario con progreso y calificaciones
5. **Auth**: Registro/login con JWT (local con SQLite)

## API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Crear usuario |
| POST | /api/auth/login | Login, retorna JWT |
| GET | /api/anime/season | Obtener animes de temporada |
| GET | /api/anime/user | Animes del usuario con progreso |
| PUT | /api/anime/:id/progress | Actualizar progreso |
| POST | /api/anime/:id/rate | Calificar anime |

## Database Schema (Prisma)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  progress  UserAnimeProgress[]
}

model Anime {
  id           Int      @id @default(autoincrement())
  anilistId    Int      @unique
  title        String
  description  String?
  coverImage   String?
  format       String   // SERIES, MOVIE, OVA, ONA
  season       String   // WINTER, SPRING, SUMMER, FALL
  seasonYear   Int
  episodes     Int?
  progress     UserAnimeProgress[]
}

model UserAnimeProgress {
  id        Int       @id @default(autoincrement())
  userId    Int
  animeId   Int
  status    String    // WATCHING, COMPLETED, DROPPED, PLAN_TO_WATCH
  rating    Int?      // 1-10
  episode  Int       @default(0)
  updatedAt DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id])
  anime    Anime     @relation(fields: [animeId], references: [id])

  @@unique([userId, animeId])
}
```

## Development Commands

```bash
# Install all dependencies
npm install

# Run both frontend and backend
npm run dev

# Run only frontend
npm run dev:client

# Run only backend
npm run dev:server

# Generate Prisma client
npm run db:generate

# Push DB schema
npm run db:push
```

## AniList GraphQL Queries

La app consume datos de AniList via GraphQL. Queries principales:
- `Page` con `media(type: ANIME, season, seasonYear)` para obtener lista
- `Media` con detalles individuales

## Environment Variables

```env
# Server (.env)
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL="file:./dev.db"
CLIENT_URL=http://localhost:5173
```

## Conventions

- **Frontend**: Componentes en `components/`, páginas en `pages/`, hooks custom en `hooks/`
- **Backend**: Estructura controllers/services/repositories
- **DB**: Siempre usar Prisma migrations, nunca modificar schema manualmente
- **API**: RESTful con JSON
- **Auth**: JWT en headers `Authorization: Bearer <token>`
