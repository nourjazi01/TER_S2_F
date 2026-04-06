/**
 * PAC-MAN Maze Generator - Main Application
 */

// ============ CONFIGURATION ============
const CONFIG = {
    CELL_SIZE: 20,
    COLORS: {
        wall: '#2121DE',
        wallHighlight: '#5252FF',
        passage: '#000000',
        tunnel: '#FFB8FF',
        ghostHouse: '#FF0000',
        pellet: '#FFCC99',
        powerPellet: '#FFFF00',
        pacman: '#FFFF00',
        ghostRed: '#FF0000',
        ghostPink: '#FFB8FF',
        ghostCyan: '#00FFFF',
        ghostOrange: '#FFB852'
    },
    PRESETS: {
        easy: { playability: 0.2, deadEnd: 0.0, cycle: 0.8 },
        medium: { playability: 0.5, deadEnd: 0.0, cycle: 0.5 },
        hard: { playability: 0.9, deadEnd: 0.2, cycle: 0.2 }
    },
    GALLERY_LIMIT: 12
};

// ============ STATE ============
const state = {
    currentMaze: null,
    currentPreset: 'easy',
    currentTab: 'generate',
    gallery: {
        offset: 0,
        total: 0
    },
    game: {
        isPlaying: false,
        score: 0,
        lives: 3,
        level: 1
    }
};

// ============ DOM ELEMENTS ============
let canvas, ctx;
let gameCanvas, gameCtx;

// ============ INITIALIZATION ============
function init() {
    // Get canvas elements
    canvas = document.getElementById('mazeCanvas');
    ctx = canvas.getContext('2d');

    gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
        gameCtx = gameCanvas.getContext('2d');
    }

    // Setup event listeners
    setupNavigation();
    setupControls();
    setupSliders();
    setupPresets();
    setupGallery();
    setupGame();

    // Generate initial maze
    generateMaze();

    // Load gallery
    loadGallery();
}

// ============ NAVIGATION ============
function setupNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });
}

function switchTab(tabId) {
    state.currentTab = tabId;

    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    // Update panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `${tabId}-panel`);
    });

    // Special actions per tab
    if (tabId === 'gallery') {
        loadGallery();
    } else if (tabId === 'play') {
        initGame();
    }
}

// ============ CONTROLS ============
function setupControls() {
    document.getElementById('generateBtn')?.addEventListener('click', generateMaze);
    document.getElementById('saveBtn')?.addEventListener('click', saveMaze);
}

// ============ SLIDERS ============
function setupSliders() {
    const sliders = ['playability', 'deadEnd', 'cycle'];

    sliders.forEach(name => {
        const slider = document.getElementById(`${name}Slider`);
        const value = document.getElementById(`${name}Value`);

        if (slider && value) {
            slider.addEventListener('input', () => {
                value.textContent = parseFloat(slider.value).toFixed(1);
                setPreset('custom');
            });
        }
    });
}

// ============ PRESETS ============
function setupPresets() {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setPreset(btn.dataset.preset);
        });
    });
}

function setPreset(preset) {
    state.currentPreset = preset;

    // Update buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === preset);
    });

    // Apply preset values
    if (preset !== 'custom' && CONFIG.PRESETS[preset]) {
        const values = CONFIG.PRESETS[preset];

        setSliderValue('playability', values.playability);
        setSliderValue('deadEnd', values.deadEnd);
        setSliderValue('cycle', values.cycle);
    }
}

function setSliderValue(name, value) {
    const slider = document.getElementById(`${name}Slider`);
    const display = document.getElementById(`${name}Value`);

    if (slider && display) {
        slider.value = value;
        display.textContent = value.toFixed(1);
    }
}

