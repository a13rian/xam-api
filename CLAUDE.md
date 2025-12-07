# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

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
bun run test:e2e:auth    # Run only auth E2E tests
bun run test:e2e:users   # Run only users E2E tests

# Database
bun run docker:db        # Start PostgreSQL locally
bun run db:migrate       # Run migrations
bun run db:generate      # Generate migration from entity changes
bun run db:revert        # Revert last migration
bun run seed             # Run database seeds
```

## Architecture

This is a NestJS application following Clean Architecture with CQRS pattern:

```
src/
├── core/                    # Business logic (framework-agnostic)
│   ├── application/         # CQRS commands/queries handlers
│   │   └── {domain}/
│   │       ├── commands/    # Write operations
│   │       └── queries/     # Read operations
│   └── domain/              # Entities, value objects, repository interfaces
│       └── {domain}/
│           ├── entities/
│           ├── value-objects/
│           ├── events/
│           └── repositories/
├── infrastructure/          # External concerns
│   ├── config/              # Zod-validated config (env.validation.ts)
│   ├── auth/                # JWT strategy, token service
│   └── persistence/
│       └── typeorm/
│           ├── entities/    # ORM entities (*.orm-entity.ts)
│           ├── mappers/     # Domain <-> ORM mappers
│           ├── migrations/
│           └── repositories/
├── presentation/            # HTTP layer
│   ├── http/
│   │   ├── controllers/
│   │   └── dto/
│   └── modules/             # NestJS modules
└── shared/                  # Cross-cutting concerns
    ├── decorators/          # @Public, @Roles, @CurrentUser
    ├── guards/              # JwtAuthGuard, RolesGuard
    ├── filters/             # HttpExceptionFilter
    └── pipes/               # ValidationPipe
```

## Key Patterns

**CQRS**: Each operation has a command/query file and a handler. Commands mutate state, queries read data. Handlers are in `src/core/application/{domain}/commands/` or `queries/`.

**Domain Entities**: Rich domain models with private constructors, `create()` factory methods, and `reconstitute()` for hydration from persistence. Entities extend `AggregateRoot` and emit domain events.

**Repository Pattern**: Interfaces defined in `src/core/domain/{domain}/repositories/`, implementations in `src/infrastructure/persistence/typeorm/repositories/`. Injected via symbols (e.g., `USER_REPOSITORY`).

**Value Objects**: Encapsulate validation logic (e.g., `Email.create()`, `Password.create()`).

**Authentication**: JWT-based with refresh tokens. Routes are protected by default (`JwtAuthGuard`). Use `@Public()` decorator for public endpoints. Role-based access via `@Roles('admin')` decorator.

## Path Aliases

```typescript
@/           -> src/
@core/       -> src/core/
@infrastructure/ -> src/infrastructure/
@presentation/   -> src/presentation/
@shared/         -> src/shared/
```

## Environment Variables

Configuration is validated with Zod at startup (`src/infrastructure/config/env.validation.ts`). Required variables:
- `JWT_SECRET` (min 32 chars)

Environment files: `.env.local` (development), `.env` (fallback), `.env.test` (testing).
