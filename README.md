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
   Migration tooling has not been configured yet.

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