// ============ MAZE GENERATION ============
async function generateMaze() {
    const width = parseInt(document.getElementById('mazeWidth')?.value) || 15;
    const height = parseInt(document.getElementById('mazeHeight')?.value) || 15;
    const playability = parseFloat(document.getElementById('playabilitySlider')?.value) || 0.5;
    const deadEnd = parseFloat(document.getElementById('deadEndSlider')?.value) || 0.0;
    const cycle = parseFloat(document.getElementById('cycleSlider')?.value) || 0.5;

    // Validation
    if (width < 5 || height < 5 || width > 50 || height > 50) {
        showNotification('Invalid dimensions (5-50)', 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await axios.post('/api/generate-maze', {
            width,
            height,
            playability,
            dead_end_ratio: deadEnd,
            cycle_intensity: cycle
        });

        if (response.data.success) {
            state.currentMaze = response.data.maze;
            resizeCanvas(canvas, width, height);
            drawMaze(ctx, state.currentMaze);
            updateMazeInfo(state.currentMaze);
        } else {
            showNotification(response.data.error || 'Generation failed', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
        console.error('Generation error:', error);
    } finally {
        showLoading(false);
    }
}

// ============ MAZE RENDERING ============
function resizeCanvas(canvasEl, width, height) {
    canvasEl.width = width * CONFIG.CELL_SIZE;
    canvasEl.height = height * CONFIG.CELL_SIZE;
}

function drawMaze(context, mazeData, options = {}) {
    if (!mazeData || !mazeData.cells) return;

    const { showPellets = false, showPacman = false } = options;
    const cells = mazeData.cells;
    const width = mazeData.metadata.width;
    const height = mazeData.metadata.height;
    const cellSize = CONFIG.CELL_SIZE;

    // Clear with black
    context.fillStyle = CONFIG.COLORS.passage;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    // Identify tunnel cells
    const tunnelCells = new Set();
    for (let y = 0; y < height; y++) {
        const cellLeft = cells[`0,${y}`];
        const cellRight = cells[`${width - 1},${y}`];

        if (cellLeft && cellLeft.passages.includes('W')) {
            tunnelCells.add(`0,${y}`);
        }
        if (cellRight && cellRight.passages.includes('E')) {
            tunnelCells.add(`${width - 1},${y}`);
        }
    }

    // Draw cells
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cellKey = `${x},${y}`;
            const cell = cells[cellKey];

            if (!cell) continue;

            const isGhost = cell.is_ghost_house;
            const isTunnel = tunnelCells.has(cellKey);
            const px = x * cellSize;
            const py = y * cellSize;

            // Cell fill color
            let cellColor = CONFIG.COLORS.passage;
            if (isGhost) {
                cellColor = 'rgba(255, 0, 0, 0.3)';
            } else if (isTunnel) {
                cellColor = 'rgba(255, 184, 255, 0.3)';
            }

            context.fillStyle = cellColor;
            context.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

            // Draw walls with classic Pac-Man style
            drawCellWalls(context, cell, x, y, cellSize);

            // Draw pellets if enabled
            if (showPellets && !isGhost) {
                drawPellet(context, px + cellSize / 2, py + cellSize / 2);
            }
        }
    }
}

function drawCellWalls(context, cell, x, y, cellSize) {
    const px = x * cellSize;
    const py = y * cellSize;
    const wallWidth = 2;

    context.strokeStyle = CONFIG.COLORS.wall;
    context.lineWidth = wallWidth;
    context.lineCap = 'round';

    // North wall
    if (!cell.passages.includes('N')) {
        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(px + cellSize, py);
        context.stroke();
    }

    // South wall
    if (!cell.passages.includes('S')) {
        context.beginPath();
        context.moveTo(px, py + cellSize);
        context.lineTo(px + cellSize, py + cellSize);
        context.stroke();
    }

    // East wall
    if (!cell.passages.includes('E')) {
        context.beginPath();
        context.moveTo(px + cellSize, py);
        context.lineTo(px + cellSize, py + cellSize);
        context.stroke();
    }

    // West wall
    if (!cell.passages.includes('W')) {
        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(px, py + cellSize);
        context.stroke();
    }
}

function drawPellet(context, x, y, isPower = false) {
    context.beginPath();
    context.arc(x, y, isPower ? 6 : 2, 0, Math.PI * 2);
    context.fillStyle = isPower ? CONFIG.COLORS.powerPellet : CONFIG.COLORS.pellet;
    context.fill();
}

function updateMazeInfo(mazeData) {
    const metadata = mazeData.metadata;
    const cellCount = Object.keys(mazeData.cells).length;

    const dimensions = document.getElementById('infoDimensions');
    const type = document.getElementById('infoType');
    const cells = document.getElementById('infoCells');
    const tunnels = document.getElementById('infoTunnels');

    if (dimensions) dimensions.textContent = `${metadata.width} × ${metadata.height}`;
    if (type) type.textContent = metadata.type || 'Braid Maze';
    if (cells) cells.textContent = cellCount;
    if (tunnels) tunnels.textContent = metadata.has_warp_tunnels ? 'ENABLED' : 'DISABLED';
}

// ============ SAVE MAZE ============
async function saveMaze() {
    if (!state.currentMaze) {
        showNotification('No maze to save', 'error');
        return;
    }

    // Get custom name if provided
    const customNameInput = document.getElementById('mazeName');
    const customName = customNameInput?.value.trim() || null;

    try {
        const response = await axios.post('/api/mazes/save', {
            name: customName
        });

        if (response.data.success) {
            showNotification(`Saved: ${response.data.name}`, 'success');
            if (customNameInput) customNameInput.value = '';
            loadGallery();
        }
    } catch (error) {
        if (error.response?.status === 503) {
            showNotification('Database not configured', 'error');
        } else {
            showNotification('Save failed', 'error');
        }
        console.error('Save error:', error);
    }
}

// ============ GALLERY ============
function setupGallery() {
    document.getElementById('refreshGalleryBtn')?.addEventListener('click', loadGallery);
    document.getElementById('prevPageBtn')?.addEventListener('click', prevPage);
    document.getElementById('nextPageBtn')?.addEventListener('click', nextPage);
}

async function loadGallery() {
    const gallery = document.getElementById('mazeGallery');
    if (!gallery) return;

    gallery.innerHTML = `
        <div class="empty-state">
            <div class="loading-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;

    try {
        const response = await axios.get('/api/mazes', {
            params: {
                limit: CONFIG.GALLERY_LIMIT,
                offset: state.gallery.offset,
                sort: 'newest'
            }
        });

        const data = response.data;
        state.gallery.total = data.total;

        if (data.mazes.length === 0) {
            gallery.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👻</div>
                    <div class="empty-state-text">No saved mazes</div>
                    <div class="empty-state-hint">Generate and save a maze to see it here</div>
                </div>
            `;
        } else {
            gallery.innerHTML = data.mazes.map(maze => `
                <div class="maze-card" onclick="loadMazeFromGallery('${maze._id}')">
                    <div class="maze-card-preview">
                        <canvas id="preview-${maze._id}" width="100" height="100"></canvas>
                    </div>
                    <div class="maze-card-name">${escapeHtml(maze.name)}</div>
                    <div class="maze-card-info">${maze.metadata.width} × ${maze.metadata.height}</div>
                    <div class="maze-card-date">${formatDate(maze.created_at)}</div>
                    <div class="maze-card-actions">
                        <button class="btn btn-secondary" onclick="event.stopPropagation(); loadMazeFromGallery('${maze._id}')">
                            LOAD
                        </button>
                        <button class="btn btn-danger" onclick="event.stopPropagation(); deleteMaze('${maze._id}')">
                            DELETE
                        </button>
                    </div>
                </div>
            `).join('');

            // Draw previews (simplified)
            data.mazes.forEach(maze => {
                drawMiniPreview(maze._id, maze);
            });
        }

        updatePagination();
    } catch (error) {
        if (error.response?.status === 503) {
            gallery.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔌</div>
                    <div class="empty-state-text">Database not configured</div>
                </div>
            `;
        } else {
            gallery.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <div class="empty-state-text">Failed to load gallery</div>
                </div>
            `;
        }
        console.error('Gallery error:', error);
    }
}

