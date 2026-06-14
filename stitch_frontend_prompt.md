# Stitch Frontend Prompt: Student Productivity Agent

> **Instructions for the User:** Copy and paste the text below exactly as it is into Claude Opus 4.8 (or any other advanced AI code generator) to instantly actualize your vision. 

---

**PROMPT START**

You are an expert React and UI/UX frontend developer. I need you to build the complete frontend for my AI-powered learning platform, "Stitch" (Student Productivity Agent). The backend is already built in Express/Node.js, and this frontend will purely focus on the visual presentation, interactivity, and hooking up to my existing API endpoints.

## 1. Aesthetic & Vibe (Crucial)
- **Theme:** A stylized 3D animation look (inspired by "Spider-Man: Into the Spider-Verse") mixed with a gritty, moody NYC underground subway aesthetic. 
- **Lighting/Colors:** Moody, dark-mode base with warm incandescent accents, glowing neon highlights, and graffiti accents. Use high-quality, curated color palettes that feel cinematic, not generic. 
- **Goal:** Make a staggering first impression. The UI should feel like a premium, highly-interactive, gamified experience.

## 2. The Interactive Hero Section
- Use the provided assets (a protagonist sitting inside a subway station or train car with headphones) as the background. 
- **Micro-animation/Parallax:** As the user scrolls down the landing page, implement a smooth, cinematic 3D zoom effect. The camera should dive past the subway background and zoom directly into the protagonist's laptop or tablet screen. Once inside the screen, the view seamlessly transitions into the actual App Workspace.

## 3. The Dashboard Workspace
Once inside the app, the layout must be intuitive and highly interactive:
- **Global Navigation:** Implement a bottom-aligned **Magnetic Dock** (macOS style, using Framer Motion) for navigating between "Home", "Collections", "Teaching Agent", and "Settings".
- **Left Sidebar (Collapsible):** 
  - A sleek, dark, glassmorphic panel.
  - Displays the user's "Collections", nested "Topics", and "Nodes".
- **Main Stage (Right Panel - Teaching Agent):**
  - An infinite 2D whiteboard or a clean chat interface where the AI's visual explanations and quizzes will render.
  - **Bottom Center:** A floating, sleek prompt input box (similar to Claude's input bar) with a microphone button for voice dictation.

## 4. UI Libraries & Specific Components
I want you to integrate the following complex components seamlessly into the app (assume you have access to `framer-motion`, `clsx`, `tailwind-merge`):
- **Collection Surfer:** A 3D scroll-driven collection viewer where items (Topics/Study Materials) surf along a perspective track. Use this to create an immersive browsing experience for user Collections. 
- **Magnetic Dock:** A cursor-following magnification dock with tooltips and active state indicators for the primary navigation.
- **Thinking State:** While waiting for the AI response (Teaching Agent API), display an animated, glowing indicator or particle effect to show it is processing or dynamically scaffolding a lesson.

## 5. API Integrations (Backend Hookups)
The frontend must be able to hit my existing Node.js backend seamlessly. Wire up your UI components to fetch/post to these endpoints:
- `POST /api/projects` & `GET /api/projects` - Manage Collections/Projects.
- `POST /api/agent/lesson` - Submit a prompt or uploaded document context to the Teaching Agent. Expects a structured JSON response containing the lesson or quiz (Bloom's Taxonomy-aware).
- `POST /api/agent/checkpoint` - Submit a student's answer to a quiz to advance the lesson or re-explain the concept based on their performance.
- `POST /api/audio/transcribe` - Upload microphone `Blob` via `MediaRecorder` API to get transcribed text.

Do not use simple generic templates. Exercise maximum creative freedom to make this look premium, state-of-the-art, and innovative, while strictly adhering to the API requirements and the stylized NYC subway/Spider-Verse aesthetic. 

**PROMPT END**
