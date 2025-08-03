# Gemini Vocabulary Learning App

This is a full-stack web application designed to help users learn new English words using a spaced repetition system (SRS) based on the SM-2 algorithm. The goal is to learn a configurable number of new words each day.

## Tech Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query (React Query)
- **Backend:** Go (Golang), PostgreSQL, Redis, JWT for authentication
- **Infra:** Docker, Docker Compose
- **CI/CD:** GitHub Actions

## Setup and Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd gemini-vocab-app
    ```

2.  **Set up environment variables:**
    Copy the example environment file and fill in the required values.
    ```bash
    cp .env.example .env
    ```

3.  **Build and run the services:**
    This command will start the backend server, PostgreSQL database, and Redis.
    ```bash
    docker-compose up --build
    ```

4.  **Run database migrations:**
    (Instructions to be added once migration tool is set up)

5.  **Run the frontend development server:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Development with Gemini CLI

This project is set up to be developed with the assistance of the Gemini CLI.

Example prompt:
```
gemini -p "Add a new page at /history that shows the user's review log. It should fetch data from the /api/v1/history endpoint."
```

This will guide Gemini to:
1.  Create the `frontend/src/pages/History.tsx` page component.
2.  Add the `/history` route in `frontend/src/App.tsx`.
3.  Implement the corresponding `GET /api/v1/history` handler in the Go backend.
4.  Define the service and database logic to retrieve the history.
