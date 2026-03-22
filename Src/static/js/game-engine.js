/**
 * PAC-MAN Game Engine
 * Complete game implementation with Pac-Man, Ghosts, Pellets, and AI
 */

// ============ GAME CONSTANTS ============
const GAME_CONFIG = {
    CELL_SIZE: 20,
    FPS: 60,
    PACMAN_SPEED: 2,
    GHOST_SPEED: 1.8,
    FRIGHTENED_SPEED: 1.0,
    SCATTER_DURATION: 7000,
    CHASE_DURATION: 20000,
    FRIGHTENED_DURATION: 8000,

    // Scoring
    PELLET_SCORE: 10,
    POWER_PELLET_SCORE: 50,
    GHOST_SCORES: [200, 400, 800, 1600],

    // Colors
    COLORS: {
        wall: '#2121DE',
        passage: '#000000',
        pellet: '#FFCC99',
        powerPellet: '#FFFF00',
        pacman: '#FFFF00',
        ghostRed: '#FF0000',
        ghostPink: '#FFB8FF',
        ghostCyan: '#00FFFF',
        ghostOrange: '#FFB852',
        frightened: '#2121DE',
        frightenedFlash: '#FFFFFF'
    }
};

// Direction vectors
const DIRECTIONS = {
    UP: { x: 0, y: -1, name: 'UP' },
    DOWN: { x: 0, y: 1, name: 'DOWN' },
    LEFT: { x: -1, y: 0, name: 'LEFT' },
    RIGHT: { x: 1, y: 0, name: 'RIGHT' },
    NONE: { x: 0, y: 0, name: 'NONE' }
};

const OPPOSITE_DIRECTIONS = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT'
};

// ============ GAME STATES ============
const GameState = {
    READY: 'READY',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    DYING: 'DYING',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    GAME_OVER: 'GAME_OVER'
};

// Ghost modes
const GhostMode = {
    SCATTER: 'SCATTER',
    CHASE: 'CHASE',
    FRIGHTENED: 'FRIGHTENED',
    EATEN: 'EATEN',
    IN_HOUSE: 'IN_HOUSE'
};

// ============ ENTITY BASE CLASS ============
class Entity {
    constructor(x, y, cellSize) {
        this.x = x;
        this.y = y;
        this.cellSize = cellSize;
        this.direction = DIRECTIONS.NONE;
        this.nextDirection = DIRECTIONS.NONE;
        this.speed = 0;
    }

    get gridX() {
        return Math.round(this.x / this.cellSize);
    }

    get gridY() {
        return Math.round(this.y / this.cellSize);
    }

    get centerX() {
        return this.x + this.cellSize / 2;
    }

    get centerY() {
        return this.y + this.cellSize / 2;
    }

    isAtCenter() {
        const tolerance = this.speed * 1.5;
        const cellCenterX = this.gridX * this.cellSize + this.cellSize / 2;
        const cellCenterY = this.gridY * this.cellSize + this.cellSize / 2;
        const offsetX = Math.abs(this.x + this.cellSize / 2 - cellCenterX);
        const offsetY = Math.abs(this.y + this.cellSize / 2 - cellCenterY);
        return offsetX <= tolerance && offsetY <= tolerance;
    }

    snapToGrid() {
        this.x = this.gridX * this.cellSize;
        this.y = this.gridY * this.cellSize;
    }
}

// ============ PAC-MAN CLASS ============
class PacMan extends Entity {
    constructor(x, y, cellSize) {
        super(x, y, cellSize);
        this.speed = GAME_CONFIG.PACMAN_SPEED;
        this.mouthAngle = 0;
        this.mouthDirection = 1;
        this.animationFrame = 0;
        this.isDying = false;
        this.deathFrame = 0;
    }

    update(maze, deltaTime) {
        if (this.isDying) {
            this.deathFrame += deltaTime * 0.01;
            return;
        }

        // Animate mouth
        this.animationFrame += deltaTime * 0.015;
        this.mouthAngle = Math.abs(Math.sin(this.animationFrame) * 45);

        // Always try to use next direction if valid (more responsive)
        if (this.nextDirection !== DIRECTIONS.NONE) {
            if (this.canMove(this.nextDirection, maze)) {
                this.direction = this.nextDirection;
                this.nextDirection = DIRECTIONS.NONE;
            } else if (this.isAtCenter()) {
                // Only clear next direction if we're at center and can't move that way
                this.nextDirection = DIRECTIONS.NONE;
            }
        }

        // Move in current direction
        if (this.direction !== DIRECTIONS.NONE && this.canMove(this.direction, maze)) {
            this.x += this.direction.x * this.speed;
            this.y += this.direction.y * this.speed;
        } else if (this.direction !== DIRECTIONS.NONE) {
            // Stop at wall
            this.direction = DIRECTIONS.NONE;
        }

        // Handle tunnel wrapping
        this.handleTunnelWrap(maze);
    }

