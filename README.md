# Revibe AI

Revibe AI is an eco-tech web app that helps users turn e-waste into practical reuse projects with AI-generated recommendations, nearby resource discovery, community sharing, and GitHub-linked builder identity.

## Problem Statement

E-waste keeps growing, but most people do not know:
1. What can be safely reused
2. How to start practical upcycling projects
3. Where to find nearby repair/recycling support
4. How to showcase their sustainability project work

Revibe AI addresses this with a beginner-friendly product flow: upload -> analyze -> act -> share.

## Key Highlights

1. AI-powered upcycling recommendation pipeline (Groq-backed, JSON-safe fallback)
2. Clean upload-to-results UX with loading/error resilience
3. Nearby resources map (Leaflet + OpenStreetMap) with marker/list interaction
4. Community posting flow backed by lightweight JSON storage
5. GitHub OAuth integration for public developer identity on profile
6. Deployment-ready split architecture (Next.js frontend + Express backend)
7. Centralized client persistence with autosave, resume flow, and reset controls

## Core Features

1. E-waste upload and analysis trigger
2. AI material/risk/sustainability recommendations with actionable steps
3. Nearby resources section with map and curated sample points
4. Community feed with basic create-post capability
5. GitHub OAuth connect and featured repository linking

## Tech Stack

- Frontend: Next.js 16 (App Router), TypeScript, Tailwind CSS
- Backend: Node.js, Express, ESM modules
- AI: Groq SDK
- Maps: Leaflet + OpenStreetMap tiles
- Data storage (MVP): JSON files (no database)
- OAuth: GitHub OAuth app flow (server-side exchange)

## Project Structure

```text
Revibe-lab/
├─ revibe-ai/          # Frontend (Next.js)
├─ backend/            # Backend API (Express)
└─ docs/               # Demo/presentation helper docs
```

## Environment Variables

Frontend (`revibe-ai/.env.local`):

- `NEXT_PUBLIC_API_BASE_URL` -> backend public base URL

Backend (`backend/.env`):

- `NODE_ENV`
- `HOST`
- `PORT`
- `CORS_ORIGINS`
- `FRONTEND_BASE_URL`
- `GROQ_API_KEY`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REDIRECT_URI`
- `GITHUB_API_BASE_URL`
- `GITHUB_REPOS_LIMIT`

Important:
- Never commit secrets.
- Never expose backend secrets to `NEXT_PUBLIC_*` frontend env vars.

## Local Setup

1. Backend:
   - `cd backend`
   - `cp .env.example .env`
   - `npm install`
   - `npm run dev`
2. Frontend:
   - `cd revibe-ai`
   - `cp .env.example .env.local`
   - `npm install`
   - `npm run dev`
3. Open app: `http://localhost:3000`

## Demo Walkthrough (Live Presentation Flow)

1. Open home page and explain Revibe AI mission
2. Go to Upload and submit an e-waste image
3. Click Analyze and show AI result fields:
   - material, confidence, risk, sustainability score, ideas, steps
4. Scroll to Nearby Resources map and show marker/list linkage
5. Open Community and create a progress post
6. Open Profile and connect GitHub via OAuth
7. Show connected profile and featured repositories

Detailed presenter script: [docs/demo-script.md](docs/demo-script.md)

## Deployment Overview

1. Deploy backend first (Render/Railway)
2. Configure backend envs, including CORS and OAuth callback URL
3. Deploy frontend (Vercel/Netlify) with `NEXT_PUBLIC_API_BASE_URL`
4. Update backend:
   - `FRONTEND_BASE_URL` to deployed frontend origin
   - `CORS_ORIGINS` to include deployed frontend origin
   - `GITHUB_REDIRECT_URI` to deployed backend callback

See:
- [Frontend deployment notes](revibe-ai/README.md)
- [Backend deployment notes](backend/README.md)

## Current Constraints / MVP Scope

1. No database (JSON-based storage only)
2. No long-term auth/session management
3. No private GitHub repository access
4. Nearby resources use curated sample points (not live geolocation search)
5. Image generation is intentionally paused
6. User persistence is currently browser-local (localStorage abstraction), not account-linked cloud storage

## Persistence Architecture (Frontend)

Revibe now uses a storage abstraction that can be swapped to backend/database storage later without rewriting UI components.

1. Central app state provider: `revibe-ai/src/lib/appState.tsx`
2. Storage abstraction: `revibe-ai/src/lib/userDataStore.ts`
3. Low-level storage helpers: `revibe-ai/src/lib/storage.ts`

Current implementation:

- `getUserData`
- `saveUserData`
- `saveProject`
- `loadProjects`
- `updateProjectProgress`
- `clearUserData`

This currently persists to localStorage, but the same interfaces are ready to map to authenticated API/database operations.

## Future Enhancements

1. Database-backed persistence for posts and user-linked projects
2. Real nearby places integration with geolocation and filtering
3. Full project tracking workflow after analysis
4. Stronger moderation and community interaction features
5. Expanded AI context and richer material-specific recommendations

## Collaboration Notes

If you are reviewing this project for hackathon, portfolio, or hiring context:

1. Start from Demo Walkthrough
2. Validate deployment/env checklist in frontend/backend READMEs
3. Review clean frontend/backend separation in monorepo structure
