# ChalkMind 🧠✏️

**AI-Powered Visual Teaching Platform** — An intelligent tutoring system that generates interactive, animated whiteboard lessons using GPT-4o structured outputs.

> Built by Siddharth as a full-stack portfolio project demonstrating AI integration, real-time canvas rendering, and production-grade architecture.

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Docker Compose                         │
│                                                            │
│  ┌─────────────────┐        ┌─────────────────────────┐   │
│  │   Nginx (SPA)   │        │    Express API Server    │   │
│  │   React + Vite  │◄──────►│  ┌──────────────────┐    │   │
│  │   Canvas Engine  │  REST  │  │  Teaching Agent   │    │   │
│  │   Rough.js/D3   │        │  │  (GPT-4o + Zod)   │    │   │
│  │   KaTeX         │        │  └──────────────────┘    │   │
│  └────────┬────────┘        │  ┌──────────────────┐    │   │
│           │                  │  │  SQLite + JWT     │    │   │
│           │                  │  │  Auth Middleware   │    │   │
│           │                  │  └──────────────────┘    │   │
│           │                  └───────────┬─────────────┘   │
│           │                              │                  │
│      Port 5173                      Port 3001               │
└────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite 8 | Component framework + build tool |
| **Canvas Engine** | HTML5 Canvas, Rough.js, D3.js, KaTeX | Visual rendering pipeline |
| **State** | React Context + useReducer | Centralized state management |
| **Backend** | Node.js, Express 4 | REST API server |
| **AI** | OpenAI GPT-4o (structured outputs) | Lesson generation with Zod schema |
| **Database** | SQLite (better-sqlite3) | Persistent lesson & user storage |
| **Auth** | JWT (jsonwebtoken + bcryptjs) | Token-based session management |
| **Security** | Helmet, CORS, Rate Limiting | HTTP hardening |
| **Caching** | In-memory LRU cache | Duplicate prompt optimization |
| **Logging** | Structured JSON logging | Request tracing & monitoring |
| **Container** | Docker + Docker Compose | Reproducible deployment |
| **CI/CD** | GitHub Actions | Automated build & test |

## System Design Principles

- **Service Layer Pattern**: Routes → Agent → Schema separation allows swapping the AI provider without touching routes
- **Mediator Pattern**: RenderEngine orchestrates 6 specialized renderers (Text, Diagram, Math, Graph, Network, Annotation) without coupling
- **Event-Driven Architecture**: Timeline emits lifecycle events (onSegmentStart, onCheckpoint, onComplete) for loose UI coupling
- **Bloom's Taxonomy Integration**: Adaptive difficulty levels (Remember → Create) driven by checkpoint performance

## Quick Start

### Prerequisites
- Docker Desktop
- OpenAI API key

### Run
```bash
# 1. Set your API key
echo "OPENAI_API_KEY=sk-your-key-here" > server/.env

# 2. Build and run
docker-compose up --build

# 3. Open
# Frontend: http://localhost:5173
# API:      http://localhost:3001/api/health
```

### Development (without Docker)
```bash
# Terminal 1: Server
cd server
npm install
npm run dev

# Terminal 2: Client
cd client
npm install
npm run dev
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components (Canvas, Chat, Controls, Checkpoint)
│   │   ├── context/        # React Context state management
│   │   ├── engine/         # Canvas rendering pipeline
│   │   │   ├── renderers/  # Text, Diagram, Math, Graph, Network, Annotation
│   │   │   ├── layout/     # Auto-positioning engine
│   │   │   └── animations/ # Timeline, easing, path animations
│   │   ├── services/       # API client with JWT auth
│   │   └── styles/         # Design system (CSS custom properties)
│   ├── Dockerfile          # Multi-stage build (Node → Nginx)
│   └── nginx.conf          # SPA routing + caching
│
├── server/                 # Express API
│   ├── src/
│   │   ├── agent/          # TeachingAgent + PromptBuilder
│   │   ├── schemas/        # Zod schema for structured outputs
│   │   ├── routes/         # REST endpoints (lesson, auth)
│   │   ├── middleware/     # Auth, Logger, Cache
│   │   └── db/             # SQLite database layer
│   └── Dockerfile          # Node 20 Alpine
│
├── docker-compose.yml      # Service orchestration
└── .github/workflows/      # CI/CD pipeline
```

## License

MIT
