# Frontend

This folder contains the React + TypeScript client for the English Vocabulary Trainer.

## Available Scripts

- `npm run dev` – start the development server
- `npm run build` – create a production build
- `npm run lint` – run ESLint on the codebase
- `npm run typecheck` – check TypeScript types

## Environment

The frontend reads `VITE_API_BASE_URL` to know where to send API requests. It defaults to `http://localhost:8180/api/v1`. Create a `.env` file at the project root to override this value if needed.

## Project Structure

- `src/` – application source code
- `public/` – static assets
- `index.html` – entry HTML file
