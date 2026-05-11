# PAC-MAN Maze Generator

A Pac-Man game built as an academic research project (TER). Generate mazes, play in the browser, and watch AI algorithms compete in real time.

**Live:** https://ter-s2-f.onrender.com

---

## Team

- **Nour Jazi**
- **Nour Montasser**

---

## What it does

- **Maze generation** - braid mazes with no dead ends, guaranteed connectivity, tunable cycle density
- **Pac-Man game** - full canvas game with lives, scoring, power pellets, bonus fruit, and all four ghost personalities (Blinky, Pinky, Inky, Clyde)
- **Ghost AI** - switch between Greedy, BFS, and A* live during gameplay; stats update in real time
- **Pac-Man self-play** - let Pac-Man play itself using Minimax, Alpha-Beta pruning, or Expectimax
- **Recording & replay** - record a path, replay it with ghosts, export as JSON
- **Gallery** - save mazes to MongoDB, browse and rate them

---

## Quick start

```bash
git clone <repo-url>
cd TER_S2_F
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

Then open http://localhost:5000.

---

## Project phases

### Phase 1 - Maze generation
- Braid maze algorithm (no dead ends, multiple cycles)
- Full graph connectivity guaranteed
- Configurable parameters: size, playability, cycle intensity
- REST API to generate and retrieve mazes (JSON)
- Basic test suite and CI/CD setup

### Phase 2 - Web interface & tests
- Flask backend with REST API
- HTML5 Canvas frontend
- MongoDB integration for saving mazes (gallery)
- 51 automated tests (functional, API, maze quality, E2E)
- GitHub Actions pipeline → auto-deploy to Render

### Phase 3 - Pac-Man game & ghost AI
- Full Pac-Man game engine (lives, score, power pellets, frightened mode)
- Four ghost personalities: Blinky (direct chase), Pinky (ambush), Inky (flanking), Clyde (chase/flee)
- Three ghost pathfinding algorithms switchable live during gameplay:
  - **Greedy** - picks the direction that minimizes distance, O(1)
  - **BFS** - guarantees shortest path, O(V+E)
  - **A\*** - BFS + Manhattan heuristic, faster and still optimal
- Real-time stats per algorithm (calls, nodes explored, avg path length, avg time)
- Trajectory recording and replay system

### Phase 4 - Pac-Man self-play AI & polish
- **Adversarial search for Pac-Man** (not ghosts): Minimax, Alpha-Beta pruning, Expectimax
  - Ghost layer = MIN node (CHANCE node for Expectimax)
  - Pellets simulated with make/unmake so the search tree reflects actual board state
  - Recent-cell FIFO prevents oscillation loops; reversal penalty for stability
  - Alpha-Beta verified identical to Minimax results with ~66% node reduction
- **Third pellet type** - bonus fruit with deterministic placement per maze
- **Maze rating system** - users can rate saved mazes 1-5 stars, gallery sortable by rating
- **Caught-step counter** - tracks at which step Pac-Man was caught
- **UI overhaul** - two equal-height control panels side by side (Recording & Playback / AI Configuration), arcade-style glow accents, section headings, responsive layout

---

## Ghost AI algorithms

| Algorithm | How it works | Nodes explored | Avg time |
|-----------|-------------|---------------|----------|
| Greedy | Picks the direction that minimizes distance to target | 4 | ~0.001ms |
| BFS | Explores level by level, guarantees shortest path | 30–50 | ~0.02ms |
| A* | BFS + Manhattan heuristic, optimal and faster | 15–25 | ~0.015ms |

---

## Pac-Man self-play AI

| Mode | Description |
|------|-------------|
| Minimax | Full game tree, Pac-Man maximizes, ghosts minimize |
| Alpha-Beta | Same as Minimax, ~66% faster via pruning |
| Expectimax | Ghosts treated as random agents rather than adversaries |

---

## Tech stack

- **Frontend:** HTML5 Canvas, JavaScript ES6+, CSS3
- **Backend:** Python 3.11, Flask 3.0, Gunicorn
- **Database:** MongoDB (maze gallery)
- **Tests:** Pytest, pytest-flask, pytest-cov
- **CI/CD:** GitHub Actions → Render.com
