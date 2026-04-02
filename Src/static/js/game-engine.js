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
    IN_HOUSE: 'IN_HOUSE',
    LEAVING_HOUSE: 'LEAVING_HOUSE'  // New mode for exiting the ghost house
};

// ============ BFS PATHFINDER CLASS ============
// Implements Breadth-First Search for ghost pathfinding
class Pathfinder {
    constructor(maze) {
        this.maze = maze;
    }

    // BFS algorithm to find shortest path from start to goal
    findPath(startX, startY, goalX, goalY) {
        // Clamp goal to maze bounds
        goalX = Math.max(0, Math.min(this.maze.width - 1, Math.round(goalX)));
        goalY = Math.max(0, Math.min(this.maze.height - 1, Math.round(goalY)));
        startX = Math.round(startX);
        startY = Math.round(startY);

        // If start equals goal, no path needed
        if (startX === goalX && startY === goalY) {
            return [];
        }

        const queue = [];
        const visited = new Set();
        const parent = new Map();

        const startKey = `${startX},${startY}`;
        queue.push({ x: startX, y: startY });
        visited.add(startKey);

        const directions = [
            { dir: DIRECTIONS.UP, dx: 0, dy: -1 },
            { dir: DIRECTIONS.DOWN, dx: 0, dy: 1 },
            { dir: DIRECTIONS.LEFT, dx: -1, dy: 0 },
            { dir: DIRECTIONS.RIGHT, dx: 1, dy: 0 }
        ];

        while (queue.length > 0) {
            const current = queue.shift();
            const currentKey = `${current.x},${current.y}`;

            // Check if we reached the goal
            if (current.x === goalX && current.y === goalY) {
                return this.reconstructPath(parent, startKey, currentKey);
            }

            // Explore neighbors
            for (const { dir, dx, dy } of directions) {
                // Check if this direction is passable from current cell
                if (!this.maze.isPassable(current.x, current.y, dir)) {
                    continue;
                }

                let nextX = current.x + dx;
                let nextY = current.y + dy;

                // Handle tunnel wrapping
                if (nextX < 0) nextX = this.maze.width - 1;
                if (nextX >= this.maze.width) nextX = 0;

                const nextKey = `${nextX},${nextY}`;

                if (!visited.has(nextKey)) {
                    visited.add(nextKey);
                    parent.set(nextKey, { from: currentKey, direction: dir });
                    queue.push({ x: nextX, y: nextY });
                }
            }
        }

        // No path found - return empty array
        return [];
    }

    // Reconstruct path from parent map
    reconstructPath(parent, startKey, goalKey) {
        const path = [];
        let currentKey = goalKey;

        while (currentKey !== startKey && parent.has(currentKey)) {
            const { from, direction } = parent.get(currentKey);
            path.unshift(direction);  // Add to front of path
            currentKey = from;
        }

        return path;
    }

    // Get next direction towards goal using BFS
    getNextDirection(startX, startY, goalX, goalY) {
        const path = this.findPath(startX, startY, goalX, goalY);
        if (path.length > 0) {
            return path[0];  // Return first step of path
        }
        return null;
    }