    canMove(direction, maze) {
        const nextX = this.gridX + direction.x;
        const nextY = this.gridY + direction.y;

        // Allow tunnel wrap
        if (nextX < 0 || nextX >= maze.width) {
            return true; // Tunnel
        }

        // Check bounds
        if (nextY < 0 || nextY >= maze.height) {
            return false;
        }

        return maze.isPassable(this.gridX, this.gridY, direction);
    }

    handleTunnelWrap(maze) {
        if (this.x < -this.cellSize) {
            this.x = maze.width * this.cellSize;
        } else if (this.x > maze.width * this.cellSize) {
            this.x = -this.cellSize;
        }
    }

    draw(ctx) {
        const cx = this.centerX;
        const cy = this.centerY;
        const radius = this.cellSize / 2 - 2;

        if (this.isDying) {
            // Death animation
            const angle = Math.min(this.deathFrame * 180, 360);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius,
                    (90 + angle / 2) * Math.PI / 180,
                    (90 - angle / 2) * Math.PI / 180);
            ctx.closePath();
            ctx.fillStyle = GAME_CONFIG.COLORS.pacman;
            ctx.fill();
            return;
        }

        // Calculate rotation based on direction
        let rotation = 0;
        if (this.direction === DIRECTIONS.RIGHT) rotation = 0;
        else if (this.direction === DIRECTIONS.DOWN) rotation = 90;
        else if (this.direction === DIRECTIONS.LEFT) rotation = 180;
        else if (this.direction === DIRECTIONS.UP) rotation = 270;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation * Math.PI / 180);

        // Draw Pac-Man with mouth
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius,
                this.mouthAngle * Math.PI / 180,
                (360 - this.mouthAngle) * Math.PI / 180);
        ctx.closePath();
        ctx.fillStyle = GAME_CONFIG.COLORS.pacman;
        ctx.fill();

        ctx.restore();
    }

    setDirection(direction) {
        this.nextDirection = direction;
        // Try to change direction immediately if possible
        if (this.direction === DIRECTIONS.NONE || direction === DIRECTIONS.NONE) {
            this.direction = direction;
        }
    }

    die() {
        this.isDying = true;
        this.deathFrame = 0;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.direction = DIRECTIONS.NONE;
        this.nextDirection = DIRECTIONS.NONE;
        this.isDying = false;
        this.deathFrame = 0;
    }
}

// ============ GHOST CLASS ============
class Ghost extends Entity {
    constructor(x, y, cellSize, name, color, scatterTarget) {
        super(x, y, cellSize);
        this.name = name;
        this.color = color;
        this.scatterTarget = scatterTarget;
        this.speed = GAME_CONFIG.GHOST_SPEED;
        this.mode = GhostMode.IN_HOUSE;
        this.previousMode = GhostMode.SCATTER;
        this.homeX = x;
        this.homeY = y;
        this.frightendTimer = 0;
        this.eyeDirection = DIRECTIONS.LEFT;
        this.animationFrame = 0;
        this.releaseTimer = 0;
    }

    update(maze, pacman, blinky, deltaTime) {
        this.animationFrame += deltaTime * 0.01;

        // Update frightened timer
        if (this.mode === GhostMode.FRIGHTENED) {
            this.frightendTimer -= deltaTime;
            if (this.frightendTimer <= 0) {
                this.mode = this.previousMode;
            }
        }

        // Handle release from ghost house
        if (this.mode === GhostMode.IN_HOUSE) {
            this.releaseTimer -= deltaTime;
            if (this.releaseTimer <= 0) {
                this.mode = GhostMode.SCATTER;
                console.log(`${this.name} released from house`); // Debug
            } else {
                // Move up and down in house
                if (this.direction === DIRECTIONS.NONE) {
                    this.direction = DIRECTIONS.UP;
                }
                this.x += this.direction.x * this.speed;
                this.y += this.direction.y * this.speed;
                return;
            }
        }

        // Move towards target - only if not stuck
        if (this.isAtCenter() || this.direction === DIRECTIONS.NONE) {
            this.snapToGrid();
            const target = this.getTarget(pacman, blinky);
            this.chooseDirection(maze, target);
        }

        // Move
        const currentSpeed = this.mode === GhostMode.FRIGHTENED
            ? GAME_CONFIG.FRIGHTENED_SPEED
            : this.mode === GhostMode.EATEN
                ? GAME_CONFIG.GHOST_SPEED * 2
                : this.speed;

        if (this.direction !== DIRECTIONS.NONE) {
            this.x += this.direction.x * currentSpeed;
            this.y += this.direction.y * currentSpeed;
        }

        // Handle tunnel wrapping
        this.handleTunnelWrap(maze);

        // Check if eaten ghost reached home
        if (this.mode === GhostMode.EATEN) {
            if (Math.abs(this.x - this.homeX) < 5 && Math.abs(this.y - this.homeY) < 5) {
                this.mode = GhostMode.SCATTER;
                this.x = this.homeX;
                this.y = this.homeY;
                console.log(`${this.name} returned home`); // Debug
            }
        }
    }

