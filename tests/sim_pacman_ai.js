/**
 * Headless simulation harness for the Pac-Man self-play AI.
 *
 * Loads game-engine.js, builds a controlled maze, and steps Pac-Man for a
 * fixed number of moves while a (possibly stationary) ghost lurks. Reports
 * loop detection, total pellets eaten, and time-to-loop if any.
 *
 * Run: node tests/sim_pacman_ai.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

global.window = { PACMAN_AI: 'OFF' };
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => 0;
global.cancelAnimationFrame = () => {};
global.document = { addEventListener: () => {} };

const code = fs.readFileSync(path.join(__dirname, '..', 'Src', 'static', 'js', 'game-engine.js'), 'utf8');
const wrapped = code + '\n; module.exports = { Pathfinder, DIRECTIONS, GhostMode, OPPOSITE_DIRECTIONS };';
const m = { exports: {} };
new Function('module', 'window', 'performance', wrapped)(m, global.window, global.performance);
const { Pathfinder, DIRECTIONS, GhostMode, OPPOSITE_DIRECTIONS } = m.exports;

// --- maze builders ---

function buildFullyOpenGrid(W, H) {
    const cells = {};
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const passages = [];
            if (y > 0) passages.push('N');
            if (y < H - 1) passages.push('S');
            if (x > 0) passages.push('W');
            if (x < W - 1) passages.push('E');
            cells[`${x},${y}`] = { x, y, passages, is_ghost_house: false };
        }
    }
    return makeMaze(W, H, cells);
}

// Long corridor with a few branches — closer to a real Pac-Man maze.
function buildCorridorMaze() {
    const W = 11, H = 7;
    const cells = {};
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            cells[`${x},${y}`] = { x, y, passages: [], is_ghost_house: false };
        }
    }
    // Open horizontal corridors at y=1, y=3, y=5 across the whole width
    function openH(y) {
        for (let x = 0; x < W - 1; x++) {
            cells[`${x},${y}`].passages.push('E');
            cells[`${x + 1},${y}`].passages.push('W');
        }
    }
    function openV(x, y0, y1) {
        for (let y = y0; y < y1; y++) {
            cells[`${x},${y}`].passages.push('S');
            cells[`${x},${y + 1}`].passages.push('N');
        }
    }
    openH(1); openH(3); openH(5);
    // Vertical connectors at x=0, 5, 10
    openV(0, 1, 5); openV(5, 1, 5); openV(10, 1, 5);
    return makeMaze(W, H, cells);
}

function makeMaze(W, H, cells) {
    return {
        width: W, height: H, cells,
        isPassable(x, y, dir) {
            const c = cells[`${x},${y}`];
            if (!c) return false;
            const k = dir.name === 'UP' ? 'N' : dir.name === 'DOWN' ? 'S' : dir.name === 'LEFT' ? 'W' : dir.name === 'RIGHT' ? 'E' : null;
            return k != null && c.passages.includes(k);
        }
    };
}

function buildPellets(maze, skip = new Set()) {
    const pellets = [];
    for (let y = 0; y < maze.height; y++) {
        for (let x = 0; x < maze.width; x++) {
            const k = `${x},${y}`;
            if (!maze.cells[k]) continue;
            if (skip.has(k)) continue;
            // Mark a couple as power pellets so the type-coverage works
            const type = (x === 0 && y === 0) ? 'power' : 'regular';
            pellets.push({ x, y, type, eaten: false });
        }
    }
    return pellets;
}

// Step (nx, ny) one cell in dir, with horizontal wrap.
function step(maze, x, y, dir) {
    let nx = x + dir.x, ny = y + dir.y;
    if (ny < 0 || ny >= maze.height) return null;
    if (nx < 0) nx = maze.width - 1;
    if (nx >= maze.width) nx = 0;
    return { x: nx, y: ny };
}

/**
 * Runs the AI in a loop for `maxSteps` steps. Each step:
 *   1. AI picks a direction.
 *   2. We move Pac-Man one cell in that direction (if legal, otherwise stop).
 *   3. Eat any pellet at the new cell.
 *   4. Optionally move the ghost using greedy chase (if `ghostBehavior` set).
 *
 * Detects oscillation as: revisiting the same cell ≥ 4 times in a 12-step window.
 */
