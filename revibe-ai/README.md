# Revibe AI Frontend

Next.js App Router frontend for Revibe AI.

## Scripts

- `npm run dev` -> start local dev server
- `npm run lint` -> run ESLint
- `npm run build` -> production build
- `npm run start` -> run production server after build

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required:

- `NEXT_PUBLIC_API_BASE_URL`
  - Local: `http://localhost:4000`
  - Production: `https://your-backend-service.onrender.com`

Important:
- Only `NEXT_PUBLIC_*` vars are exposed to browser code.
- Never put secrets (Groq key, GitHub client secret) in frontend env.

## Local Run

1. Start backend on `http://localhost:4000`
2. Start frontend:

```bash
npm install
npm run dev
```

3. Open `http://localhost:3000`

## Production-Like Test

```bash
npm run lint
npm run build
npm run start
```

Then verify:
- Home loads
- Upload -> Analyze -> Results works
- Community feed loads/posts
- Map renders
- Profile GitHub OAuth connect flow returns to `/profile`

## Deploy (Vercel or Netlify)

1. Set project root to `revibe-ai/`.
2. Build command: `npm run build`.
3. Start command (if needed): `npm run start`.
4. Add env:
   - `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-domain>`
5. Redeploy after env updates.

## Backend Wiring Checklist

After frontend deploy, ensure backend env is updated:
- `CORS_ORIGINS` includes frontend origin
- `FRONTEND_BASE_URL` equals deployed frontend origin
- GitHub OAuth app callback URL points to backend callback route

## Persistence and Autosave

Frontend persistence is centralized and UI-safe:

- App state cache: `src/lib/appState.tsx`
- Storage abstraction layer: `src/lib/userDataStore.ts`
- Storage utilities: `src/lib/storage.ts`

Implemented local persistence APIs:

- `getUserData`
- `saveUserData`
- `saveProject`
- `loadProjects`
- `updateProjectProgress`
- `clearUserData`

Autosave behavior:

- Debounced autosave for typing and form input changes
- Immediate save for key actions (analysis completion, project selection, progress updates, saved projects)
- Save status support in state (`saving`, `saved`, `all_saved`)

Future-ready note:

The UI does not hardcode localStorage access directly for user journey data. The storage abstraction can be switched to authenticated backend persistence later with minimal UI changes.
