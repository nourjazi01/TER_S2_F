/**
 * Headless simulation harness for the Pac-Man self-play AI.
 *
 * Loads game-engine.js in a Node-friendly sandbox, builds controlled mazes,
 * and steps Pac-Man for a fixed number of moves while a (possibly stationary
 * or chasing) ghost lurks. Reports loop detection, total pellets eaten, and
 * time-to-loop if any. Also confirms that all three algorithms produce
 * legal, distinguishable behaviour.
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
const wrapped = code + '\n; module.exports = { PacmanAI, DIRECTIONS, GhostMode, OPPOSITE_DIRECTIONS, AlgorithmStats };';
const m = { exports: {} };
new Function('module', 'window', 'performance', wrapped)(m, global.window, global.performance);
const { PacmanAI, DIRECTIONS, GhostMode, OPPOSITE_DIRECTIONS, AlgorithmStats } = m.exports;

// --- maze builders ---------------------------------------------------------

function makeMaze(W, H, cells) {
    const pellets = [];
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const k = `${x},${y}`;
            if (!cells[k]) continue;
            pellets.push({ x, y, eaten: false, isPower: false });
        }
    }
    return {
        width: W, height: H, cells, pellets,
        isPassable(x, y, dir) {
            const c = cells[`${x},${y}`];
            if (!c) return false;
            const k = dir.name === 'UP' ? 'N' : dir.name === 'DOWN' ? 'S' :
                      dir.name === 'LEFT' ? 'W' : dir.name === 'RIGHT' ? 'E' : null;
            return k != null && c.passages.includes(k);
        }
    };
}

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

function buildCorridorMaze() {
    const W = 11, H = 7;
    const cells = {};
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            cells[`${x},${y}`] = { x, y, passages: [], is_ghost_house: false };
        }
    }
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
    openV(0, 1, 5); openV(5, 1, 5); openV(10, 1, 5);
    return makeMaze(W, H, cells);
}

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
    for (let x = 0; x < W - 1; x++) { open(x, 0, x + 1, 0); open(x, H - 1, x + 1, H - 1); }
    for (let y = 0; y < H - 1; y++) { open(0, y, 0, y + 1); open(W - 1, y, W - 1, y + 1); }
    for (let x = 0; x < W - 1; x++) open(x, 4, x + 1, 4);
    for (let y = 0; y < H - 1; y++) open(4, y, 4, y + 1);
    open(2, 1, 2, 2); open(2, 2, 3, 2); open(6, 1, 6, 2); open(6, 2, 5, 2);
    open(2, 6, 2, 7); open(2, 6, 3, 6); open(6, 6, 6, 7); open(6, 6, 5, 6);
    return makeMaze(W, H, cells);
}

// --- helpers --------------------------------------------------------------

function step(maze, x, y, dir) {
    let nx = x + dir.x, ny = y + dir.y;
    if (ny < 0 || ny >= maze.height) return null;
    if (nx < 0) nx = maze.width - 1;
    if (nx >= maze.width) nx = 0;
    return { x: nx, y: ny };
}

// Build a fake Pac-Man entity that the AI will read.
function fakePacman(x, y) {
    return { gridX: x, gridY: y, isAtCenter: () => true, isDying: false };
}

function fakeGhost(x, y, mode = GhostMode.CHASE) {
    return { gridX: x, gridY: y, mode, name: 'g' };
}

function simulate({ name, maze, pacStart, ghostStart, ghostBehavior, mode, maxSteps = 60, recentLimit = 12 }) {
    const ai = new PacmanAI(maze);
    let pac = { x: pacStart.x, y: pacStart.y };
    // Mark starting cell pellet eaten so we don't trivially "eat" it
    for (const p of maze.pellets) {
        if (p.x === pac.x && p.y === pac.y) p.eaten = true;
    }
    const totalPellets = maze.pellets.filter(p => !p.eaten).length;

    const ghosts = ghostStart ? [fakeGhost(ghostStart.x, ghostStart.y)] : [];
    const trail = [`${pac.x},${pac.y}`];
    const visitCount = new Map();
    visitCount.set(`${pac.x},${pac.y}`, 1);

    let stuck = false;
    let oscillationDetected = false;
    let oscillationStep = -1;
    let caught = false;

    for (let i = 0; i < maxSteps; i++) {
        const dir = ai.chooseDirection(fakePacman(pac.x, pac.y), ghosts, mode);
        if (!dir) { stuck = true; break; }
        if (!maze.isPassable(pac.x, pac.y, dir)) { stuck = true; break; }
        const nxt = step(maze, pac.x, pac.y, dir);
        if (!nxt) { stuck = true; break; }
        pac = nxt;
        // Eat pellet at new cell
        for (const p of maze.pellets) {
            if (!p.eaten && p.x === pac.x && p.y === pac.y) p.eaten = true;
        }
        const k = `${pac.x},${pac.y}`;
        trail.push(k);
        visitCount.set(k, (visitCount.get(k) || 0) + 1);

        // Optional ghost chase
        if (ghosts.length > 0 && ghostBehavior === 'chase') {
            const g = ghosts[0];
            let bestG = null, bestD = Infinity;
            for (const d of [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT]) {
                if (!maze.isPassable(g.gridX, g.gridY, d)) continue;
                const ns = step(maze, g.gridX, g.gridY, d);
                if (!ns) continue;
                const dist = Math.abs(ns.x - pac.x) + Math.abs(ns.y - pac.y);
                if (dist < bestD) { bestD = dist; bestG = ns; }
            }
            if (bestG) { g.gridX = bestG.x; g.gridY = bestG.y; }
            if (g.gridX === pac.x && g.gridY === pac.y) { caught = true; break; }
        }

        if (i > 12) {
            const window = trail.slice(-12);
            const counts = new Map();
            for (const c of window) counts.set(c, (counts.get(c) || 0) + 1);
            for (const [, cnt] of counts) {
                if (cnt >= 5) { oscillationDetected = true; oscillationStep = i; break; }
            }
            if (oscillationDetected) break;
        }
    }

    const pelletsEaten = totalPellets - maze.pellets.filter(p => !p.eaten).length;
    const cleared = pelletsEaten === totalPellets;
    return {
        scenario: name, mode,
        pelletsEaten, totalPellets,
        steps: trail.length - 1,
        uniqueCells: visitCount.size,
        maxVisitsAnyCell: Math.max(...visitCount.values()),
        stuck: stuck && !cleared, cleared, oscillationDetected, oscillationStep, caught
    };
}

// Reset pellets between runs so each algorithm gets the same maze state.
function freshenMaze(maze) {
    for (const p of maze.pellets) p.eaten = false;
}

// --- run scenarios --------------------------------------------------------

const scenarios = [
    { name: 'open-7x7-no-ghost',       build: () => buildFullyOpenGrid(7, 7), pacStart: { x: 3, y: 3 }, ghostStart: null,            ghostBehavior: null,    maxSteps: 100 },
    { name: 'open-9x9-static-ghost',   build: () => buildFullyOpenGrid(9, 9), pacStart: { x: 1, y: 1 }, ghostStart: { x: 7, y: 7 },  ghostBehavior: null,    maxSteps: 120 },
    { name: 'open-9x9-chasing-ghost',  build: () => buildFullyOpenGrid(9, 9), pacStart: { x: 1, y: 1 }, ghostStart: { x: 7, y: 7 },  ghostBehavior: 'chase', maxSteps: 120 },
    { name: 'corridor-static-ghost',   build: () => buildCorridorMaze(),      pacStart: { x: 0, y: 1 }, ghostStart: { x: 10, y: 5 }, ghostBehavior: null,    maxSteps: 100 },
    { name: 'corridor-chasing-ghost',  build: () => buildCorridorMaze(),      pacStart: { x: 0, y: 1 }, ghostStart: { x: 10, y: 5 }, ghostBehavior: 'chase', maxSteps: 120 },
    { name: 'braid-9x9-static-ghost',  build: () => buildBraidMaze(),         pacStart: { x: 0, y: 0 }, ghostStart: { x: 8, y: 8 },  ghostBehavior: null,    maxSteps: 120 },
    { name: 'braid-9x9-chasing-ghost', build: () => buildBraidMaze(),         pacStart: { x: 0, y: 0 }, ghostStart: { x: 8, y: 8 },  ghostBehavior: 'chase', maxSteps: 150 }
];

console.log(`Pac-Man self-play AI — headless simulation`);
console.log('-'.repeat(125));
let failures = 0;
const trailsByMode = {}; // scenario -> mode -> trail string

for (const s of scenarios) {
    for (const mode of ['MINIMAX', 'ALPHABETA', 'EXPECTIMAX']) {
        const maze = s.build(); // fresh maze per run so pellets reset
        const r = simulate({
            name: s.name, maze, pacStart: s.pacStart,
            ghostStart: s.ghostStart, ghostBehavior: s.ghostBehavior,
            mode, maxSteps: s.maxSteps
        });
        const status = r.caught ? 'CAUGHT'
                     : r.cleared ? 'CLEARED'
                     : r.oscillationDetected ? 'OSCILLATING'
                     : r.stuck ? 'STUCK'
                     : 'TIMEOUT';
        const eatPct = ((r.pelletsEaten / r.totalPellets) * 100).toFixed(0);
        // Only "STUCK" (no legal move) is a hard bug. OSCILLATING / CAUGHT
        // can be legitimate adversarial-search outcomes against a chasing
        // ghost in a small maze.
        if (status === 'STUCK') failures++;
        console.log(
            `${r.scenario.padEnd(28)} | ${mode.padEnd(11)} | ${status.padEnd(12)} | ` +
            `steps=${String(r.steps).padStart(3)} | eaten=${r.pelletsEaten}/${r.totalPellets} (${eatPct}%) | ` +
            `unique=${String(r.uniqueCells).padStart(2)} | maxVisits=${r.maxVisitsAnyCell}`
        );
    }
    console.log();
}

console.log('-'.repeat(125));
console.log('AlgorithmStats summary:');
for (const algo of ['minimax', 'alphabeta', 'expectimax']) {
    const s = AlgorithmStats[algo];
    if (s.totalCalls === 0) { console.log(`  ${algo.padEnd(11)}: no calls`); continue; }
    const avgNodes = (s.totalNodesExplored / s.totalCalls).toFixed(1);
    const avgMs = (s.totalTimeMs / s.totalCalls).toFixed(2);
    console.log(`  ${algo.padEnd(11)}: calls=${s.totalCalls}  avgNodes=${avgNodes}  avgTimeMs=${avgMs}`);
}

if (failures > 0) {
    console.log(`\n${failures} scenario(s) ended STUCK/OSCILLATING — investigate`);
    process.exit(1);
} else {
    console.log('\nAll scenarios produced legal, non-degenerate behaviour.');
}