    // A* algorithm with Manhattan distance heuristic (more efficient for longer paths)
    findPathAStar(startX, startY, goalX, goalY) {
        goalX = Math.max(0, Math.min(this.maze.width - 1, Math.round(goalX)));
        goalY = Math.max(0, Math.min(this.maze.height - 1, Math.round(goalY)));
        startX = Math.round(startX);
        startY = Math.round(startY);

        if (startX === goalX && startY === goalY) {
            return [];
        }

        // Priority queue using array (sorted by f = g + h)
        const openSet = [];
        const closedSet = new Set();
        const gScore = new Map();
        const parent = new Map();

        const startKey = `${startX},${startY}`;
        const heuristic = (x, y) => Math.abs(x - goalX) + Math.abs(y - goalY);

        gScore.set(startKey, 0);
        openSet.push({
            x: startX,
            y: startY,
            f: heuristic(startX, startY)
        });

        const directions = [
            { dir: DIRECTIONS.UP, dx: 0, dy: -1 },
            { dir: DIRECTIONS.DOWN, dx: 0, dy: 1 },
            { dir: DIRECTIONS.LEFT, dx: -1, dy: 0 },
            { dir: DIRECTIONS.RIGHT, dx: 1, dy: 0 }
        ];

        while (openSet.length > 0) {
            // Get node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currentKey = `${current.x},${current.y}`;

            if (current.x === goalX && current.y === goalY) {
                return this.reconstructPath(parent, startKey, currentKey);
            }

            closedSet.add(currentKey);

            for (const { dir, dx, dy } of directions) {
                if (!this.maze.isPassable(current.x, current.y, dir)) {
                    continue;
                }

                let nextX = current.x + dx;
                let nextY = current.y + dy;

                // Handle tunnel wrapping
                if (nextX < 0) nextX = this.maze.width - 1;
                if (nextX >= this.maze.width) nextX = 0;

                const nextKey = `${nextX},${nextY}`;

                if (closedSet.has(nextKey)) continue;

                const tentativeG = gScore.get(currentKey) + 1;

                if (!gScore.has(nextKey) || tentativeG < gScore.get(nextKey)) {
                    gScore.set(nextKey, tentativeG);
                    parent.set(nextKey, { from: currentKey, direction: dir });

                    const f = tentativeG + heuristic(nextX, nextY);

                    // Add to open set if not already there
                    const existing = openSet.find(n => n.x === nextX && n.y === nextY);
                    if (existing) {
                        existing.f = f;
                    } else {
                        openSet.push({ x: nextX, y: nextY, f });
                    }
                }
            }
        }

        return [];
    }
}

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

    // Grid position based on the center of the entity
    get gridX() {
        return Math.floor((this.x + this.cellSize / 2) / this.cellSize);
    }

    get gridY() {
        return Math.floor((this.y + this.cellSize / 2) / this.cellSize);
    }

    get centerX() {
        return this.x + this.cellSize / 2;
    }

    get centerY() {
        return this.y + this.cellSize / 2;
    }

    // Get the pixel position of the current cell's center
    get cellCenterX() {
        return this.gridX * this.cellSize + this.cellSize / 2;
    }

    get cellCenterY() {
        return this.gridY * this.cellSize + this.cellSize / 2;
    }

    // Check if entity is aligned with the grid (at cell center)
    isAtCenter() {
        const tolerance = 3;  // Fixed pixel tolerance
        const offsetX = Math.abs(this.centerX - this.cellCenterX);
        const offsetY = Math.abs(this.centerY - this.cellCenterY);
        return offsetX <= tolerance && offsetY <= tolerance;
    }

    // Check if aligned on a specific axis
    isAlignedX() {
        const tolerance = 3;
        return Math.abs(this.centerX - this.cellCenterX) <= tolerance;
    }

    isAlignedY() {
        const tolerance = 3;
        return Math.abs(this.centerY - this.cellCenterY) <= tolerance;
    }

    snapToGrid() {
        this.x = this.gridX * this.cellSize;
        this.y = this.gridY * this.cellSize;
    }

    // Snap to grid on specific axis
    snapToGridX() {
        this.x = this.gridX * this.cellSize;
    }

    snapToGridY() {
        this.y = this.gridY * this.cellSize;
    }
}

// ============ PAC-MAN CLASS ============
class PacMan extends Entity {
    constructor(x, y, cellSize) {
        super(x, y, cellSize);
        this.speed = GAME_CONFIG.PACMAN_SPEED;
        this.mouthAngle = 0;
        this.animationFrame = 0;
        this.isDying = false;
        this.deathFrame = 0;
        this.lastDirection = DIRECTIONS.RIGHT;
        this.isKeyHeld = false;
        this.currentKey = null;
        this.lastDeltaTime = 16.67;  // Store deltaTime for movement
    }

    update(maze, deltaTime) {
        this.lastDeltaTime = deltaTime;
        
        if (this.isDying) {
            this.deathFrame += deltaTime * 0.01;
            return;
        }

        // Animate mouth when moving
        if (this.direction !== DIRECTIONS.NONE) {
            this.animationFrame += deltaTime * 0.015;
            this.mouthAngle = Math.abs(Math.sin(this.animationFrame) * 45);
        }

        this.handleMovement(maze);
    }

    handleMovement(maze) {
        const gx = this.gridX;
        const gy = this.gridY;
        const atCenter = this.isAtCenter();

        // At cell center: handle direction changes and stopping
        if (atCenter) {
            // If key is not held, stop and snap
            if (!this.isKeyHeld) {
                this.snapToGrid();
                this.direction = DIRECTIONS.NONE;
                return;
            }

            // Try to move in the requested direction
            if (this.nextDirection !== DIRECTIONS.NONE) {
                const canMoveNext = this.canMove(gx, gy, this.nextDirection, maze);

                if (canMoveNext) {
                    // Only snap when changing direction
                    if (this.direction !== this.nextDirection) {
                        this.snapToGrid();
                    }
                    this.direction = this.nextDirection;
                    this.lastDirection = this.direction;
                } else {
                    // Can't move in requested direction
                    if (this.direction !== DIRECTIONS.NONE) {
                        const canMoveCurrent = this.canMove(gx, gy, this.direction, maze);
                        if (!canMoveCurrent) {
                            this.snapToGrid();
                            this.direction = DIRECTIONS.NONE;
                        }
                    } else {
                        this.direction = DIRECTIONS.NONE;
                    }
                }
            }

            // Final check: if direction is blocked, stop
            if (this.direction !== DIRECTIONS.NONE && !this.canMove(gx, gy, this.direction, maze)) {
                this.snapToGrid();
                this.direction = DIRECTIONS.NONE;
                return;
            }
        }

        // Move in current direction with deltaTime normalization
        if (this.direction !== DIRECTIONS.NONE) {
            const speedMultiplier = this.lastDeltaTime / 16.67;  // Normalize to 60fps
            const currentSpeed = this.speed * speedMultiplier;
            this.x += this.direction.x * currentSpeed;
            this.y += this.direction.y * currentSpeed;
            this.handleTunnelWrap(maze);
        }
    }

