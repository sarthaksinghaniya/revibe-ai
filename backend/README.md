# Revibe AI Backend (JSON storage)

Minimal Express server for Step 3 (no database, no AI integration yet).

## Run
1. `cp .env.example .env` (optional)
2. `npm install`
3. `npm run dev`

Server defaults to `http://localhost:4000`.

## Endpoints
- `GET /api/health`
- `POST /api/analyze`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `GET /api/github/:username`
