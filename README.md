# AnalyzeMyRun

A fitness and running coach application that provides AI-powered insights and training plans.

## Features

- Import workout data from MapMyFitness API or CSV
- Dashboard with workout analytics and progress tracking
- AI-powered training plan generation using Smolagents
- Goal setting and progress tracking
- Personalized insights and recommendations

## Tech Stack

- Backend: Python/FastAPI
- Frontend: React/TypeScript
- Database: PostgreSQL
- AI: Smolagents
- Containerization: Docker & Docker Compose

## Setup

1. Clone the repository
2. Create a `.env` file in the backend directory with the following variables:
   ```
   DATABASE_URL=postgresql://postgres:postgres@db:5432/analyzemyrun
   SECRET_KEY=your-secret-key
   MAPMYFITNESS_CLIENT_ID=your-client-id
   MAPMYFITNESS_CLIENT_SECRET=your-client-secret
   ```
3. Start the application:
   ```bash
   docker-compose up --build
   ```
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development

- Backend development files are in the `backend/` directory
- Frontend development files are in the `frontend/` directory
- Database migrations are handled with Alembic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 