function drawMiniPreview(mazeId, mazeData) {
    const previewCanvas = document.getElementById(`preview-${mazeId}`);
    if (!previewCanvas || !mazeData.cells) return;

    const previewCtx = previewCanvas.getContext('2d');
    const width = mazeData.metadata.width;
    const height = mazeData.metadata.height;
    const cellSize = Math.min(100 / width, 100 / height);

    previewCanvas.width = width * cellSize;
    previewCanvas.height = height * cellSize;

    // Simplified preview
    previewCtx.fillStyle = '#000';
    previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

    for (const [key, cell] of Object.entries(mazeData.cells)) {
        const [x, y] = key.split(',').map(Number);

        previewCtx.strokeStyle = CONFIG.COLORS.wall;
        previewCtx.lineWidth = 1;

        const px = x * cellSize;
        const py = y * cellSize;

        if (!cell.passages.includes('N')) {
            previewCtx.beginPath();
            previewCtx.moveTo(px, py);
            previewCtx.lineTo(px + cellSize, py);
            previewCtx.stroke();
        }
        if (!cell.passages.includes('S')) {
            previewCtx.beginPath();
            previewCtx.moveTo(px, py + cellSize);
            previewCtx.lineTo(px + cellSize, py + cellSize);
            previewCtx.stroke();
        }
        if (!cell.passages.includes('E')) {
            previewCtx.beginPath();
            previewCtx.moveTo(px + cellSize, py);
            previewCtx.lineTo(px + cellSize, py + cellSize);
            previewCtx.stroke();
        }
        if (!cell.passages.includes('W')) {
            previewCtx.beginPath();
            previewCtx.moveTo(px, py);
            previewCtx.lineTo(px, py + cellSize);
            previewCtx.stroke();
        }
    }
}