    handleTunnelWrap(maze) {
        if (this.x < -this.cellSize) {
            this.x = maze.width * this.cellSize;
        } else if (this.x > maze.width * this.cellSize) {
            this.x = -this.cellSize;
        }
    }

    getTarget(pacman, blinky) {
        if (this.mode === GhostMode.SCATTER) {
            return this.scatterTarget;
        }

        if (this.mode === GhostMode.FRIGHTENED) {
            // Random target when frightened
            return {
                x: Math.floor(Math.random() * 20),
                y: Math.floor(Math.random() * 20)
            };
        }

        if (this.mode === GhostMode.EATEN) {
            return { x: this.homeX / this.cellSize, y: this.homeY / this.cellSize };
        }

        // Chase mode - override in subclasses
        return this.getChaseTarget(pacman, blinky);
    }

    getChaseTarget(pacman, blinky) {
        // Default: target Pac-Man directly
        return { x: pacman.gridX, y: pacman.gridY };
    }

    chooseDirection(maze, target) {
        const possibleDirections = [];
        const opposite = OPPOSITE_DIRECTIONS[this.direction.name];

        // Check all directions except opposite (ghosts can't reverse)
        for (const [name, dir] of Object.entries(DIRECTIONS)) {
            if (name === 'NONE' || name === opposite) continue;
            if (maze.isPassable(this.gridX, this.gridY, dir)) {
                possibleDirections.push(dir);
            }
        }

        if (possibleDirections.length === 0) {
            // Dead end - must reverse
            const reverseDir = DIRECTIONS[opposite];
            if (reverseDir && maze.isPassable(this.gridX, this.gridY, reverseDir)) {
                this.direction = reverseDir;
            }
            return;
        }

        if (possibleDirections.length === 1) {
            this.direction = possibleDirections[0];
            this.eyeDirection = this.direction;
            return;
        }

        // Choose direction with shortest distance to target
        let bestDirection = possibleDirections[0];
        let bestDistance = Infinity;

        for (const dir of possibleDirections) {
            const nextX = this.gridX + dir.x;
            const nextY = this.gridY + dir.y;
            const distance = this.calculateDistance(nextX, nextY, target.x, target.y);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestDirection = dir;
            }
        }

