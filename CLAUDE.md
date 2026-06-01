# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clawd — a Claude Code desktop pet featuring the official crab mascot (95×70 pixel art). A Tauri v2 desktop app that renders a transparent, always-on-top window with a PixiJS-powered crab that walks around the screen, responds to clicks/drags, has nurture stats, auto-sleep/sing behaviors, weather detection, and dialogue bubbles.

## Build & Run

```bash
# Development (Vite dev server + Tauri)
cd clawd
npm run dev              # Start Vite dev server only (browser preview)
cargo build -p clawd     # Build Rust backend (from src-tauri/)

# Full build + launch
npx vite build && cd src-tauri && cargo build && start target/debug/clawd.exe
```

- **Node packages**: `npm install` from `clawd/`
- **Rust deps**: Cargo fetches automatically on build
- **TypeScript**: `tsc --noEmit` for type-checking; `tsc && vite build` for full frontend build
- No test suite exists yet

## Architecture

### Dual Implementation State

The codebase has **two parallel implementations** of the same desktop pet:

1. **`src/main.ts`** (~613 lines) — The **working monolithic version**. Contains all game logic inline: pixel rendering, expressions, movement, nurture stats, weather, dialogue bubbles, drag handling, sleep/sing behaviors, and auto-save. This is the version wired up in `index.html` and actually running.

2. **Modular architecture** (`src/actors/`, `src/core/`, `src/systems/`, `src/ui/`, `src/utils/`) — A **refactored/designed but not-yet-integrated** version. `Clawd.ts` composes `SpriteEngine`, `MovementSystem`, `NurtureSystem`, `DialogSystem`, `ContextMenu` together via an `EventBus`. These modules exist alongside the monolithic `main.ts` but are **not imported by it**.

When modifying the pet behavior, `main.ts` is the file that matters today. The modular code represents the target architecture from the design doc.

### Key Architecture Patterns

**Pixel-driven rendering**: The crab isn't sprite sheets — it's a single flat `number[]` array (`crab-pixels.json`, 95×70 = 6650 RGBA uint32 values). Expressions are made by writing pixel masks directly into the array over the eye regions (two 5×6 zones at positions (26,33) and (50,33)). The pixel array → temp canvas `ImageData` → `drawImage()` to main canvas each frame.

**Tauri IPC layer** (`TauriBridge.ts`): Singleton that abstracts Tauri vs browser. Desktop: calls Rust commands `get_screen_info` and `move_window_to`. Browser: returns hardcoded defaults. Uses dynamic `import('@tauri-apps/api/core')` so the same code loads in both environments.

**Nurture stats decay** in `main.ts`: Simplified inline — hunger +1/10min, energy −1/5min, mood −1/15min. Stats checked each frame; decay only applied every 10 minutes (600s gap). The modular `NurtureSystem.ts` has the same logic but cleanly separated.

**Weather** (`main.ts` lines 23-126): ipapi.co for IP→city/lat/lon, then Open-Meteo free API for weather. Cached in localStorage, refreshed every 30 min. WMO weather codes mapped to Chinese descriptions. No API key needed.

**Auto-behaviors** (`main.ts` lines 446-473): Every 120 seconds, if idle, a random check runs: energy < 30 → sleep; 8% chance → sing; 3% chance → sleep anyway.

### Rust Backend (`src-tauri/`)

- `main.rs`: Creates transparent window (227×175 logical pixels), positions centered on primary monitor, tray icon support
- `commands.rs`: Two commands — `get_screen_info` (monitor dimensions + estimated taskbar Y) and `move_window_to` (logical position)
- `Cargo.toml`: Windows-only dependency on `windows` crate for Win32 API; `tauri` with `tray-icon` feature

### Data Flow

```
User input (pointer events) → main.ts handler → modify PX[] array / update state
Game loop (requestAnimationFrame) → tickNurture() → updateBounce() → render(flip)
TauriBridge.moveWindow() → Rust IPC → OS window reposition
localStorage: 'clawd-stats' (save data), 'clawd-weather' (weather cache), 'clawd-settings'
```

### File Map

| File | Role |
|------|------|
| `src/main.ts` | **Active** monolithic entry — all logic, rendering loop, input handling |
| `src/data/crab-pixels.json` | Pre-processed 95×70 pixel array (flattened RGBA) |
| `src/data/dialogs.json` | ~80 dialogue lines across 11 contexts |
| `src/systems/TauriBridge.ts` | IPC singleton (desktop Rust ↔ browser mock) |
| `src/systems/StorageSystem.ts` | localStorage get/set for pet state and settings |
| `src/core/StateMachine.ts` | Animation state machine with priority-based transitions |
| `src/core/BehaviorTree.ts` | Behavior arbiter + needs evaluator (3-layer decision) |
| `src/core/SpriteEngine.ts` | PixiJS sprite setup from pixel data |
| `src/actors/Clawd.ts` | Refactored pet class composing all systems |
| `src/systems/NurtureSystem.ts` | 4-stat nurture with decay, level-up events |
| `src/systems/DialogSystem.ts` | PixiJS dialogue bubble with fade, de-duplication |
| `src/systems/MovementSystem.ts` | Random-walk movement with pause intervals |
| `src/systems/InteractionSystem.ts` | Click/double-click/drag detection on canvas |
| `src/systems/ContextMenu.ts` | HTML overlay right-click menu |
| `src/ui/SettingsPanel.ts` | PixiJS settings panel (API key, scale, toggles) |
| `src/utils/EventBus.ts` | Internal pub/sub event bus for loose coupling |
| `src/utils/Palette.ts` | Official 9-color palette constants extracted from SVG |
| `src-tauri/src/main.rs` | Tauri window setup, transparent, always-on-top |
| `src-tauri/src/commands.rs` | Rust IPC commands for screen info and window move |
| `tools/fix-expr.cjs` | One-off script to update expression mask functions in main.ts |

### Expression System

Eye expressions are 5×6 pixel masks overlaying the fixed eye regions. The mask pattern defines which pixels are foreground (black/heart/gold) vs background (body orange). Each expression function calls `exprMask(color, mask)` which resets eyes to original, then applies the 5×6 binary mask. Available expressions: `normal`, `happy` (∩∩ arcs), `heart` (♥), `angry` (\\//), `sleepy` (-- lines), `star` (★ gold), `dizzy`, `blink`, `dead` (X X), `shock` (wide with white highlights), `music` (♪ filled).
