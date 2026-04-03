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
│       ├── components/         # Componentes UI (shadcn)
│       │   └── ui/            # Button, Card, Dialog, Select, etc.
│       ├── pages/             # Vistas (Lista, Calendario, Perfil)
│       ├── hooks/             # Custom hooks
│       ├── services/          # API calls (api, auth, anime)
│       └── stores/            # Zustand (auth store)
└── server/                     # Express Backend (localhost:3000)
    └── src/
        ├── controllers/       # HTTP handlers
        ├── middleware/         # JWT auth
        ├── routes/             # API routes
        ├── services/           # AniList GraphQL service
        ├── repositories/       # Repository interfaces
        └── infrastructure/     # Prisma implementations
```

## Key Features

1. **Lista de Animes**: Ver animes por temporada/año con filtros y búsqueda
2. **Calendario**: Vista semanal con animes por día de emisión
3. **Tracking**: Marcar estado (Viendo, Completado, Abandonado, Planeado)
4. **Perfil**: Usuario con timezone configurable y estadísticas
5. **Auth**: Registro/login con JWT
6. **Modal de detalles**: Información completa del anime al clickear
7. **Timezone**: Días de emisión según zona horaria del usuario
8. **Ordenamiento**: Alfabético o por fecha de estreno

## UI/UX Features

- **Botones de estado**: Colores según estado (azul=viendo, verde=completado, rojo=abandonado, gris=planeado)
- **Toggle states**: Click en botón activo lo desactiva
- **Optimistic updates**: Respuesta instantánea al cambiar estado
- **Orden alfabético/fecha**: Toggle para cambiar orden de la lista

## API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Crear usuario |
| POST | /api/auth/login | Login, retorna JWT |
| GET | /api/auth/timezones | Listado de timezones disponibles |
| PUT | /api/auth/timezone | Actualizar timezone del usuario |
| GET | /api/anime/season | Obtener animes de temporada (opcional auth) |
| GET | /api/anime/user | Animes del usuario con progreso |
| PUT | /api/anime/:id/progress | Actualizar progreso |
| DELETE | /api/anime/:id/progress | Eliminar progreso |
| POST | /api/anime/:id/rate | Calificar anime |

## Timezones Soportados

| Value | Label | Offset |
|-------|-------|--------|
| America/Argentina/Buenos_Aires | Argentina (ART) | UTC-3 |
| America/New_York | EE.UU. Este (EST) | UTC-5 |
| America/Los_Angeles | EE.UU. Pacífico (PST) | UTC-8 |
| Europe/London | Reino Unido (GMT) | UTC+0 |
| Asia/Tokyo | Japón (JST) | UTC+9 |

## Database Schema (Prisma)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  timezone  String   @default("America/Argentina/Buenos_Aires")
  createdAt DateTime @default(now())
  progress  UserAnimeProgress[]
}

model Anime {
  id           Int      @id @default(autoincrement())
  anilistId    Int      @unique
  title        String
  titleEnglish String?
  description  String?
  coverImage   String?
  format       String   // SERIES, MOVIE, OVA, ONA
  season       String   // WINTER, SPRING, SUMMER, FALL
  seasonYear   Int
  episodes     Int?
  airingDay    String?  // MONDAY, TUESDAY, etc.
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  progress     UserAnimeProgress[]
}

model UserAnimeProgress {
  id        Int       @id @default(autoincrement())
  userId    Int
  animeId   Int
  status    String    // WATCHING, COMPLETED, DROPPED, PLAN_TO_WATCH
  rating    Int?      // 1-10
  episode   Int       @default(0)
  updatedAt DateTime  @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  anime     Anime     @relation(fields: [animeId], references: [id], onDelete: Cascade)

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

## Environment Variables

```env
# Server (.env)
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL="file:./dev.db"
CLIENT_URL=http://localhost:5173
```

## AniList GraphQL

La app consume datos de AniList via GraphQL. El servicio guarda los animes en SQLite localmente para no consultar la API repetidamente.

## Conventions

- **Frontend**: Componentes en `components/`, páginas en `pages/`, hooks custom en `hooks/`
- **Backend**: Estructura controllers/services/repositories
- **DB**: Siempre usar Prisma migrations
- **API**: RESTful con JSON
- **Auth**: JWT en headers `Authorization: Bearer <token>`
- **State**: React Query para server state, Zustand para client state (auth)
- **UI Updates**: Optimistic updates para mejor UX

## Repository Pattern

El proyecto usa Repository Pattern para abstraer la base de datos. Esto permite migrar de SQLite a PostgreSQL sin cambiar la lógica de negocio.

- `repositories/interfaces.ts` - Define las interfaces
- `infrastructure/*.repository.ts` - Implementaciones concretas