        this.direction = bestDirection;
        this.eyeDirection = this.direction;
    }

    calculateDistance(x1, y1, x2, y2) {
        // Euclidean distance
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    draw(ctx) {
        const cx = this.centerX;
        const cy = this.centerY;
        const radius = this.cellSize / 2 - 2;

        let color = this.color;

        if (this.mode === GhostMode.FRIGHTENED) {
            // Flashing when time is running out
            if (this.frightendTimer < 2000 && Math.floor(this.animationFrame * 4) % 2 === 0) {
                color = GAME_CONFIG.COLORS.frightenedFlash;
            } else {
                color = GAME_CONFIG.COLORS.frightened;
            }
        } else if (this.mode === GhostMode.EATEN) {
            // Draw only eyes
            this.drawEyes(ctx, cx, cy, radius);
            return;
        }

        // Draw ghost body
        ctx.fillStyle = color;

        // Top half (rounded)
        ctx.beginPath();
        ctx.arc(cx, cy - 2, radius, Math.PI, 0, false);

        // Body and wavy bottom
        const waveOffset = Math.sin(this.animationFrame * 2) * 2;
        ctx.lineTo(cx + radius, cy + radius - 2);

        // Wavy bottom
        const segments = 4;
        const segmentWidth = (radius * 2) / segments;
        for (let i = segments; i > 0; i--) {
            const xPos = cx + radius - (segments - i + 1) * segmentWidth + segmentWidth / 2;
            const yOffset = (i % 2 === 0 ? -4 : 0) + waveOffset;
            ctx.lineTo(xPos, cy + radius - 2 + yOffset);
        }

        ctx.lineTo(cx - radius, cy - 2);
        ctx.closePath();
        ctx.fill();

        // Draw eyes (unless frightened)
        if (this.mode !== GhostMode.FRIGHTENED) {
            this.drawEyes(ctx, cx, cy, radius);
        } else {
            // Frightened face
            this.drawFrightenedFace(ctx, cx, cy);
        }
    }

    drawEyes(ctx, cx, cy, radius) {
        const eyeRadius = radius * 0.3;
        const pupilRadius = eyeRadius * 0.5;
        const eyeY = cy - 4;

        // Eye offset based on direction
        let pupilOffsetX = 0;
        let pupilOffsetY = 0;
        if (this.eyeDirection === DIRECTIONS.LEFT) pupilOffsetX = -2;
        if (this.eyeDirection === DIRECTIONS.RIGHT) pupilOffsetX = 2;
        if (this.eyeDirection === DIRECTIONS.UP) pupilOffsetY = -2;
        if (this.eyeDirection === DIRECTIONS.DOWN) pupilOffsetY = 2;

        // Left eye
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(cx - 4, eyeY, eyeRadius, eyeRadius * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0000FF';
        ctx.beginPath();
        ctx.arc(cx - 4 + pupilOffsetX, eyeY + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        // Right eye
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(cx + 4, eyeY, eyeRadius, eyeRadius * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0000FF';
        ctx.beginPath();
        ctx.arc(cx + 4 + pupilOffsetX, eyeY + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFrightenedFace(ctx, cx, cy) {
        // White eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 3, 2, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 3, 2, 0, Math.PI * 2);
        ctx.fill();

        // Wavy mouth
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy + 4);
        for (let i = 0; i <= 4; i++) {
            ctx.lineTo(cx - 6 + i * 3, cy + 4 + (i % 2 === 0 ? 0 : 3));
        }
        ctx.stroke();
    }

    setFrightened() {
        if (this.mode !== GhostMode.EATEN) {
            this.previousMode = this.mode;
            this.mode = GhostMode.FRIGHTENED;
            this.frightendTimer = GAME_CONFIG.FRIGHTENED_DURATION;
            // Reverse direction
            const opposite = OPPOSITE_DIRECTIONS[this.direction.name];
            if (opposite) {
                this.direction = DIRECTIONS[opposite];
            }
        }
    }

    setEaten() {
        this.mode = GhostMode.EATEN;
    }

    reset() {
        this.x = this.homeX;
        this.y = this.homeY;
        this.direction = DIRECTIONS.NONE;
        this.mode = GhostMode.IN_HOUSE;
        this.frightendTimer = 0;
    }
}

// ============ SPECIFIC GHOST CLASSES ============

// Blinky (Red) - Directly chases Pac-Man
class Blinky extends Ghost {
    constructor(x, y, cellSize) {
        super(x, y, cellSize, 'Blinky', GAME_CONFIG.COLORS.ghostRed, { x: 25, y: -2 });
        this.releaseTimer = 0; // Immediately released
        this.mode = GhostMode.SCATTER;
        this.direction = DIRECTIONS.UP; // Start moving
    }

    getChaseTarget(pacman) {
        // Direct pursuit using BFS-style targeting
        return { x: pacman.gridX, y: pacman.gridY };
    }
}

// Pinky (Pink) - Ambushes 4 cells ahead of Pac-Man
class Pinky extends Ghost {
    constructor(x, y, cellSize) {
        super(x, y, cellSize, 'Pinky', GAME_CONFIG.COLORS.ghostPink, { x: 2, y: -2 });
        this.releaseTimer = 2000;
    }

    getChaseTarget(pacman) {
        // Target 4 cells ahead of Pac-Man
        return {
            x: pacman.gridX + pacman.direction.x * 4,
            y: pacman.gridY + pacman.direction.y * 4
        };
    }
}

// Inky (Cyan) - Unpredictable, uses Blinky's position
class Inky extends Ghost {
    constructor(x, y, cellSize) {
        super(x, y, cellSize, 'Inky', GAME_CONFIG.COLORS.ghostCyan, { x: 27, y: 30 });
        this.releaseTimer = 5000;
    }

    getChaseTarget(pacman, blinky) {
        // Vector from Blinky to 2 cells ahead of Pac-Man, doubled
        const aheadX = pacman.gridX + pacman.direction.x * 2;
        const aheadY = pacman.gridY + pacman.direction.y * 2;

        if (!blinky) {
            return { x: aheadX, y: aheadY };
        }

        const vectorX = aheadX - blinky.gridX;
        const vectorY = aheadY - blinky.gridY;

        return {
            x: aheadX + vectorX,
            y: aheadY + vectorY
        };
    }
}

// Clyde (Orange) - Shy, runs away when close
class Clyde extends Ghost {
    constructor(x, y, cellSize) {
        super(x, y, cellSize, 'Clyde', GAME_CONFIG.COLORS.ghostOrange, { x: 0, y: 30 });
        this.releaseTimer = 8000;
    }

    getChaseTarget(pacman) {
        // If more than 8 tiles away, chase. Otherwise, scatter
        const distance = this.calculateDistance(this.gridX, this.gridY, pacman.gridX, pacman.gridY);

        if (distance > 8) {
            return { x: pacman.gridX, y: pacman.gridY };
        } else {
            return this.scatterTarget;
        }
    }
}

// ============ PELLET CLASS ============
class Pellet {
    constructor(x, y, isPower = false) {
        this.x = x;
        this.y = y;
        this.isPower = isPower;
        this.eaten = false;
        this.animationFrame = 0;
    }

    update(deltaTime) {
        if (this.isPower) {
            this.animationFrame += deltaTime * 0.005;
        }
    }

    draw(ctx, cellSize) {
        if (this.eaten) return;

        const cx = this.x * cellSize + cellSize / 2;
        const cy = this.y * cellSize + cellSize / 2;

        if (this.isPower) {
            // Pulsing power pellet
            const pulse = 0.8 + Math.sin(this.animationFrame) * 0.2;
            const radius = 6 * pulse;

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = GAME_CONFIG.COLORS.powerPellet;
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(cx, cy, 2, 0, Math.PI * 2);
            ctx.fillStyle = GAME_CONFIG.COLORS.pellet;
            ctx.fill();
        }
    }
}

// ============ MAZE WRAPPER CLASS ============
class GameMaze {
    constructor(mazeData, cellSize) {
        this.data = mazeData;
        this.cells = mazeData.cells;
        this.width = mazeData.metadata.width;
        this.height = mazeData.metadata.height;
        this.cellSize = cellSize;
        this.pellets = [];
        this.initPellets();
    }

    initPellets() {
        this.pellets = [];
        const powerPelletPositions = this.getPowerPelletPositions();

        for (const [key, cell] of Object.entries(this.cells)) {
            // Skip ghost house cells
            if (cell.is_ghost_house) continue;

            const [x, y] = key.split(',').map(Number);
            const isPower = powerPelletPositions.some(p => p.x === x && p.y === y);

            this.pellets.push(new Pellet(x, y, isPower));
        }
    }

    getPowerPelletPositions() {
        // Place power pellets in corners
        return [
            { x: 1, y: 1 },
            { x: this.width - 2, y: 1 },
            { x: 1, y: this.height - 2 },
            { x: this.width - 2, y: this.height - 2 }
        ];
    }

    isPassable(x, y, direction) {
        const cellKey = `${x},${y}`;
        const cell = this.cells[cellKey];

        if (!cell) return false;

        // Map direction to passage key
        let passageKey;
        if (direction === DIRECTIONS.UP) passageKey = 'N';
        else if (direction === DIRECTIONS.DOWN) passageKey = 'S';
        else if (direction === DIRECTIONS.LEFT) passageKey = 'W';
        else if (direction === DIRECTIONS.RIGHT) passageKey = 'E';
        else return false;

        return cell.passages.includes(passageKey);
    }

    getStartPosition() {
        // Find a good starting position (bottom center)
        return {
            x: Math.floor(this.width / 2),
            y: this.height - 2
        };
    }

    getGhostHouseCenter() {
        // Find ghost house cells
        for (const [key, cell] of Object.entries(this.cells)) {
            if (cell.is_ghost_house) {
                const [x, y] = key.split(',').map(Number);
                return { x, y };
            }
        }
        // Default to center
        return {
            x: Math.floor(this.width / 2),
            y: Math.floor(this.height / 2)
        };
    }

    getRemainingPellets() {
        return this.pellets.filter(p => !p.eaten).length;
    }

    draw(ctx) {
        // Clear canvas
        ctx.fillStyle = GAME_CONFIG.COLORS.passage;
        ctx.fillRect(0, 0, this.width * this.cellSize, this.height * this.cellSize);

        // Draw walls
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cellKey = `${x},${y}`;
                const cell = this.cells[cellKey];

                if (!cell) continue;

                this.drawCellWalls(ctx, cell, x, y);
            }
        }
    }

    drawCellWalls(ctx, cell, x, y) {
        const px = x * this.cellSize;
        const py = y * this.cellSize;

        ctx.strokeStyle = GAME_CONFIG.COLORS.wall;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        if (!cell.passages.includes('N')) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + this.cellSize, py);
            ctx.stroke();
        }

        if (!cell.passages.includes('S')) {
            ctx.beginPath();
            ctx.moveTo(px, py + this.cellSize);
            ctx.lineTo(px + this.cellSize, py + this.cellSize);
            ctx.stroke();
        }

        if (!cell.passages.includes('E')) {
            ctx.beginPath();
            ctx.moveTo(px + this.cellSize, py);
            ctx.lineTo(px + this.cellSize, py + this.cellSize);
            ctx.stroke();
        }

        if (!cell.passages.includes('W')) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px, py + this.cellSize);
            ctx.stroke();
        }
    }
}