function simulate({ name, maze, pacStart, ghostStart, ghostBehavior, mode, maxSteps = 60, recentLimit = 8 }) {
    const pf = new Pathfinder(maze);

    let pac = { x: pacStart.x, y: pacStart.y };
    const pellets = buildPellets(maze, new Set([`${pacStart.x},${pacStart.y}`]));
    const totalPellets = pellets.filter(p => !p.eaten).length;

    const ghosts = ghostStart ? [{
        gridX: ghostStart.x, gridY: ghostStart.y,
        direction: DIRECTIONS.LEFT, mode: GhostMode.CHASE
    }] : [];

    const recentCells = [];
    let lastDir = null;
    const trail = [`${pac.x},${pac.y}`];
    const visitCount = new Map();
    visitCount.set(`${pac.x},${pac.y}`, 1);

    let stuck = false;
    let oscillationDetected = false;
    let oscillationStep = -1;

    for (let i = 0; i < maxSteps; i++) {
        const r = pf.findDirectionForPacmanAI(
            pac.x, pac.y, ghosts, pellets, mode, 3,
            {
                recentCells: new Set(recentCells),
                currentDirection: lastDir
            }
        );
        const dir = r.direction;
        if (!dir) { stuck = true; break; }

        const nxt = step(maze, pac.x, pac.y, dir);
        if (!nxt) { stuck = true; break; }
        // Verify the move is legal (passage exists in current cell)
        if (!maze.isPassable(pac.x, pac.y, dir)) { stuck = true; break; }
        pac = nxt;
        lastDir = dir;

        // Eat any pellet at the new cell
        for (const p of pellets) {
            if (!p.eaten && p.x === pac.x && p.y === pac.y) p.eaten = true;
        }

        // Recent cells FIFO
        const k = `${pac.x},${pac.y}`;
        recentCells.push(k);
        if (recentCells.length > recentLimit) recentCells.shift();

        // Visit tracking
        visitCount.set(k, (visitCount.get(k) || 0) + 1);
        trail.push(k);

        // Ghost simulation (single, optional)
        if (ghosts.length > 0 && ghostBehavior === 'chase') {
            const g = ghosts[0];
            // Move ghost greedily one step toward Pacman (no reversal)
            const opp = OPPOSITE_DIRECTIONS[g.direction.name];
            let bestG = null, bestD = Infinity;
            for (const d of [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT]) {
                if (d.name === opp) continue;
                if (!maze.isPassable(g.gridX, g.gridY, d)) continue;
                const ns = step(maze, g.gridX, g.gridY, d);
                if (!ns) continue;
                const dist = Math.abs(ns.x - pac.x) + Math.abs(ns.y - pac.y);
                if (dist < bestD) { bestD = dist; bestG = { d, ns }; }
            }
            if (bestG) { g.gridX = bestG.ns.x; g.gridY = bestG.ns.y; g.direction = bestG.d; }
            // Caught?
            if (g.gridX === pac.x && g.gridY === pac.y) {
                return summary({
                    name, mode, pelletsEaten: pellets.filter(p => p.eaten).length,
                    totalPellets, steps: i + 1, stuck, oscillationDetected,
                    oscillationStep, caught: true, trail, visitCount
                });
            }
        }

        // Oscillation detection: any cell visited ≥ 4 times in last 12 steps?
        if (i > 12) {
            const window = trail.slice(-12);
            const counts = new Map();
            for (const c of window) counts.set(c, (counts.get(c) || 0) + 1);
            for (const [, count] of counts) {
                if (count >= 4) { oscillationDetected = true; oscillationStep = i; break; }
            }
            if (oscillationDetected) break;
        }
    }

    return summary({
        name, mode,
        pelletsEaten: pellets.filter(p => p.eaten).length,
        totalPellets,
        steps: trail.length - 1, stuck, oscillationDetected, oscillationStep,
        caught: false, trail, visitCount
    });
}

function summary(s) {
    const maxVisits = Math.max(...Array.from(s.visitCount.values()));
    const uniqueCells = s.visitCount.size;
    const cleared = s.pelletsEaten === s.totalPellets;
    return {
        scenario: s.name, mode: s.mode,
        pelletsEaten: s.pelletsEaten, totalPellets: s.totalPellets,
        steps: s.steps,
        uniqueCells,
        maxVisitsAnyCell: maxVisits,
        stuck: s.stuck && !cleared,  // "stuck" only when stalled WITHOUT clearing
        cleared,
        oscillationDetected: s.oscillationDetected,
        oscillationStep: s.oscillationStep,
        caught: s.caught
    };
}

// --- run scenarios ---

