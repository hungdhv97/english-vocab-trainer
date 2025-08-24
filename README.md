# English Vocabulary Trainer

This project is a full-stack web application that helps users build their English vocabulary. It uses a spaced repetition system based on the SM-2 algorithm so learners can review a configurable number of new words each day.

## 🚀 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend:** Go 1.24, Gin framework, PostgreSQL, Redis
- **Development:** Hot reload, debugging support

## 🎯 Quick Start

### Manual Setup
```bash
# Clone the repository
git clone <repository-url>
cd english-vocab-trainer

# Copy and configure environment for development
cp config/dev/.env .env
# Edit .env with your DeepL API key and other settings

# Or for production
cp config/prod/.env .env
# Edit .env with your production settings

# Start with Docker Compose for development
docker compose -f docker-compose.dev.yml up -d

# Or start with Docker Compose for production
docker compose -f docker-compose.prod.yml up -d

# Or start manually
# Frontend: cd frontend && npm install && npm run dev
# Backend: cd backend && go run ./cmd/api
```

## 🛠️ Development Environment

### Project Structure

The project is organized into the following directories:

- `frontend/` - React TypeScript frontend application
- `backend/` - Go backend API
- `config/` - Environment configuration files
  - `config/dev/` - Development environment settings
  - `config/prod/` - Production environment settings

### Environment Configuration

**Development Environment (`config/dev/.env`):**
- Debug logging and SQL query logging enabled
- Development-specific database and Redis settings
- DeepL API integration for translations
- Docker Compose: `docker-compose.dev.yml`

**Production Environment (`config/prod/.env`):**
- Optimized for production performance
- Security-focused configuration
- Production database and Redis settings
- Docker Compose: `docker-compose.prod.yml` with Nginx, monitoring (Prometheus, Grafana)

## 🎮 Development Commands

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

### Backend Development
```bash
cd backend

# Install Go dependencies
go mod download

# Start development server
go run ./cmd/api

# Format code
go fmt ./...

# Build for production
go build -o bin/api ./cmd/api
```

## 🐛 Debugging

### Backend Debugging (Go)

**Development Mode:**
- Set `GO_ENV=development` in your environment
- Enable debug logging with `DEBUG=true`
- SQL query logging available when enabled

**Manual Debugging:**
```bash
cd backend
go run ./cmd/api
```

### Frontend Debugging

**React DevTools:**
- React Developer Tools browser extension
- Components and Profiler tabs available

**Vite Hot Reload:**
- Instant updates on file changes
- Error overlay for compile-time issues
- Source maps for debugging

## 🔧 Configuration

### Environment Variables

Copy the appropriate environment file from the config directory:

**For Development:**
```bash
cp config/dev/.env .env
```

**For Production:**
```bash
cp config/prod/.env .env
```

Required environment variables:
- `APP_DEEPL_APIKEY` - Your DeepL API key for translations
- `APP_JWT_SECRET` - JWT secret for authentication
- `APP_POSTGRES_*` - Database connection settings
- `APP_REDIS_*` - Redis connection settings

### Database Setup

The application requires PostgreSQL and Redis to be running. Configure the connection settings in your environment file.

**Database Migration:**
The backend includes database migration files in `backend/migrations/schema/`. Run migrations manually or set up your database schema as needed.

## 🚀 Production Deployment

### Using Docker Compose (Recommended)

1. Copy production configuration: `cp config/prod/.env .env`
2. Update environment variables with production values
3. Start production services: `docker compose -f docker-compose.prod.yml up -d`
4. Set up SSL certificates in `./nginx/ssl/` directory
5. Configure your domain and DNS settings

### Manual Deployment

1. Copy production configuration: `cp config/prod/.env .env`
2. Update environment variables with production values
3. Build the frontend: `cd frontend && npm run build`
4. Build the backend: `cd backend && go build -o bin/api ./cmd/api`
5. Set up your production database and Redis instances
6. Deploy using your preferred method

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test locally
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