// ============ GAME RECORDING CLASS ============
class GameRecording {
    constructor() {
        this.frames = [];
        this.metadata = {};
        this.isRecording = false;
        this.startTime = 0;
    }

    start(metadata) {
        this.frames = [];
        this.metadata = {
            ...metadata,
            startTime: Date.now(),
            version: '1.0'
        };
        this.isRecording = true;
        this.startTime = Date.now();
    }

    recordFrame(gameState) {
        if (!this.isRecording) return;

        this.frames.push({
            timestamp: Date.now() - this.startTime,
            pacman: {
                x: gameState.pacman.x,
                y: gameState.pacman.y,
                direction: gameState.pacman.direction.name
            },
            ghosts: gameState.ghosts.map(g => ({
                name: g.name,
                x: g.x,
                y: g.y,
                mode: g.mode,
                direction: g.direction.name
            })),
            score: gameState.score,
            lives: gameState.lives,
            pelletsRemaining: gameState.pelletsRemaining
        });
    }

    stop() {
        this.isRecording = false;
        this.metadata.endTime = Date.now();
        this.metadata.duration = this.metadata.endTime - this.metadata.startTime;
        this.metadata.totalFrames = this.frames.length;
    }

    export() {
        return {
            metadata: this.metadata,
            frames: this.frames
        };
    }

