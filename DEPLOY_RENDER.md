# Render deployment

## 1. GitHub App

In the screen you sent, keep `All repositories` selected or choose `Only select repositories` and select `TurkmanSHOX/litsey_test`, then click `Save`.

## 2. Backend Web Service

Create a new Render `Web Service` from `TurkmanSHOX/litsey_test`.

- Root Directory: `backend`
- Runtime: `Python`
- Build Command: `./build.sh`
- Start Command: `gunicorn backend.wsgi:application`
- Instance Type: `Free`

Environment variables:

- `DEBUG`: `False`
- `SECRET_KEY`: generate a long random value
- `ALLOWED_HOSTS`: `.onrender.com`
- `CORS_ALLOWED_ORIGINS`: your frontend URL, for example `https://litsey-test-frontend.onrender.com`
- `CSRF_TRUSTED_ORIGINS`: your backend and frontend URLs

Optional database:

- For a quick demo, SQLite will work, but Render free service storage is temporary.
- For better data persistence, create a Render Postgres database and connect it to the backend. Render will set `DATABASE_URL`.

## 3. Frontend Static Site

Create a new Render `Static Site` from the same repository.

- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`

Environment variable:

- `VITE_API_URL`: your backend API URL, for example `https://litsey-test-backend.onrender.com/api`

## 4. After deploy

Open the backend URL once. The first load on a free service can take about a minute.

Default seeded admin:

- Username: `admin`
- Password: `admin123`

After login, change the admin password from the profile page.
