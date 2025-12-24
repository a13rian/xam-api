# XAM API

Backend API for the XAM platform, built with NestJS following Clean Architecture and CQRS patterns.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) / Node.js
- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: PostgreSQL with PostGIS
- **ORM**: TypeORM
- **Authentication**: JWT with refresh tokens
- **Storage**: MinIO / S3-compatible
- **Validation**: Zod + class-validator

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- PostgreSQL 16+ with PostGIS extension
- Docker (optional, for local development)

### Installation

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env.local

# Start PostgreSQL (if using Docker)
bun run docker:db

# Run database migrations
bun run db:migrate

# Seed database (optional)
bun run seed

# Start development server
bun run dev
```

## Development Commands

```bash
# Development
bun run dev              # Start in watch mode
bun run build            # Build for production
bun run start            # Run production build

# Linting and Formatting
bun run lint             # ESLint with auto-fix
bun run format           # Prettier formatting

# Testing
bun run test             # Unit tests
bun run test:watch       # Unit tests in watch mode
bun run test:e2e         # E2E tests (auto-starts test DB)

# Database
bun run docker:db        # Start PostgreSQL locally
bun run db:migrate       # Run migrations
bun run db:generate      # Generate migration from entity changes
bun run db:revert        # Revert last migration
bun run seed             # Run database seeds
```

## Architecture

The project follows Clean Architecture with CQRS pattern:

```
src/
├── core/                    # Business logic (framework-agnostic)
│   ├── application/         # CQRS commands/queries handlers
│   └── domain/              # Entities, value objects, repositories
├── infrastructure/          # External concerns
│   ├── config/              # Zod-validated configuration
│   ├── auth/                # JWT strategy, token service
│   └── persistence/         # TypeORM entities, migrations, repositories
├── presentation/            # HTTP layer
│   ├── http/                # Controllers and DTOs
│   └── modules/             # NestJS modules
└── shared/                  # Cross-cutting concerns
    ├── decorators/          # @Public, @Roles, @CurrentUser
    ├── guards/              # JwtAuthGuard, RolesGuard
    └── filters/             # Exception filters
```

## Environment Variables

Configuration is validated with Zod at startup. See `.env.example` for all available options.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)

**Optional:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)
- `MINIO_ENDPOINT` - S3-compatible storage endpoint
- See `.env.example` for full list

## API Documentation

Swagger documentation is available at `/api/docs` when `SWAGGER_ENABLED=true`.

## Deployment

The project includes GitHub Actions workflows for automated deployment:

- **deploy.yml** - Build Docker image, push to GHCR, deploy to VPS
- **migrate.yml** - Run database migrations manually

See `.github/workflows/` for configuration details.

## License

Private - All rights reserved.
