# Gemini Development Guide

This document provides guidance and examples on how to use the Gemini CLI to develop this application.

## Technology Overview

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, shadcn/ui, React Router
- **Backend:** Go (Golang), PostgreSQL, Redis, JWT
- **Infrastructure:** Docker, Docker Compose
- **CI/CD:** GitHub Actions

## Common Commands

Here are some commands you can ask Gemini to execute:

### Frontend

- **Run all frontend tests:**
  ```
  cd frontend && npm test
  ```
- **Lint the frontend codebase:**
  ```
  cd frontend && npm run lint
  ```
- **Check TypeScript types:**
    ```
  cd frontend && npm run typecheck
  ```
- **Run the frontend development server:**
  ```
  cd frontend && npm run dev
  ```

### Backend

- **Run all backend tests:**
  ```
  cd backend && go test -v -race ./...
  ```
- **Lint the backend codebase:**
  ```
  cd backend && go vet ./... && golint -set_exit_status ./...
  ```

### Docker

- **Build and start all services:**
  ```
  docker compose up --build -d
  ```
- **Stop all services:**
  ```
  docker compose down
  ```
- **View service logs:**
  ```
  docker compose logs -f
  ```

## Example Prompts for Gemini

Here are some examples of how you can ask Gemini to assist with development tasks:

- **"Run the frontend tests and show me the results."**
- **"Please lint the entire backend codebase."**
- **"Add a new API endpoint `GET /api/v1/words` to fetch a list of words from the database. Remember to include service and handler logic."**
- **"Create a new React component named `WordCard` in the `frontend/src/components/` directory. It should accept a word and its definition as props."**
- **"Explain the purpose of the `internal/auth/auth.go` file."**
- **"Start all services and check frontend logs."**
