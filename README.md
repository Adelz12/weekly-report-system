# Weekly Report System

This repository contains a full-stack Weekly Report System:

- Backend: Flask application in `backend/` (MongoDB, JWT auth)
- Frontend: React app in `frontend/`
- Docker Compose: `docker-compose.yml` to run the stack locally (mongodb, backend, frontend)

Quick start (development):

1. Build and run with Docker Compose:

```bash
docker compose up -d --build
```

2. Backend API: http://localhost:5000
3. Frontend UI: http://localhost:3000

Useful notes:
- Add a `.env` or export environment variables for secrets when running in production.
- Uploaded files are stored in `backend/uploads` (for local/dev only). Consider S3 or object storage for production.

See `scripts/push_to_github.sh` for a helper to create a GitHub repo and push this project (uses `gh` if available).
# Weekly Report System

A full-stack web application for managing weekly reports in a company environment.

## Tech Stack

- **Backend**: Python Flask with MongoDB
- **Frontend**: React with Material-UI
- **Database**: MongoDB
- **Authentication**: JWT
- **Containerization**: Docker
- **Reverse Proxy**: Nginx

## Features

- User registration and authentication
- Create, edit, and submit weekly reports
- View personal report history
- Admin dashboard to view all reports
- Modern, responsive design
- RESTful API
- JWT-based authentication

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/weekly-report-system.git
cd weekly-report-system