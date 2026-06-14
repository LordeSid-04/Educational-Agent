# Emergent.sh Prompt: Interactive 3D Spider-Verse Subway Workspace

**Role:** You are a master WebGL developer and creative technologist specializing in React Three Fiber (R3F), Three.js, and GSAP. 

**Task:** Build an immersive, interactive 3D web experience that serves as the landing page and workspace UI for an AI-powered teaching platform. The aesthetic is "Miles Morales Spider-Verse meets Lofi Girl" — urban, stylized, animated, and dynamic.

## The Vision & UX
Instead of a standard 2D landing page, the user drops into a 3D environment inside a moving NYC subway car. The protagonist (representing the user) is sitting in the subway car with a laptop on their lap. 

**The Scroll Interaction:**
As the user scrolls down, the 3D camera fluidly pans, shifts, and zooms over the protagonist's shoulder, smoothly transitioning to look *directly* at the protagonist's laptop screen. The laptop screen then becomes the actual interactive HTML UI of the teaching workspace.

## 1. Environment & Atmosphere (The Subway Car)
- **3D Modeling Style:** Stylized, cel-shaded, comic-book aesthetic. Use vibrant, contrasting colors (neon pinks, deep purples, electric blues).
- **Motion:** The subway car must feel like it's moving. Implement camera shake (subtle low-frequency oscillation) to simulate the rattling of the train tracks.
- **Lighting:** Implement flickering fluorescent overhead lights. Add dynamic light streaks passing outside the subway windows to simulate movement through a tunnel.
- **Background:** The view out the windows should be a rapidly scrolling, stylized 3D tunnel or blurred neon city lights to emphasize high speed.

## 2. The Protagonist (Character Animation)
- **Character:** A stylized 3D human character sitting on the subway bench with a laptop.
- **Idle Animations:** The character must exhibit lifelike idle animations. They should breathe, blink periodically, slightly shift their legs to the movement of the train, and occasionally type on the keyboard or bob their head to imaginary music.
- **Material:** Use custom shaders (like a Toon/Cel shader) to give the character that iconic comic-book halftone/Spider-Verse texture.

## 3. The Camera & Scroll Mechanics (GSAP + R3F)
- **Initial View:** A wide or medium shot of the subway interior, showing the character, the train movement, and the atmospheric lighting.
- **Scroll-Triggered Animation (GSAP ScrollTrigger):** Tie the Three.js camera position and rotation to the window's scroll position.
- **The Transition:** As the user scrolls, smoothly tween the camera from the initial wide shot, over the character's shoulder, until the camera plane is perfectly parallel with the laptop screen.
- **Depth of Field:** As the camera zooms in, use post-processing (EffectComposer) to blur the subway background, bringing intense focus to the laptop screen.

## 4. The Laptop Screen (HTML/UI Integration)
- **Html component (drei):** Use the `<Html>` helper from `@react-three/drei` perfectly mapped to the laptop mesh's screen coordinates.
- **The Workspace UI:** Once the camera locks onto the screen, the laptop display must contain an interactive React UI. This UI should look like a sleek, hacker-style terminal or an advanced note-taking app. It should feature a glassmorphism design, glowing borders, and neon accents. 
- **Interactivity:** The user must be able to click buttons and type inside the laptop screen while it is rendered inside the 3D world.

## Technical Requirements
- **Framework:** React + React Three Fiber + Vite.
- **Animations:** Use `framer-motion` or `gsap` for camera scrolling and UI transitions. Use `useGLTF` to load the 3D models and `useAnimations` for the character's idle state.
- **Shaders:** Provide custom GLSL shaders for the cel-shading effect and the moving tunnel lights outside the window.
- **Optimization:** Keep polygon counts reasonable. Use instancing for repetitive objects (like subway seats) and bake lighting where dynamic lighting isn't strictly necessary.
- **Assets:** Since you cannot load external proprietary 3D models right now, generate procedural primitives (Boxes, Cylinders) carefully styled with materials to represent the subway, character, and laptop, OR utilize free open-source URLs for `.gltf` models if your platform supports fetching them. 

Please generate the complete, working React codebase that successfully renders this scrolling 3D transition.