async function loadMazeFromGallery(mazeId) {
    showLoading(true);

    try {
        const response = await axios.post(`/api/mazes/${mazeId}/load`);

        if (response.data.success) {
            state.currentMaze = response.data.maze;
            const width = state.currentMaze.metadata.width;
            const height = state.currentMaze.metadata.height;

            // Update inputs
            const widthInput = document.getElementById('mazeWidth');
            const heightInput = document.getElementById('mazeHeight');
            if (widthInput) widthInput.value = width;
            if (heightInput) heightInput.value = height;

            // Switch to generate tab and draw
            switchTab('generate');
            resizeCanvas(canvas, width, height);
            drawMaze(ctx, state.currentMaze);
            updateMazeInfo(state.currentMaze);

            showNotification(`Loaded: ${response.data.loaded_from}`, 'success');
        }
    } catch (error) {
        showNotification('Failed to load maze', 'error');
        console.error('Load error:', error);
    } finally {
        showLoading(false);
    }
}

async function deleteMaze(mazeId) {
    if (!confirm('Delete this maze?')) return;

    try {
        await axios.delete(`/api/mazes/${mazeId}`);
        showNotification('Maze deleted', 'success');
        loadGallery();
    } catch (error) {
        showNotification('Delete failed', 'error');
        console.error('Delete error:', error);
    }
}

function updatePagination() {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');

    const currentPage = Math.floor(state.gallery.offset / CONFIG.GALLERY_LIMIT) + 1;
    const totalPages = Math.ceil(state.gallery.total / CONFIG.GALLERY_LIMIT) || 1;

    if (prevBtn) prevBtn.disabled = state.gallery.offset === 0;
    if (nextBtn) nextBtn.disabled = state.gallery.offset + CONFIG.GALLERY_LIMIT >= state.gallery.total;
    if (pageInfo) pageInfo.textContent = `PAGE ${currentPage} / ${totalPages}`;
}

function prevPage() {
    state.gallery.offset = Math.max(0, state.gallery.offset - CONFIG.GALLERY_LIMIT);
    loadGallery();
}

function nextPage() {
    if (state.gallery.offset + CONFIG.GALLERY_LIMIT < state.gallery.total) {
        state.gallery.offset += CONFIG.GALLERY_LIMIT;
        loadGallery();
    }
}

