# English Vocabulary Trainer

This project is a full-stack web application that helps users build their English vocabulary. It uses a spaced repetition system based on the SM-2 algorithm so learners can review a configurable number of new words each day.

## Tech Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query (React Query)
- **Backend:** Go (Golang), PostgreSQL, Redis, JWT for authentication
- **Infrastructure:** Docker, Docker Compose
- **CI/CD:** GitHub Actions

## Getting Started

1. **Clone the repository:**
  ```bash
  git clone <repository-url>
  cd english-vocab-trainer
  ```

2. **Set up environment variables:**
  Copy the example environment file and adjust the values for your setup.
  ```bash
  cp .env.example .env
  ```

3. **Build and start the services:**
  This command starts the backend server along with PostgreSQL and Redis.
  ```bash
  docker-compose up --build
  ```

4. **Run database migrations:**
   Install the `golang-migrate` CLI and apply the SQL scripts. Migrations are split into `migrations/schema` (DDL) and `migrations/data` (seed data).
   Because both tracks start at version 1, use separate migration tables.
   ```bash
   go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
   cd backend
   # Apply schema changes first (uses schema_migrations table)
   migrate -path migrations/schema -database "postgres://user:password@localhost:5434/vocab?sslmode=disable&x-migrations-table=schema_migrations" up
   # Then apply seed data (uses data_migrations table)
   migrate -path migrations/data -database "postgres://user:password@localhost:5434/vocab?sslmode=disable&x-migrations-table=data_migrations" up
   cd ..
   ```

   To roll back:
   ```bash
   cd backend
   # Roll back data first, then schema
   migrate -path migrations/data -database "postgres://user:password@localhost:5434/vocab?sslmode=disable&x-migrations-table=data_migrations" down
   migrate -path migrations/schema -database "postgres://user:password@localhost:5434/vocab?sslmode=disable&x-migrations-table=schema_migrations" down
   cd ..
   ```

5. **Run the frontend development server:**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  The application is available at `http://localhost:5173`.

## Testing

Run these commands from the project root to verify the code base:

- **Backend tests:**
  ```bash
  cd backend && go test -v -race ./...
  ```
- **Frontend lint:**
  ```bash
  cd frontend && npm run lint
  ```
- **Frontend type check:**
  ```bash
  cd frontend && npm run typecheck
  ```
- **Frontend tests:**
  ```bash
  cd frontend && npm test
  ```

## Development with Gemini CLI

This project can be developed with the assistance of the Gemini CLI.

Example prompt:
```bash
gemini -p "Add a new page at /history that shows the user's review log. It should fetch data from the /api/v1/history endpoint."
```
This guides Gemini to:
1. Create the `frontend/src/pages/History.tsx` page component.
2. Add the `/history` route in `frontend/src/App.tsx`.
3. Implement the corresponding `GET /api/v1/history` handler in the Go backend.
4. Define the service and database logic to retrieve the history.