// Build a Braid-style maze (cells with multiple passages, like the real
// generator). We hand-craft a 7x7 with a central ghost-house-shaped hole
// and several cycles, similar to MazeGenerator output.
function buildBraidMaze() {
    const W = 9, H = 9;
    const cells = {};
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            cells[`${x},${y}`] = { x, y, passages: [], is_ghost_house: false };
        }
    }
    function open(x1, y1, x2, y2) {
        const a = cells[`${x1},${y1}`], b = cells[`${x2},${y2}`];
        if (!a || !b) return;
        if (x2 === x1 + 1) { a.passages.push('E'); b.passages.push('W'); }
        else if (x2 === x1 - 1) { a.passages.push('W'); b.passages.push('E'); }
        else if (y2 === y1 + 1) { a.passages.push('S'); b.passages.push('N'); }
        else if (y2 === y1 - 1) { a.passages.push('N'); b.passages.push('S'); }
    }
    // Outer ring
    for (let x = 0; x < W - 1; x++) { open(x, 0, x + 1, 0); open(x, H - 1, x + 1, H - 1); }
    for (let y = 0; y < H - 1; y++) { open(0, y, 0, y + 1); open(W - 1, y, W - 1, y + 1); }
    // Inner cross corridor with a few branches
    for (let x = 0; x < W - 1; x++) open(x, 4, x + 1, 4);
    for (let y = 0; y < H - 1; y++) open(4, y, 4, y + 1);
    // Random extra cycles
    open(2, 1, 2, 2); open(2, 2, 3, 2); open(6, 1, 6, 2); open(6, 2, 5, 2);
    open(2, 6, 2, 7); open(2, 6, 3, 6); open(6, 6, 6, 7); open(6, 6, 5, 6);
    return makeMaze(W, H, cells);
}

const scenarios = [
    { name: 'open-7x7-no-ghost',         maze: buildFullyOpenGrid(7, 7), pacStart: { x: 3, y: 3 }, ghostStart: null,             ghostBehavior: null,    maxSteps: 100 },
    { name: 'open-9x9-static-ghost',     maze: buildFullyOpenGrid(9, 9), pacStart: { x: 1, y: 1 }, ghostStart: { x: 7, y: 7 },   ghostBehavior: null,    maxSteps: 120 },
    { name: 'open-9x9-chasing-ghost',    maze: buildFullyOpenGrid(9, 9), pacStart: { x: 1, y: 1 }, ghostStart: { x: 7, y: 7 },   ghostBehavior: 'chase', maxSteps: 120 },
    { name: 'corridor-static-ghost',     maze: buildCorridorMaze(),      pacStart: { x: 0, y: 1 }, ghostStart: { x: 10, y: 5 },  ghostBehavior: null,    maxSteps: 100 },
    { name: 'corridor-chasing-ghost',    maze: buildCorridorMaze(),      pacStart: { x: 0, y: 1 }, ghostStart: { x: 10, y: 5 },  ghostBehavior: 'chase', maxSteps: 120 },
    { name: 'braid-9x9-static-ghost',    maze: buildBraidMaze(),         pacStart: { x: 0, y: 0 }, ghostStart: { x: 8, y: 8 },   ghostBehavior: null,    maxSteps: 120 },
    { name: 'braid-9x9-chasing-ghost',   maze: buildBraidMaze(),         pacStart: { x: 0, y: 0 }, ghostStart: { x: 8, y: 8 },   ghostBehavior: 'chase', maxSteps: 150 }
];

let totalCalls = 0, totalNodes = 0, totalTime = 0;
console.log(`Scenarios x modes:`);
console.log('-'.repeat(120));
for (const s of scenarios) {
    for (const mode of ['minimax', 'alphabeta', 'expectimax']) {
        const r = simulate({ ...s, mode });
        const status = r.caught ? 'CAUGHT'
                     : r.cleared ? 'CLEARED'
                     : r.oscillationDetected ? 'OSCILLATING'
                     : r.stuck ? 'STUCK'
                     : 'TIMEOUT';
        const eatPct = ((r.pelletsEaten / r.totalPellets) * 100).toFixed(0);
        console.log(
            `${r.scenario.padEnd(28)} | ${mode.padEnd(11)} | ${status.padEnd(12)} | ` +
            `steps=${String(r.steps).padStart(3)} | eaten=${r.pelletsEaten}/${r.totalPellets} (${eatPct}%) | ` +
            `unique=${String(r.uniqueCells).padStart(2)} | maxVisits=${r.maxVisitsAnyCell}`
        );
    }
    console.log();
}