// ============ GAME MODE ============
let gameEngine = null;
let isRecordingGame = false;

function setupGame() {
    // Keyboard controls handled by game engine
    document.addEventListener('keydown', handleGameInput);
    document.addEventListener('keyup', handleGameInputKeyUp);
}

function initGame() {
    console.log('initGame called, currentMaze:', !!state.currentMaze);

    if (!state.currentMaze) {
        showNotification('Generate a maze first!', 'error');
        return;
    }

    // Clean up previous game engine
    if (gameEngine) {
        gameEngine.stop();
    }

    // Make sure the canvas can receive focus
    if (gameCanvas) {
        gameCanvas.setAttribute('tabindex', '0');
        gameCanvas.focus();
    }

    // Create new game engine
    console.log('Creating GameEngine with maze:', state.currentMaze);
    gameEngine = new GameEngine(gameCanvas, state.currentMaze);
    console.log('GameEngine created:', !!gameEngine);

    // Set callbacks
    gameEngine.onScoreChange = (score) => {
        updateGameStats();
        state.game.score = score;
    };

    gameEngine.onLivesChange = (lives) => {
        updateGameStats();
        state.game.lives = lives;
    };

    gameEngine.onTimeUpdate = (seconds) => {
        const timerEl = document.getElementById('gameTimer');
        if (timerEl) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    };

    gameEngine.onGameOver = (score, level) => {
        const overlay = document.getElementById('gameOverlay');
        const title = overlay?.querySelector('.game-overlay-title');
        const subtitle = overlay?.querySelector('.game-overlay-subtitle');

        if (overlay) {
            overlay.classList.remove('hidden');
            if (title) title.textContent = 'GAME OVER';
            if (subtitle) subtitle.textContent = `Score: ${score} | Level: ${level}`;
        }

        // Stop recording if active
        if (isRecordingGame) {
            stopRecordingGame();
        }
    };

    gameEngine.onLevelComplete = (level, score) => {
        showNotification(`Level ${level} Complete! Score: ${score}`, 'success');

        setTimeout(() => {
            gameEngine.nextLevel();
        }, 2000);
    };

    // Reset game state
    state.game.score = 0;
    state.game.lives = 3;
    state.game.isPlaying = false;

    updateGameStats();

    // Draw initial state
    gameEngine.draw();

    // Show ready overlay
    const overlay = document.getElementById('gameOverlay');
    const title = overlay?.querySelector('.game-overlay-title');
    const subtitle = overlay?.querySelector('.game-overlay-subtitle');

    if (overlay) {
        overlay.classList.remove('hidden');
        if (title) title.textContent = 'READY!';
        if (subtitle) subtitle.textContent = 'Press SPACE or ENTER to start';
    }
}

function handleGameInput(e) {
    if (state.currentTab !== 'play') return;

    const key = e.key;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(key)) {
        e.preventDefault();

        // Initialize game if needed
        if (!gameEngine) {
            initGame();
        }

        // Start game if not playing
        if (!state.game.isPlaying && gameEngine) {
            startGame();
        }

        // Pass input to game engine
        if (gameEngine) {
            gameEngine.handleKeyDown(key);
        }
    }

    if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        if (!gameEngine) {
            initGame();
        }
        if (!state.game.isPlaying && gameEngine) {
            startGame();
        } else if (gameEngine) {
            gameEngine.handleKeyDown(key);
        }
    }

    if (key === 'Escape' || key === 'p' || key === 'P') {
        e.preventDefault();
        if (gameEngine) {
            gameEngine.handleKeyDown(key);
        }
    }
}

function handleGameInputKeyUp(e) {
    if (state.currentTab !== 'play') return;
    if (!gameEngine) return;

    const key = e.key;

    // Stop Pacman movement when arrow key is released
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(key)) {
        e.preventDefault();
        gameEngine.handleKeyUp(key);
    }
}

