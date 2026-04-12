# Revibe AI

Revibe AI is split into two deployable apps:

1. `revibe-ai/` -> Next.js frontend (Vercel/Netlify-ready)
2. `backend/` -> Node + Express API (Render/Railway-ready)

## Monorepo Quick Start

1. Frontend:
   - `cd revibe-ai`
   - `npm install`
   - `npm run dev`
2. Backend:
   - `cd backend`
   - `npm install`
   - `npm run dev`

Default local URLs:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Deployment Overview

1. Deploy backend first (Render/Railway).
2. Copy backend public URL (for example `https://revibe-api.onrender.com`).
3. Deploy frontend (Vercel/Netlify) with `NEXT_PUBLIC_API_BASE_URL` set to backend URL.
4. Set backend CORS and OAuth redirect env vars to deployed frontend/backend URLs.

Detailed setup is documented in:
- [Frontend README](c:/Users/LOQ/Desktop/Revibe-lab/revibe-ai/README.md)
- [Backend README](c:/Users/LOQ/Desktop/Revibe-lab/backend/README.md)