    canMove(gridX, gridY, direction, maze) {
        if (!direction || direction === DIRECTIONS.NONE) return false;

        const nextX = gridX + direction.x;
        const nextY = gridY + direction.y;

        // Check vertical bounds
        if (nextY < 0 || nextY >= maze.height) {
            return false;
        }

        // Handle horizontal wrap (tunnels) - check if moving beyond edges
        if (nextX < 0 || nextX >= maze.width) {
            const cellKey = `${gridX},${gridY}`;
            const cell = maze.cells[cellKey];
            if (!cell) return false;

            // Allow movement through tunnel if the current cell has the appropriate passage
            if (direction === DIRECTIONS.LEFT && cell.passages && cell.passages.includes('W')) return true;
            if (direction === DIRECTIONS.RIGHT && cell.passages && cell.passages.includes('E')) return true;
            return false;
        }

        // Use maze's isPassable method
        if (typeof maze.isPassable === 'function') {
            return maze.isPassable(gridX, gridY, direction);
        }

        // Fallback: check passages directly
        const cellKey = `${gridX},${gridY}`;
        const cell = maze.cells ? maze.cells[cellKey] : null;
        if (!cell || !cell.passages) return false;

        let passageKey;
        if (direction === DIRECTIONS.UP) passageKey = 'N';
        else if (direction === DIRECTIONS.DOWN) passageKey = 'S';
        else if (direction === DIRECTIONS.LEFT) passageKey = 'W';
        else if (direction === DIRECTIONS.RIGHT) passageKey = 'E';
        else return false;

        return cell.passages.includes(passageKey);
    }

    handleTunnelWrap(maze) {
        const maxX = maze.width * this.cellSize;
        const wrapThreshold = this.cellSize / 2;

        // Wrap from left edge to right edge
        if (this.x < -wrapThreshold) {
            this.x = maxX - this.cellSize + (this.x + wrapThreshold);
        }
        // Wrap from right edge to left edge
        else if (this.x > maxX - this.cellSize + wrapThreshold) {
            this.x = this.x - maxX;
        }
    }

    draw(ctx) {
        const cx = this.centerX;
        const cy = this.centerY;
        const radius = this.cellSize / 2 - 2;

        if (this.isDying) {
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

        const drawDirection = this.direction !== DIRECTIONS.NONE ? this.direction : this.lastDirection;
        let rotation = 0;
        if (drawDirection === DIRECTIONS.RIGHT) rotation = 0;
        else if (drawDirection === DIRECTIONS.DOWN) rotation = 90;
        else if (drawDirection === DIRECTIONS.LEFT) rotation = 180;
        else if (drawDirection === DIRECTIONS.UP) rotation = 270;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation * Math.PI / 180);

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
        this.isKeyHeld = true;
        this.nextDirection = direction;
        this.lastDirection = direction;
        this.currentKey = direction.name;
    }