function startGame() {
    console.log('startGame called, gameEngine:', !!gameEngine);

    if (!gameEngine) {
        initGame();
        return;
    }

    state.game.isPlaying = true;
    const overlay = document.getElementById('gameOverlay');
    if (overlay) overlay.classList.add('hidden');

    console.log('Calling gameEngine.start()');
    gameEngine.start();
    showNotification('Game started! Use arrow keys to move', 'success');
}

function pauseGame() {
    if (gameEngine) {
        gameEngine.pause();
        state.game.isPlaying = false;

        const overlay = document.getElementById('gameOverlay');
        const title = overlay?.querySelector('.game-overlay-title');
        const subtitle = overlay?.querySelector('.game-overlay-subtitle');

        if (overlay) {
            overlay.classList.remove('hidden');
            if (title) title.textContent = 'PAUSED';
            if (subtitle) subtitle.textContent = 'Press SPACE to resume';
        }
    }
}

function restartGame() {
    if (gameEngine) {
        gameEngine.stop();
    }
    initGame();
}

// ============ GAME RECORDING ============
function startRecordingGame() {
    if (!gameEngine) {
        showNotification('Start a game first!', 'error');
        return;
    }

    isRecordingGame = true;
    gameEngine.startRecording();

    const recordBtn = document.getElementById('recordBtn');
    if (recordBtn) {
        recordBtn.classList.add('recording');
        recordBtn.textContent = 'STOP REC';
    }

    showNotification('Recording started', 'success');
}

function stopRecordingGame() {
    if (!gameEngine || !isRecordingGame) return;

    const recordingData = gameEngine.stopRecording();
    isRecordingGame = false;

    const recordBtn = document.getElementById('recordBtn');
    if (recordBtn) {
        recordBtn.classList.remove('recording');
        recordBtn.textContent = 'RECORD';
    }

    if (recordingData) {
        // Save recording to localStorage or download
        const recordingJson = JSON.stringify(recordingData);
        localStorage.setItem('lastGameRecording', recordingJson);

        showNotification(`Recording saved! ${recordingData.frames.length} frames`, 'success');
    }
}

function toggleRecording() {
    if (isRecordingGame) {
        stopRecordingGame();
    } else {
        startRecordingGame();
    }
}

function playLastRecording() {
    const recordingJson = localStorage.getItem('lastGameRecording');
    if (!recordingJson) {
        showNotification('No recording found', 'error');
        return;
    }

    try {
        const recordingData = JSON.parse(recordingJson);

        if (!gameEngine) {
            initGame();
        }

        gameEngine.loadReplay(recordingData);
        gameEngine.startReplay();

        showNotification('Playing recording...', 'success');
    } catch (error) {
        showNotification('Failed to load recording', 'error');
        console.error('Recording error:', error);
    }
}