    import(data) {
        this.metadata = data.metadata;
        this.frames = data.frames;
    }
}

// ============ MAIN GAME ENGINE CLASS ============
class GameEngine {
    constructor(canvas, mazeData) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = GAME_CONFIG.CELL_SIZE;

        // Initialize maze
        this.maze = new GameMaze(mazeData, this.cellSize);

        // Resize canvas
        this.canvas.width = this.maze.width * this.cellSize;
        this.canvas.height = this.maze.height * this.cellSize;

        // Game state
        this.state = GameState.READY;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.ghostsEatenCombo = 0;

        // Timer
        this.gameTime = 0;
        this.modeTimer = 0;
        this.currentMode = GhostMode.SCATTER;

        // Initialize entities
        this.initEntities();

        // Recording
        this.recording = new GameRecording();
        this.isRecording = false;

        // Replay
        this.replay = null;
        this.replayFrameIndex = 0;
        this.isReplaying = false;

        // Animation
        this.lastTime = 0;
        this.animationId = null;

        // Callbacks
        this.onScoreChange = null;
        this.onLivesChange = null;
        this.onGameOver = null;
        this.onLevelComplete = null;
        this.onTimeUpdate = null;
    }

    initEntities() {
        // Pac-Man start position
        const startPos = this.maze.getStartPosition();
        console.log('Pac-Man start position:', startPos); // Debug
        this.pacman = new PacMan(
            startPos.x * this.cellSize,
            startPos.y * this.cellSize,
            this.cellSize
        );

        // Ghost positions
        const ghostHouse = this.maze.getGhostHouseCenter();
        console.log('Ghost house center:', ghostHouse); // Debug
        const gx = ghostHouse.x * this.cellSize;
        const gy = ghostHouse.y * this.cellSize;

        this.ghosts = [
            new Blinky(gx, gy - this.cellSize * 2, this.cellSize),
            new Pinky(gx - this.cellSize, gy, this.cellSize),
            new Inky(gx + this.cellSize, gy, this.cellSize),
            new Clyde(gx, gy, this.cellSize)
        ];

        // Reference to Blinky for Inky's AI
        this.blinky = this.ghosts[0];
        console.log('Entities initialized - Ghosts:', this.ghosts.length); // Debug
    }

    start() {
        this.state = GameState.PLAYING;
        this.lastTime = performance.now();

        if (this.isRecording) {
            this.recording.start({
                mazeWidth: this.maze.width,
                mazeHeight: this.maze.height,
                level: this.level
            });
        }

        this.gameLoop();
    }

    pause() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }

    resume() {
        if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    stop() {
        this.state = GameState.GAME_OVER;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.isRecording) {
            this.recording.stop();
        }
    }

    gameLoop(currentTime = performance.now()) {
        if (this.state !== GameState.PLAYING) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap deltaTime to prevent large jumps
        const cappedDelta = Math.min(deltaTime, 33); // Max ~30fps worth of time

        // Update game time
        this.gameTime += cappedDelta;
        if (this.onTimeUpdate) {
            this.onTimeUpdate(Math.floor(this.gameTime / 1000));
        }

        // Update mode timer (scatter/chase alternation)
        this.modeTimer += cappedDelta;
        this.updateGhostMode();

        // Update entities
        this.update(cappedDelta);

        // Check collisions
        this.checkCollisions();

        // Record frame
        if (this.isRecording) {
            this.recording.recordFrame({
                pacman: this.pacman,
                ghosts: this.ghosts,
                score: this.score,
                lives: this.lives,
                pelletsRemaining: this.maze.getRemainingPellets()
            });
        }

        // Draw
        this.draw();

        // Continue loop
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(deltaTime) {
        // Update Pac-Man
        this.pacman.update(this.maze, deltaTime);

        // Update ghosts
        for (const ghost of this.ghosts) {
            ghost.update(this.maze, this.pacman, this.blinky, deltaTime);
        }

        // Update pellets
        for (const pellet of this.maze.pellets) {
            pellet.update(deltaTime);
        }
    }

    updateGhostMode() {
        const scatterDuration = GAME_CONFIG.SCATTER_DURATION;
        const chaseDuration = GAME_CONFIG.CHASE_DURATION;
        const cycleDuration = scatterDuration + chaseDuration;

        const cycleTime = this.modeTimer % cycleDuration;
        const newMode = cycleTime < scatterDuration ? GhostMode.SCATTER : GhostMode.CHASE;

        if (newMode !== this.currentMode) {
            this.currentMode = newMode;
            // Update all ghosts not in frightened or eaten mode
            for (const ghost of this.ghosts) {
                if (ghost.mode !== GhostMode.FRIGHTENED && ghost.mode !== GhostMode.EATEN) {
                    ghost.mode = newMode;
                }
            }
        }
    }

    checkCollisions() {
        // Pac-Man with pellets
        for (const pellet of this.maze.pellets) {
            if (pellet.eaten) continue;

            const distance = Math.sqrt(
                (this.pacman.gridX - pellet.x) ** 2 +
                (this.pacman.gridY - pellet.y) ** 2
            );

            if (distance < 0.5) {
                pellet.eaten = true;

                if (pellet.isPower) {
                    this.addScore(GAME_CONFIG.POWER_PELLET_SCORE);
                    this.activatePowerMode();
                } else {
                    this.addScore(GAME_CONFIG.PELLET_SCORE);
                }

                // Check level complete
                if (this.maze.getRemainingPellets() === 0) {
                    this.levelComplete();
                }
            }
        }

        // Pac-Man with ghosts
        for (const ghost of this.ghosts) {
            if (ghost.mode === GhostMode.IN_HOUSE) continue;

            const distance = Math.sqrt(
                (this.pacman.centerX - ghost.centerX) ** 2 +
                (this.pacman.centerY - ghost.centerY) ** 2
            );

            if (distance < this.cellSize * 0.8) {
                if (ghost.mode === GhostMode.FRIGHTENED) {
                    // Eat ghost
                    ghost.setEaten();
                    const ghostScore = GAME_CONFIG.GHOST_SCORES[Math.min(this.ghostsEatenCombo, 3)];
                    this.addScore(ghostScore);
                    this.ghostsEatenCombo++;
                } else if (ghost.mode !== GhostMode.EATEN) {
                    // Pac-Man dies
                    this.pacmanDeath();
                }
            }
        }
    }

    activatePowerMode() {
        this.ghostsEatenCombo = 0;
        for (const ghost of this.ghosts) {
            ghost.setFrightened();
        }
    }

    pacmanDeath() {
        this.pacman.die();
        this.state = GameState.DYING;

        setTimeout(() => {
            this.lives--;
            if (this.onLivesChange) this.onLivesChange(this.lives);

            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.resetPositions();
                this.state = GameState.READY;
            }
        }, 1500);
    }

    resetPositions() {
        const startPos = this.maze.getStartPosition();
        this.pacman.reset(
            startPos.x * this.cellSize,
            startPos.y * this.cellSize
        );

        for (const ghost of this.ghosts) {
            ghost.reset();
        }
    }

    levelComplete() {
        this.state = GameState.LEVEL_COMPLETE;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.onLevelComplete) {
            this.onLevelComplete(this.level, this.score);
        }
    }

    nextLevel() {
        this.level++;
        this.maze.initPellets();
        this.resetPositions();
        this.modeTimer = 0;
        this.start();
    }

    gameOver() {
        this.stop();
        if (this.onGameOver) {
            this.onGameOver(this.score, this.level);
        }
    }

    addScore(points) {
        this.score += points;
        if (this.onScoreChange) {
            this.onScoreChange(this.score);
        }
    }

    draw() {
        // Draw maze
        this.maze.draw(this.ctx);

        // Draw pellets
        for (const pellet of this.maze.pellets) {
            pellet.draw(this.ctx, this.cellSize);
        }

        // Draw ghosts
        for (const ghost of this.ghosts) {
            ghost.draw(this.ctx);
        }

        // Draw Pac-Man
        this.pacman.draw(this.ctx);
    }

    // Input handling
    setDirection(direction) {
        if (this.state === GameState.READY) {
            this.start();
        }
        if (this.state === GameState.PLAYING && this.pacman) {
            this.pacman.setDirection(direction);
        }
    }

    handleKeyDown(key) {
        switch (key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.setDirection(DIRECTIONS.UP);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.setDirection(DIRECTIONS.DOWN);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.setDirection(DIRECTIONS.LEFT);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.setDirection(DIRECTIONS.RIGHT);
                break;
            case ' ':
            case 'Enter':
                if (this.state === GameState.PAUSED) {
                    this.resume();
                } else if (this.state === GameState.READY) {
                    this.start();
                }
                break;
            case 'Escape':
            case 'p':
            case 'P':
                if (this.state === GameState.PLAYING) {
                    this.pause();
                } else if (this.state === GameState.PAUSED) {
                    this.resume();
                }
                break;
        }
    }

    // Recording controls
    startRecording() {
        this.isRecording = true;
    }

    stopRecording() {
        if (this.isRecording) {
            this.recording.stop();
            this.isRecording = false;
            return this.recording.export();
        }
        return null;
    }

    // Replay controls
    loadReplay(replayData) {
        this.replay = replayData;
        this.replayFrameIndex = 0;
    }

    startReplay() {
        if (!this.replay) return;

        this.isReplaying = true;
        this.replayFrameIndex = 0;
        this.replayLoop();
    }

    replayLoop() {
        if (!this.isReplaying || this.replayFrameIndex >= this.replay.frames.length) {
            this.isReplaying = false;
            return;
        }

        const frame = this.replay.frames[this.replayFrameIndex];

        // Apply frame state
        this.pacman.x = frame.pacman.x;
        this.pacman.y = frame.pacman.y;
        this.pacman.direction = DIRECTIONS[frame.pacman.direction];

        frame.ghosts.forEach((ghostData, index) => {
            const ghost = this.ghosts[index];
            if (ghost) {
                ghost.x = ghostData.x;
                ghost.y = ghostData.y;
                ghost.mode = ghostData.mode;
                ghost.direction = DIRECTIONS[ghostData.direction];
            }
        });

        this.score = frame.score;
        this.lives = frame.lives;

        // Draw
        this.draw();

        // Next frame
        this.replayFrameIndex++;

        // Calculate delay to next frame
        const currentTs = frame.timestamp;
        const nextFrame = this.replay.frames[this.replayFrameIndex];
        const delay = nextFrame ? nextFrame.timestamp - currentTs : 16;

        setTimeout(() => this.replayLoop(), Math.max(delay, 16));
    }

    stopReplay() {
        this.isReplaying = false;
    }
}

// Export for use in app.js
window.GameEngine = GameEngine;
window.DIRECTIONS = DIRECTIONS;
window.GameState = GameState;
window.GhostMode = GhostMode;