    stopMovement() {
        this.isKeyHeld = false;
        this.currentKey = null;
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
        this.lastDirection = DIRECTIONS.RIGHT;
        this.isKeyHeld = false;
        this.currentKey = null;
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
        this.exitX = null;  // Ghost house exit X position (set by GameEngine)
        this.exitY = null;  // Ghost house exit Y position (set by GameEngine)
        this.lastDecisionCell = null;  // Track last cell where direction was chosen
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

        // Handle release from ghost house - transition to LEAVING_HOUSE mode
        if (this.mode === GhostMode.IN_HOUSE) {
            this.releaseTimer -= deltaTime;
            if (this.releaseTimer <= 0) {
                // Ready to leave - switch to LEAVING_HOUSE mode
                this.mode = GhostMode.LEAVING_HOUSE;
                this.direction = DIRECTIONS.UP;
                console.log(`${this.name} starting to leave house`);
            } else {
                // Bounce up and down inside the house while waiting
                this.bounceInHouse(deltaTime);
                return;
            }
        }

        // Handle exiting the ghost house
        if (this.mode === GhostMode.LEAVING_HOUSE) {
            this.leaveHouse(deltaTime, maze);
            return;
        }

        // Normal movement - choose direction at intersections
        const currentCellKey = `${this.gridX},${this.gridY}`;
        const atNewCell = currentCellKey !== this.lastDecisionCell;
        
        if ((this.isAtCenter() && atNewCell) || this.direction === DIRECTIONS.NONE || !this.direction) {
            this.snapToGrid();
            const target = this.getTarget(pacman, blinky);
            this.chooseDirection(maze, target);
            this.lastDecisionCell = currentCellKey;
        }

        // Calculate speed based on mode (normalized by deltaTime for consistent speed)
        const baseSpeed = this.mode === GhostMode.FRIGHTENED
            ? GAME_CONFIG.FRIGHTENED_SPEED
            : this.mode === GhostMode.EATEN
                ? GAME_CONFIG.GHOST_SPEED * 2
                : this.speed;
        
        // Normalize speed by deltaTime (target 60fps = 16.67ms per frame)
        const speedMultiplier = deltaTime / 16.67;
        const currentSpeed = baseSpeed * speedMultiplier;

        // Move in current direction
        if (this.direction && this.direction !== DIRECTIONS.NONE) {
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
                console.log(`${this.name} returned home`);
            }
        }
    }

    // Bounce up and down while inside the ghost house
    bounceInHouse(deltaTime) {
        const speedMultiplier = deltaTime / 16.67;  // Normalize to 60fps
        const bounceSpeed = this.speed * 0.5 * speedMultiplier;  // Slower bouncing
        const bounceRange = this.cellSize * 0.5;  // Bounce within half a cell
        
        // Calculate center of bounce area
        const homeCenterY = this.homeY + this.cellSize / 2;
        const currentCenterY = this.y + this.cellSize / 2;
        
        // Check if we need to reverse direction
        if (this.direction === DIRECTIONS.UP && currentCenterY <= homeCenterY - bounceRange) {
            this.direction = DIRECTIONS.DOWN;
        } else if (this.direction === DIRECTIONS.DOWN && currentCenterY >= homeCenterY + bounceRange) {
            this.direction = DIRECTIONS.UP;
        }
        
        // Default to UP if no direction
        if (this.direction === DIRECTIONS.NONE) {
            this.direction = DIRECTIONS.UP;
        }
        
        // Move vertically only
        this.y += this.direction.y * bounceSpeed;
        this.eyeDirection = this.direction;
    }

    // Move ghost out of the ghost house
    leaveHouse(deltaTime, maze) {
        const speedMultiplier = deltaTime / 16.67;  // Normalize to 60fps
        const exitSpeed = this.speed * 1.5 * speedMultiplier;
        
        // If exit position is not set, use default behavior (move up)
        if (this.exitX === null || this.exitY === null) {
            this.y -= exitSpeed;
            this.eyeDirection = DIRECTIONS.UP;
            if (this.y < this.homeY - this.cellSize * 2) {
                this.finishExiting(maze);
            }
            return;
        }
        
        const exitPixelX = this.exitX * this.cellSize;
        const exitPixelY = this.exitY * this.cellSize;
        
        // Calculate distance to exit
        const distToExit = Math.sqrt(
            Math.pow(exitPixelX - this.x, 2) + 
            Math.pow(exitPixelY - this.y, 2)
        );
        
        // If close enough to exit, finish exiting
        if (distToExit < this.cellSize * 0.5) {
            this.x = exitPixelX;
            this.y = exitPixelY;
            this.finishExiting(maze);
            return;
        }
        
        // Move towards exit
        const yDiff = exitPixelY - this.y;
        const xDiff = exitPixelX - this.x;
        
        // First align X, then move Y
        if (Math.abs(xDiff) > 2) {
            this.x += Math.sign(xDiff) * exitSpeed;
            this.eyeDirection = xDiff > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
        } else if (Math.abs(yDiff) > 2) {
            this.y += Math.sign(yDiff) * exitSpeed;
            this.eyeDirection = yDiff > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
        }
    }

    // Called when ghost finishes exiting the ghost house
    finishExiting(maze) {
        this.snapToGrid();
        this.mode = GhostMode.SCATTER;
        
        // Log the cell we're exiting to
        const cellKey = `${this.gridX},${this.gridY}`;
        const cell = maze.cells[cellKey];
        console.log(`${this.name} at exit cell (${this.gridX}, ${this.gridY}), passages:`, cell ? cell.passages : 'NO CELL');
        
        // Mark this cell as the decision point
        this.lastDecisionCell = cellKey;
        
        // Try to find a valid direction from passages
        if (cell && cell.passages) {
            const passageToDir = {
                'N': DIRECTIONS.UP,
                'S': DIRECTIONS.DOWN,
                'E': DIRECTIONS.RIGHT,
                'W': DIRECTIONS.LEFT
            };
            
            // Prefer horizontal movement (E or W) over vertical
            for (const passage of ['W', 'E', 'N', 'S']) {
                if (cell.passages.includes(passage) && passage !== 'S') {  // Don't go back into ghost house
                    this.direction = passageToDir[passage];
                    this.eyeDirection = this.direction;
                    console.log(`${this.name} exited, moving ${this.direction.name} (passage ${passage})`);
                    return;
                }
            }
        }
        
        // Fallback: Check adjacent cells and move towards one that exists
        const neighbors = [
            { dir: DIRECTIONS.LEFT, dx: -1, dy: 0 },
            { dir: DIRECTIONS.RIGHT, dx: 1, dy: 0 },
            { dir: DIRECTIONS.UP, dx: 0, dy: -1 }
        ];
        
        for (const { dir, dx, dy } of neighbors) {
            const neighborKey = `${this.gridX + dx},${this.gridY + dy}`;
            const neighborCell = maze.cells[neighborKey];
            if (neighborCell && !neighborCell.is_ghost_house) {
                this.direction = dir;
                this.eyeDirection = dir;
                console.log(`${this.name} exited, moving towards ${neighborKey}`);
                return;
            }
        }
        
        // Last resort: just pick left
        this.direction = DIRECTIONS.LEFT;
        this.eyeDirection = DIRECTIONS.LEFT;
        console.warn(`${this.name} could not find valid direction, forcing LEFT`);
    }

    handleTunnelWrap(maze) {
        const maxX = maze.width * this.cellSize;
        const wrapThreshold = this.cellSize / 2;

        // Wrap from left edge to right edge
        if (this.x < -wrapThreshold) {
            this.x = maxX - this.cellSize + (this.x + wrapThreshold);
            this.lastDecisionCell = null;  // Force direction recalculation after wrap
        }
        // Wrap from right edge to left edge
        else if (this.x > maxX - this.cellSize + wrapThreshold) {
            this.x = this.x - maxX;
            this.lastDecisionCell = null;  // Force direction recalculation after wrap
        }
        
        // Safety bounds - keep ghost in maze
        const currentGridX = Math.floor((this.x + this.cellSize / 2) / this.cellSize);
        const currentGridY = Math.floor((this.y + this.cellSize / 2) / this.cellSize);
        
        if (currentGridX < 0) {
            this.x = (maze.width - 1) * this.cellSize;
        } else if (currentGridX >= maze.width) {
            this.x = 0;
        }
        if (currentGridY < 0) {
            this.y = 0;
        } else if (currentGridY >= maze.height) {
            this.y = (maze.height - 1) * this.cellSize;
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

    // Choose direction using simple greedy algorithm
    chooseDirection(maze, target) {
        const allValidDirections = [];
        const opposite = this.direction ? OPPOSITE_DIRECTIONS[this.direction.name] : null;

        // First, collect ALL valid directions
        for (const [name, dir] of Object.entries(DIRECTIONS)) {
            if (name === 'NONE') continue;
            if (this.canMove(maze, dir)) {
                allValidDirections.push({ name, dir });
            }
        }

        // If no valid directions at all, ghost is stuck
        if (allValidDirections.length === 0) {
            console.warn(`${this.name} at (${this.gridX}, ${this.gridY}) has NO valid directions!`);
            return;
        }

        // Filter out the opposite direction (no reversing), unless it's the only option
        let possibleDirections = allValidDirections.filter(d => d.name !== opposite);
        if (possibleDirections.length === 0) {
            // Must reverse - it's the only option
            possibleDirections = allValidDirections;
        }

        // Only one option - take it
        if (possibleDirections.length === 1) {
            this.direction = possibleDirections[0].dir;
            this.eyeDirection = this.direction;
            return;
        }

        // Multiple options - choose the one closest to target
        let bestDirection = possibleDirections[0].dir;
        let bestDistance = Infinity;

        for (const { dir } of possibleDirections) {
            let nextX = this.gridX + dir.x;
            let nextY = this.gridY + dir.y;

            // Handle wraparound
            if (nextX < 0) nextX = maze.width - 1;
            else if (nextX >= maze.width) nextX = 0;

            const distance = this.calculateDistance(nextX, nextY, target.x, target.y);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestDirection = dir;
            }
        }

        this.direction = bestDirection;
        this.eyeDirection = this.direction;
    }

    // Check if ghost can move in a direction
    canMove(maze, direction) {
        // Safety check: if out of bounds, allow any direction to escape
        if (this.gridX < 0 || this.gridX >= maze.width || this.gridY < 0 || this.gridY >= maze.height) {
            return true;  // Allow movement to get back in bounds
        }
        
        const cellKey = `${this.gridX},${this.gridY}`;
        const cell = maze.cells[cellKey];
        
        if (!cell) {
            // No cell found - allow movement to escape invalid position
            return true;
        }

        // Map direction to passage key
        let passageKey;
        if (direction === DIRECTIONS.UP) passageKey = 'N';
        else if (direction === DIRECTIONS.DOWN) passageKey = 'S';
        else if (direction === DIRECTIONS.LEFT) passageKey = 'W';
        else if (direction === DIRECTIONS.RIGHT) passageKey = 'E';
        else return false;

        // Check if passage exists
        const canPass = cell.passages && cell.passages.includes(passageKey);
        
        // Special case: ghost house cells should allow exit
        if (cell.is_ghost_house && direction === DIRECTIONS.UP) {
            return true;  // Always allow going up from ghost house
        }

        return canPass;
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
        // Don't frighten ghosts that are in or leaving the house, or already eaten
        if (this.mode !== GhostMode.EATEN && 
            this.mode !== GhostMode.IN_HOUSE && 
            this.mode !== GhostMode.LEAVING_HOUSE) {
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
        this.releaseTimer = 0;
        this.mode = GhostMode.SCATTER;  // Starts outside, immediately active
        this.direction = DIRECTIONS.LEFT;  // Start moving left
    }

    getChaseTarget(pacman) {
        // Direct pursuit - target Pac-Man's current position
        return { x: pacman.gridX, y: pacman.gridY };
    }

    reset() {
        // Blinky resets to exit position and starts immediately
        this.x = this.homeX;
        this.y = this.homeY;
        this.direction = DIRECTIONS.LEFT;
        this.mode = GhostMode.SCATTER;  // Blinky starts active, not in house
        this.frightendTimer = 0;
    }
}

// Pinky (Pink) - Ambushes 4 cells ahead of Pac-Man
class Pinky extends Ghost {
    constructor(x, y, cellSize) {
        super(x, y, cellSize, 'Pinky', GAME_CONFIG.COLORS.ghostPink, { x: 2, y: -2 });
        this.releaseTimer = 2000;
        this.initialReleaseTimer = 2000;  // Store initial value for reset
    }

    getChaseTarget(pacman) {
        // Target 4 cells ahead of Pac-Man
        return {
            x: pacman.gridX + pacman.direction.x * 4,
            y: pacman.gridY + pacman.direction.y * 4
        };
    }

    reset() {
        super.reset();
        this.releaseTimer = this.initialReleaseTimer;
    }
}

// Inky (Cyan) - Unpredictable, uses Blinky's position
class Inky extends Ghost {
    constructor(x, y, cellSize) {
        super(x, y, cellSize, 'Inky', GAME_CONFIG.COLORS.ghostCyan, { x: 27, y: 30 });
        this.releaseTimer = 5000;
        this.initialReleaseTimer = 5000;
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

    reset() {
        super.reset();
        this.releaseTimer = this.initialReleaseTimer;
    }
}

// Clyde (Orange) - Shy, runs away when close
class Clyde extends Ghost {
    constructor(x, y, cellSize) {
        super(x, y, cellSize, 'Clyde', GAME_CONFIG.COLORS.ghostOrange, { x: 0, y: 30 });
        this.releaseTimer = 8000;
        this.initialReleaseTimer = 8000;
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

    reset() {
        super.reset();
        this.releaseTimer = this.initialReleaseTimer;
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

        // Ghost house cells have special handling - they're internally connected
        // But we still need to check for the exit passage
        if (cell.is_ghost_house) {
            // Inside ghost house, allow movement in any direction within the house
            // Check if target cell is also ghost house or is the exit
            let targetX = x;
            let targetY = y;
            if (direction === DIRECTIONS.UP) targetY--;
            else if (direction === DIRECTIONS.DOWN) targetY++;
            else if (direction === DIRECTIONS.LEFT) targetX--;
            else if (direction === DIRECTIONS.RIGHT) targetX++;
            
            const targetKey = `${targetX},${targetY}`;
            const targetCell = this.cells[targetKey];
            
            // Allow moving to another ghost house cell or to the exit above
            if (targetCell) {
                if (targetCell.is_ghost_house) return true;
                // Allow exit from ghost house (typically going UP)
                if (direction === DIRECTIONS.UP) return true;
            }
        }

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
        // Find a good starting position (bottom center area)
        const centerX = Math.floor(this.width / 2);
        const bottomY = this.height - 2;

        // Helper to check if a cell is valid for starting
        const isValidStart = (cell) => {
            if (!cell || cell.is_ghost_house) return false;
            // Must have at least one passage
            return cell.passages && cell.passages.length > 0;
        };

        // Try to find a valid cell near the bottom center
        const candidates = [
            { x: centerX, y: bottomY },
            { x: centerX, y: bottomY - 1 },
            { x: centerX - 1, y: bottomY },
            { x: centerX + 1, y: bottomY },
            { x: centerX, y: this.height - 3 },
            { x: centerX - 1, y: bottomY - 1 },
            { x: centerX + 1, y: bottomY - 1 },
        ];

        for (const pos of candidates) {
            const cellKey = `${pos.x},${pos.y}`;
            const cell = this.cells[cellKey];
            if (isValidStart(cell)) {
                console.log('Pacman start position:', pos, 'passages:', cell.passages);
                return pos;
            }
        }

        // Fallback: find any valid cell (preferring bottom half)
        let bestCell = null;
        let bestY = -1;

        for (const [key, cell] of Object.entries(this.cells)) {
            if (isValidStart(cell)) {
                const [x, y] = key.split(',').map(Number);
                // Prefer cells in the bottom half
                if (y > bestY) {
                    bestY = y;
                    bestCell = { x, y };
                }
            }
        }

        if (bestCell) {
            console.log('Pacman fallback start position:', bestCell);
            return bestCell;
        }

        console.warn('No valid start position found!');
        return { x: centerX, y: bottomY };
    }

    getGhostHouseCenter() {
        // Find ALL ghost house cells to calculate the actual center
        const ghostHouseCells = [];
        for (const [key, cell] of Object.entries(this.cells)) {
            if (cell.is_ghost_house) {
                const [x, y] = key.split(',').map(Number);
                ghostHouseCells.push({ x, y });
            }
        }
        
        if (ghostHouseCells.length === 0) {
            // No ghost house found, default to maze center
            return {
                x: Math.floor(this.width / 2),
                y: Math.floor(this.height / 2)
            };
        }
        
        // Calculate actual center of ghost house
        const minX = Math.min(...ghostHouseCells.map(c => c.x));
        const maxX = Math.max(...ghostHouseCells.map(c => c.x));
        const minY = Math.min(...ghostHouseCells.map(c => c.y));
        const maxY = Math.max(...ghostHouseCells.map(c => c.y));
        
        return {
            x: Math.floor((minX + maxX) / 2),
            y: Math.floor((minY + maxY) / 2)
        };
    }

    // Get the ghost house exit position (just above the ghost house)
    getGhostHouseExit() {
        // Find all ghost house cells to determine the top center
        const ghostHouseCells = [];
        for (const [key, cell] of Object.entries(this.cells)) {
            if (cell.is_ghost_house) {
                const [x, y] = key.split(',').map(Number);
                ghostHouseCells.push({ x, y });
            }
        }
        
        if (ghostHouseCells.length === 0) {
            // No ghost house, return center of maze
            const centerX = Math.floor(this.width / 2);
            const centerY = Math.floor(this.height / 2);
            return { x: centerX, y: centerY - 1 };
        }
        
        // Find the center X and minimum Y (top) of ghost house
        const minX = Math.min(...ghostHouseCells.map(c => c.x));
        const maxX = Math.max(...ghostHouseCells.map(c => c.x));
        const minY = Math.min(...ghostHouseCells.map(c => c.y));
        
        const centerX = Math.floor((minX + maxX) / 2);
        
        // Exit is just above the ghost house (one cell up from the top row)
        return { x: centerX, y: minY - 1 };
    }

    // Get complete ghost house info for proper ghost positioning
    getGhostHouseInfo() {
        const ghostHouseCells = [];
        for (const [key, cell] of Object.entries(this.cells)) {
            if (cell.is_ghost_house) {
                const [x, y] = key.split(',').map(Number);
                ghostHouseCells.push({ x, y });
            }
        }
        
        if (ghostHouseCells.length === 0) {
            const centerX = Math.floor(this.width / 2);
            const centerY = Math.floor(this.height / 2);
            console.warn('No ghost house found in maze!');
            return {
                center: { x: centerX, y: centerY },
                exit: { x: centerX, y: centerY - 1 },
                bounds: { minX: centerX, maxX: centerX, minY: centerY, maxY: centerY }
            };
        }
        
        const minX = Math.min(...ghostHouseCells.map(c => c.x));
        const maxX = Math.max(...ghostHouseCells.map(c => c.x));
        const minY = Math.min(...ghostHouseCells.map(c => c.y));
        const maxY = Math.max(...ghostHouseCells.map(c => c.y));
        
        const centerX = Math.floor((minX + maxX) / 2);
        const centerY = Math.floor((minY + maxY) / 2);
        
        // Find a valid exit cell - must have horizontal passages (E or W)
        let exitY = minY - 1;
        let exitX = centerX;
        let foundValidExit = false;
        
        // Search for a cell above ghost house that has passages
        for (let dy = -1; dy >= -3 && !foundValidExit; dy--) {
            for (let dx = -1; dx <= 1 && !foundValidExit; dx++) {
                const testX = centerX + dx;
                const testY = minY + dy;
                const testKey = `${testX},${testY}`;
                const testCell = this.cells[testKey];
                
                if (testCell && !testCell.is_ghost_house) {
                    // Check if this cell has at least one horizontal passage
                    const hasHorizontal = testCell.passages.includes('E') || testCell.passages.includes('W');
                    const hasAnyPassage = testCell.passages.length > 0;
                    
                    if (hasHorizontal || hasAnyPassage) {
                        exitX = testX;
                        exitY = testY;
                        foundValidExit = true;
                        console.log(`Found valid exit at (${exitX}, ${exitY}) with passages:`, testCell.passages);
                    }
                }
            }
        }
        
        if (!foundValidExit) {
            console.warn('No valid exit found, using default position above ghost house');
        }
        
        return {
            center: { x: centerX, y: centerY },
            exit: { x: exitX, y: exitY },
            bounds: { minX, maxX, minY, maxY },
            cells: ghostHouseCells
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
        console.log('Pac-Man start position:', startPos);
        this.pacman = new PacMan(
            startPos.x * this.cellSize,
            startPos.y * this.cellSize,
            this.cellSize
        );

        // Get ghost house info for proper positioning
        const ghostHouseInfo = this.maze.getGhostHouseInfo();
        console.log('Ghost house info:', ghostHouseInfo);
        
        const center = ghostHouseInfo.center;
        const exit = ghostHouseInfo.exit;
        const bounds = ghostHouseInfo.bounds;
        
        // Calculate ghost positions with pixel offsets to prevent overlap
        // Blinky starts at the exit (outside the house, ready to go)
        const blinkyX = exit.x * this.cellSize;
        const blinkyY = exit.y * this.cellSize;
        
        // Other ghosts spawn inside the ghost house with slight offsets
        // Use pixel offsets within the same cell to separate them visually
        const centerPixelX = center.x * this.cellSize;
        const centerPixelY = center.y * this.cellSize;
        
        // Pinky: left of center (or offset within cell)
        const pinkyX = centerPixelX - this.cellSize * 0.4;
        const pinkyY = centerPixelY;
        
        // Inky: right of center (or offset within cell)
        const inkyX = centerPixelX + this.cellSize * 0.4;
        const inkyY = centerPixelY;
        
        // Clyde: below center
        const clydeX = centerPixelX;
        const clydeY = centerPixelY + this.cellSize * 0.4;

        console.log('Ghost positions:', {
            blinky: { x: blinkyX, y: blinkyY },
            pinky: { x: pinkyX, y: pinkyY },
            inky: { x: inkyX, y: inkyY },
            clyde: { x: clydeX, y: clydeY }
        });

        this.ghosts = [
            new Blinky(blinkyX, blinkyY, this.cellSize),
            new Pinky(pinkyX, pinkyY, this.cellSize),
            new Inky(inkyX, inkyY, this.cellSize),
            new Clyde(clydeX, clydeY, this.cellSize)
        ];

        // Set the exit position for each ghost
        for (const ghost of this.ghosts) {
            ghost.exitX = exit.x;
            ghost.exitY = exit.y;
        }

        // Reference to Blinky for Inky's AI
        this.blinky = this.ghosts[0];
        console.log('Entities initialized - Ghosts:', this.ghosts.map(g => g.name));
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
            // Update only ghosts that are outside the house and not in special modes
            for (const ghost of this.ghosts) {
                if (ghost.mode !== GhostMode.FRIGHTENED && 
                    ghost.mode !== GhostMode.EATEN &&
                    ghost.mode !== GhostMode.IN_HOUSE &&
                    ghost.mode !== GhostMode.LEAVING_HOUSE) {
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
            // Skip ghosts that are in the house or leaving
            if (ghost.mode === GhostMode.IN_HOUSE || ghost.mode === GhostMode.LEAVING_HOUSE) continue;

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

    handleKeyUp(key) {
        // Stop Pacman when arrow key is released
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
             'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(key)) {
            if (this.pacman) {
                this.pacman.stopMovement();
            }
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
