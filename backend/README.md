# Revibe AI Backend

Express API for analysis, posts, and GitHub integration (public profile + OAuth flow).

## Scripts

- `npm run dev` -> watch mode
- `npm run start` -> production server
- `npm run test:groq` -> direct Groq connection smoke test

## Environment Setup

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Core:

- `NODE_ENV=development|production`
- `HOST=0.0.0.0`
- `PORT=4000`
- `CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app`
- `FRONTEND_BASE_URL=http://localhost:3000`

AI:

- `GROQ_API_KEY=<server-only-secret>`

GitHub:

- `GITHUB_CLIENT_ID=<github-oauth-client-id>`
- `GITHUB_CLIENT_SECRET=<server-only-secret>`
- `GITHUB_REDIRECT_URI=http://localhost:4000/api/github/callback`
- `GITHUB_API_BASE_URL=https://api.github.com`
- `GITHUB_REPOS_LIMIT=6`

Security reminder:
- Keep `GROQ_API_KEY` and `GITHUB_CLIENT_SECRET` in backend env only.
- Do not return OAuth access tokens to frontend.

## Local Run

```bash
npm install
npm run dev
```

Default local URL: `http://localhost:4000`

## Production-Like Run

```bash
npm install --omit=dev
npm run start
```

## API Endpoints

- `GET /api/health`
- `POST /api/analyze`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `GET /api/github/auth`
- `GET /api/github/callback`
- `GET /api/github/:username`

## Deploy Notes (Render/Railway)

1. Deploy `backend/` as a Node service.
2. Start command: `npm run start`.
3. Set all env vars listed above.
4. Update these values after frontend deploy:
   - `FRONTEND_BASE_URL=https://<your-frontend-domain>`
   - `CORS_ORIGINS` includes local + deployed frontend origins
   - `GITHUB_REDIRECT_URI=https://<your-backend-domain>/api/github/callback`
5. In GitHub OAuth App settings, set callback URL to the same backend callback URL.
