# Neural Motherboard 3D Portfolio — Ahmed Gamal Farouk

An immersive, premium 3D developer portfolio and neural core terminal representing **Ahmed Gamal Farouk's** technical skillsets, certified validation layers, realised architectures, and transmission codes. 

Built using a state-of-the-art modern frontend stack: **React 18**, **TypeScript**, **React Three Fiber (R3F)**, **Three.js**, **Zustand**, and **GSAP**.

---

## ⚡ The Experience Flow

1. **Warp Speed Intro**: A continuous forward-traveling 3D starfield simulation matching the core cyberpunk color palette guides the user to a dark, unbooted motherboard overview.
2. **Booting Central Core**: Clicking on the central CPU initiates a neural power surge, spawning cyanish electric sparks, sliding the heat shield covers open, and initiating energy flow lines.
3. **Electrical Path Routing**: Glowing high-voltage neon pathways route power outwards to 5 independent capability modules.
4. **Interactive Inspecting**: The user can hover over capability modules (floating them up with pointlight highlights) and click to dolly the camera in for close-up inspection.
5. **Hologram Info Panels**: Floating HTML overlay screens project above focused modules using Drei's CSS-3D `<Html>` coordinates, displaying details, credentials, custom terminal code streams, and tilt-responsive repository cards.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: React 18 + TypeScript + Vite (fast compilation & production builds)
- **3D Graphics**: Three.js + React Three Fiber (`@react-three/fiber`)
- **Physics & Camera Rig**: OrbitControls + Camera dolly transitions managed via GSAP timelines
- **Effects**: UnrealBloomPass (`@react-three/postprocessing`) for glowing neon details
- **State Machine**: Zustand (`src/store/useStore.ts`) for clean states: `WELCOME` → `INTRO` → `CORE_INACTIVE` → `CORE_ACTIVE` → `MODULE_FOCUSED`
- **Audio Synthesizer**: Custom Web Audio API Synth (`src/hooks/useAudio.ts`) for high-tech sci-fi chimes, clicks, power surges, and low-frequency ambient hums.

---

## 📂 Project Structure

```
3Dportfolio/
├── src/
│   ├── components/
│   │   ├── three/
│   │   │   ├── CPU.tsx                  # Motherboard substrate & central core reactor
│   │   │   ├── Modules.tsx              # Individual module meshes (rotating rings, ssd pads)
│   │   │   ├── EnergySystem.tsx         # Tube geometries with draw-range clipping & emissive pulsing
│   │   │   ├── Lighting.tsx             # Ambient, directional key, and volumetric spot lights
│   │   │   ├── Particles.tsx            # CPU explosion spark physics loop
│   │   │   ├── CameraRig.tsx            # Camera transitions and OrbitControls bounds
│   │   │   └── MotherboardScene.tsx     # Canvas wrapper & EffectComposer post-processing
│   │   └── ui/
│   │       ├── HUD.tsx                  # Navigation bar & system status logs
│   │       ├── WelcomeOverlay.tsx       # Entrance trigger overlay
│   │       ├── SpiralAnimation.tsx      # Background 3D warp speed starfield
│   │       └── HologramPanel.tsx        # Floating Drei CSS-3D detail cards
│   ├── data/
│   │   └── portfolioData.ts             # Resume records (skills, certs, projects)
│   ├── hooks/
│   │   └── useAudio.ts                  # Web Audio Synth audio player Hook
│   ├── shaders/
│   │   └── energyTrail.ts               # WebGL GLSL shaders
│   ├── store/
│   │   └── useStore.ts                  # Zustand state engine
│   ├── styles/
│   │   └── index.css                    # Grid styles, welcome layout, and scanline overlays
│   ├── types/
│   │   └── index.ts                     # TypeScript definitions
│   └── App.tsx                          # App coordinator
└── vite.config.ts                       # Vite path configuration
```

---

## 🚀 Local Installation

1. **Clone Repository**:
   ```bash
   git clone https://github.com/AhmedGamalFarouk/3Dportfolio.git
   cd 3Dportfolio
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
4. **Compile Production Bundle**:
   ```bash
   npm run build
   ```
