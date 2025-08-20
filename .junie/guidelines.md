# English Vocabulary Trainer - Development Guidelines

## Project Architecture

This is a full-stack application consisting of:
- **Backend**: Go API using Gin framework with PostgreSQL and Redis
- **Frontend**: React 19 with TypeScript, Vite, and Tailwind CSS
- **Infrastructure**: Docker Compose with Ngrok for external access

## Build/Configuration Instructions

### Prerequisites

1. **Docker & Docker Compose**: Required for the complete development environment
2. **Go 1.24+**: For backend development and testing
3. **Node.js 20+**: For frontend development
4. **DeepL API Key**: Required for translation functionality
5. **Ngrok Account** (optional): For external access/webhooks

### Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Configure required environment variables in `.env`:
   - `APP_DEEPL_APIKEY`: Your DeepL API key (required)
   - `APP_JWT_SECRET`: Generate a secure JWT secret
   - `NGROK_AUTHTOKEN`: Your Ngrok auth token (optional)

### Running with Docker Compose

```bash
# Start all services (recommended for development)
docker-compose up

# Start specific services
docker-compose up postgres redis backend frontend
```

Services will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8180
- PostgreSQL: localhost:5434
- Redis: localhost:6379
- Ngrok Web UI: http://localhost:4040 (if enabled)

### Manual Development Setup

#### Backend Setup
```bash
cd backend

# Install dependencies
go mod download

# Run database migrations
make migrate-up

# Start the backend server
make run
# or
go run ./cmd/api
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Migrations

The project uses golang-migrate for database schema management:

```bash
cd backend

# Apply migrations
make migrate-up

# Rollback migrations
make migrate-down

# Custom database URL
DATABASE_URL="postgres://user:pass@host:port/db?sslmode=disable" make migrate-up
```


## Development Information

### Code Style & Formatting

#### Backend (Go)
- Uses `gofmt` for formatting
- Run `make fmt` to format all Go files
- Follow standard Go conventions and idioms

#### Frontend (React/TypeScript)
- **Prettier configuration** (`.prettierrc`):
  - Semicolons: enabled
  - Quotes: single quotes
  - Trailing commas: always
  - Line width: 80 characters
  - Tab width: 2 spaces

- **ESLint configuration**:
  - TypeScript ESLint recommended rules
  - React Hooks plugin for hook usage rules
  - React Refresh plugin for Vite compatibility

**Formatting commands:**
```bash
cd frontend

# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint
```

### Project Conventions

1. **File Organization**:
   - Backend: Modular structure under `internal/`
   - Frontend: Components in `src/components/`
   - Shared utilities in dedicated utility packages

2. **Component Structure**:
   - Use functional components with hooks
   - TypeScript interfaces for props
   - Radix UI components for accessibility

3. **API Structure**:
   - RESTful endpoints under `/api/v1`
   - JWT authentication for protected routes
   - Structured error responses

4. **Database**:
   - PostgreSQL with pgx driver
   - Migration-based schema management
   - Redis for session storage and caching

### Debugging

1. **Backend debugging**:
   - Uses Zap logger with structured logging
   - Log levels: debug, info, warn, error
   - Database query logging available in development

2. **Frontend debugging**:
   - React DevTools for component inspection
   - Vite HMR for fast development feedback
   - Browser DevTools for network requests

### Key Dependencies

**Backend:**
- `github.com/gin-gonic/gin` - Web framework
- `github.com/jackc/pgx/v5` - PostgreSQL driver
- `github.com/redis/go-redis/v9` - Redis client
- `github.com/cluttrdev/deepl-go` - DeepL translation API
- `go.uber.org/zap` - Structured logging

**Frontend:**
- `react` v19 - UI framework
- `vite` - Build tool and dev server
- `@radix-ui/*` - Accessible UI primitives
- `tailwindcss` - Utility-first CSS
- `vitest` - Testing framework

### Common Development Tasks

1. **Adding new API endpoints**: Implement in `internal/modules/` with proper routing
2. **Database changes**: Create new migration files in `migrations/schema/`
3. **Frontend components**: Use TypeScript interfaces and follow accessibility guidelines
4. **Environment variables**: Add to `.env.example` and document in config files

### Troubleshooting

- **Database connection issues**: Check PostgreSQL service and connection string
- **DeepL API errors**: Verify API key and account limits
- **Frontend build issues**: Clear `node_modules` and reinstall dependencies
- **Docker issues**: Use `docker-compose down -v` to reset volumes

This project emphasizes modern development practices, comprehensive testing, and maintainable code structure.
