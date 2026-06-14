# ChalkMind — Product Requirements Document

## Original Problem Statement
Build the complete frontend for "ChalkMind", an AI-powered learning platform (Student
Productivity / Teaching Agent). Aesthetic: stylized 3D Spider-Verse look mixed with gritty
NYC underground subway, moody dark-mode with warm incandescent + neon graffiti accents,
inspired by digitalists.at. Cinematic scroll-zoom hero that dives into the protagonist's
laptop and transitions into the app workspace. Magnetic Dock nav, collapsible glassmorphic
sidebar, single-panel brutalist black-&-white Teaching Agent whiteboard, Claude-style prompt
input with mic, 3D Collection Surfer, animated AI thinking state. Wire to existing Express
backend endpoints.

## User Choices
- Backend lives at github.com/LordeSid-04/Educational-Agent (Express/Node). AI handled by their
  backend → **mocked here**. Audio transcription → **mocked**. Auth → **full JWT sign up/login UI**.
- Provided subway + vinyl assets used as inspiration, adapted for a professional look.

## Architecture
- **Frontend**: React 19 + CRACO, Tailwind, framer-motion, lucide-react, sonner. Routes: `/`
  (Landing) and `/app` (Workspace). AuthContext (Bearer token in localStorage + guest id).
- **Backend (FastAPI + MongoDB)**: mirrors the exact Express contract so the app runs end-to-end
  here. `lesson_engine.py` is a deterministic, Bloom's-aware mock matching the production
  structured-lesson segment schema. Swap `REACT_APP_BACKEND_URL` to the real Express server later.
- Auth: JWT (Bearer) + `x-guest-id` header for guest sessions. Seeded demo user.

## Implemented (2026-06-14)
- Cinematic scroll-zoom hero (subway → laptop screen → workspace preview), navbar, vinyl record,
  auth modal (login/register/guest), landing showcase (HowItWorks, Collection Surfer, Agent preview).
- Workspace: Magnetic Dock (Home/Collections/Teaching Agent/Settings), collapsible glassmorphic
  sidebar (Collections > topics/chats), brutalist B&W Whiteboard rendering all segment types
  (heading/text/math/step_marker/diagram/graph/network/table/checkpoint), glowing Thinking State,
  Claude-style prompt input with Bloom depth selector + mic voice dictation, 3D Collection Surfer,
  Home dashboard, Settings/logout.
- API wired: auth register/login/me, projects CRUD, chats, chat message (persisted lessons),
  lesson/continue/clarify, audio transcribe (mocked). Checkpoint answers drive follow-up lessons.
- Tested: 16/16 backend pytest pass; all frontend flows pass (E2E via testing agent). Two minor
  UI overlaps fixed (bloom-pills/checkpoint stacking, topbar title clipping).

## Test Credentials
- Seeded demo: `demo` / `demo123`. Guests need no credentials.

## Backlog
- **P1**: Point `REACT_APP_BACKEND_URL` at the real Express backend and remove FastAPI mock; KaTeX
  rendering for math segments; persist Bloom level per chat in the UI.
- **P2**: Real Whisper transcription via the Express `/api/audio/transcribe`; document-upload context
  for lessons; infinite 2D pan/zoom whiteboard; TTS playback of lessons (`/api/audio/synthesize`).
- **Tech debt**: migrate FastAPI `on_event` → lifespan; explicit CORS origins with credentials.

## Next Tasks
- Connect the production Express backend; validate the live GPT-4o lesson schema renders 1:1 in
  the Whiteboard (it already targets the exact schema).