function downloadRecording() {
    const recordingJson = localStorage.getItem('lastGameRecording');
    if (!recordingJson) {
        showNotification('No recording to download', 'error');
        return;
    }

    const blob = new Blob([recordingJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pacman-recording-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Recording downloaded', 'success');
}

function updateGameStats() {
    const scoreEl = document.getElementById('gameScore');
    const livesEl = document.getElementById('gameLives');
    const levelEl = document.getElementById('gameLevel');

    const score = gameEngine ? gameEngine.score : state.game.score;
    const lives = gameEngine ? gameEngine.lives : state.game.lives;
    const level = gameEngine ? gameEngine.level : state.game.level;

    if (scoreEl) scoreEl.textContent = score.toString().padStart(6, '0');
    if (livesEl) livesEl.textContent = '\u25CF'.repeat(lives);
    if (levelEl) levelEl.textContent = level;
}

// ============ UTILITIES ============
function showLoading(show) {
    const loading = document.getElementById('loadingIndicator');
    if (loading) {
        loading.classList.toggle('show', show);
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type}`;

    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ ALGORITHM SELECTION ============
let currentAlgorithm = 'BFS';

const algorithmDescriptions = {
    'GREEDY': '<strong style="color: #ff6600;">GREEDY:</strong> Only looks 1 step ahead. Picks direction closest to target. Very fast (O(1)) but can get stuck in dead ends. Original Pac-Man behavior.',
    'BFS': '<strong style="color: #00ff00;">BFS (Breadth-First Search):</strong> Explores all paths level by level using a queue (FIFO). Guarantees shortest path but explores more nodes. Time: O(V+E)',
    'ASTAR': '<strong style="color: #00ffff;">A* (A-Star):</strong> Uses heuristic (Manhattan distance) to guide search. f(n) = g(n) + h(n). Optimal AND efficient - best of both worlds. Time: O(E log V)'
};

function setAlgorithm(algo) {
    currentAlgorithm = algo;
    
    // Update the global variable in game-engine.js
    if (typeof window.PATHFINDING_ALGORITHM !== 'undefined') {
        window.PATHFINDING_ALGORITHM = algo;
    }
    
    // Update button styles
    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.classList.remove('algo-active');
    });
    
    const activeBtn = document.getElementById('algo' + algo.charAt(0) + algo.slice(1).toLowerCase().replace('star', 'Star'));
    if (algo === 'GREEDY') document.getElementById('algoGreedy').classList.add('algo-active');
    if (algo === 'BFS') document.getElementById('algoBFS').classList.add('algo-active');
    if (algo === 'ASTAR') document.getElementById('algoAStar').classList.add('algo-active');
    
    // Update description
    const descEl = document.getElementById('algoDescription');
    if (descEl) {
        descEl.innerHTML = algorithmDescriptions[algo];
    }
    
    // Reset stats when switching
    if (typeof AlgorithmStats !== 'undefined') {
        AlgorithmStats.reset();
    }
    
    // Update stats display
    updateAlgorithmStats();
    
    showNotification(`Ghost AI switched to ${algo}`, 'success');
    
    // If game is running, ghosts will use the new algorithm on next decision
    console.log(`🧠 Algorithm changed to: ${algo}`);
}

function updateAlgorithmStats() {
    const statsEl = document.getElementById('algoStats');
    if (!statsEl) return;
    
    if (typeof AlgorithmStats === 'undefined') {
        statsEl.textContent = 'Stats not available';
        return;
    }
    
    const stats = AlgorithmStats[currentAlgorithm.toLowerCase()];
    if (!stats || stats.totalCalls === 0) {
        statsEl.innerHTML = `<span style="color: #888;">Waiting for data... Play the game to see ${currentAlgorithm} performance stats.</span>`;
        return;
    }
    
    const avgNodes = (stats.totalNodesExplored / stats.totalCalls).toFixed(1);
    const avgPath = stats.pathsFound > 0 ? (stats.totalPathLength / stats.pathsFound).toFixed(1) : 0;
    const avgTime = (stats.totalTimeMs / stats.totalCalls).toFixed(4);
    const successRate = ((stats.pathsFound / stats.totalCalls) * 100).toFixed(0);
    
    statsEl.innerHTML = `
        <span style="color: #ffff00;">Calls:</span> ${stats.totalCalls} | 
        <span style="color: #00ff00;">Avg Nodes:</span> ${avgNodes} | 
        <span style="color: #00ffff;">Avg Path:</span> ${avgPath} | 
        <span style="color: #ff00ff;">Avg Time:</span> ${avgTime}ms | 
        <span style="color: #ff6600;">Success:</span> ${successRate}%
    `;
}

// Update stats display every 2 seconds
setInterval(updateAlgorithmStats, 2000);

// ============ EXPORT FOR GLOBAL ACCESS ============
window.loadMazeFromGallery = loadMazeFromGallery;
window.deleteMaze = deleteMaze;
window.startGame = startGame;
window.pauseGame = pauseGame;
window.restartGame = restartGame;
window.toggleRecording = toggleRecording;
window.playLastRecording = playLastRecording;
window.downloadRecording = downloadRecording;
window.setAlgorithm = setAlgorithm;

// ============ START ============
document.addEventListener('DOMContentLoaded', init);
