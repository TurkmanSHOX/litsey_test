# Educational Platform

Full-stack educational platform for teaching Informatics and Physics using innovative technologies.

## Architecture

- Frontend: React with Vite
- Backend: Django REST Framework
- Database: MySQL

## Setup

### Backend

1. Navigate to backend directory
2. Create virtual environment: `python -m venv venv`
3. Activate: `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Set up MySQL database
6. Run migrations: `python manage.py makemigrations && python manage.py migrate`
7. Run server: `python manage.py runserver`

### Frontend

1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

## API Endpoints

- Auth: /api/token/, /api/token/refresh/
- Users: /api/users/
- Courses: /api/courses/
- Lessons: /api/lessons/
- Tests: /api/tests/
- Results: /api/results/
- Analytics: /api/analytics/