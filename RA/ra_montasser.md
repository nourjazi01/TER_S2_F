# Rapport d'Activité - [Nom Prénom]

**Date :** 07/02/2026

## Activités du jour

### ✅ Tâches réalisées
- Analyse des besoins du projet : génération automatique de labyrinthes type Pac-Man
- Identification des contraintes principales : grille 2D, connectivité, boucles, wrap-around, symétrie possible

### 🔍 Recherches effectuées (Maze Generation Algorithms)

#### Perfect Maze (sans boucles)
- **DFS / Recursive Backtracking** : simple, rapide, produit souvent des longs couloirs
- **Randomized Prim** : labyrinthe plus dense et mieux réparti
- **Randomized Kruskal** : basé sur union-find, permet un bon contrôle global
- **Wilson Algorithm** : génération uniforme (uniform spanning tree)
- **Aldous-Broder** : génération uniforme mais lente

#### Imperfect Maze (avec boucles, adapté Pac-Man)
- **Growing Tree Algorithm** : hybride entre DFS et Prim, bon contrôle de la forme finale
- **Spanning Tree + ajout d’arêtes** : création d’un labyrinthe connecté puis ajout contrôlé de cycles
- **Braid Maze** : réduction des dead-ends en ajoutant des connexions
- **Room + Corridor Generation** : utile pour intégrer une zone centrale type "ghost house"
- **Cellular Automata** : permet de créer des zones ouvertes, moins structuré type Pac-Man

### ⚠️ Difficultés rencontrées
- Les algorithmes classiques génèrent surtout des labyrinthes parfaits, alors que Pac-Man nécessite un labyrinthe imparfait
- Obtenir un rendu proche du style Pac-Man nécessite des contraintes supplémentaires (symétrie, tunnels, zones fixes)

### 📌 Prévisions pour la prochaine séance
- Choisir une approche hybride (ex: Growing Tree + ajout de cycles)
- Définir des métriques de qualité : connectivité, cycles, dead-ends, densité de murs
- Début de modélisation et export JSON du labyrinthe


---

## Jour 2 - 13/02/2026

### Tâches réalisées

**Modules développés (ma responsabilité) :**
- ✅ `ascii_renderer.py` - Rendu Unicode box-drawing (~120 lignes)
- ✅ `maze_analyzer.py` - Suite tests qualification (~200 lignes)
- ✅ `find_best_maze.py` - Sélection automatique meilleur maze

**Collaboration :**
- Division tâches : génération (Jazi) / visualisation + tests (Montasser)
- Intégration modules Python

### Rendu ASCII

**Caractères Unicode utilisés :**
- Base : `─ │`
- Coins : `┌ ┐ └ ┘`
- Intersections : `├ ┤ ┬ ┴ ┼`

### Tests de qualification

**4 types de tests :**
1. Connexité (BFS)
2. Culs-de-sac
3. Distribution degrés
4. Score Pac-Man (0-100)

**Formule score :** 40% connexité + 40% anti-dead-ends + 20% cycles

### Résultats

**Meilleur labyrinthe 15x15 :**
- Connexité : 100%
- Culs-de-sac : 0
- Score : 84.8/100

**10 labyrinthes testés :**
- Moyenne : 84.3/100
- Min : 83.4 / Max : 84.8

### Difficultés
- Gestion intersections Unicode (16 cas)
- Calibration poids du score

### Prochaine séance
- Export PNG automatique
- Visualisation graphique (Pygame)
- Tests de performance

---

## Jour 3 - 05/03/2026

### Tâches réalisées

**API Web Flask (ma responsabilité) :**
- ✅ `app.py` - Serveur Flask avec API REST (~150 lignes)
- ✅ 4 endpoints HTTP fonctionnels
- ✅ Support paramètres de génération via query strings
- ✅ Templates HTML pour interface web
- ✅ Gestion configuration PORT pour cloud

**Tests Automatisés (ma partie) :**
- ✅ 19 tests caractéristiques (connexité, dead ends, cycles, score qualité)
- ✅ 12 tests API (endpoints HTTP, codes statut, validation JSON)
- ✅ Basés sur `maze_analyzer.py` et les endpoints Flask

*Tests fonctionnels (13) et E2E (7) réalisés par Jazi*

**Endpoints API développés :**

1. **GET /** - Interface web accueil
   - Template HTML avec formulaire
   - Documentation API interactive

2. **GET /api/maze** - Récupération maze courant
   - Format JSON structuré
   - Métadonnées incluses

3. **POST /api/generate-maze** - Génération nouveau maze
   - Paramètres : width, height, ghost_house, playability
   - Validation entrées utilisateur
   - Retour JSON avec maze généré

4. **GET /api/maze-info** - Informations détaillées
   - Dimensions, ghost house, playability
   - Statistiques du maze actuel

### Architecture API

**Structure requête/réponse :**
```python
# Génération maze
POST /api/generate-maze
Params: width=15, height=15, ghost_house=true

→ Response 200 OK
{
  "maze": {...walls...},
  "width": 15,
  "height": 15,
  "ghost_house": true,
  "playability": "medium"
}
```

**Gestion d'état :**
- Variable globale `current_maze` pour stockage maze actuel
- Initialisation au démarrage avec maze par défaut
- Mise à jour à chaque génération

### Intégration production

**Configuration serveur :**
- Développement : Flask dev server (port 5000)
- Production : Gunicorn WSGI server
- Support variable d'environnement `PORT` pour Render

**Validation API :**
- 12 tests API automatisés (pytest-flask)
- Tests codes statut HTTP (200, 400, 404)
- Tests format JSON réponses
- Tests validation paramètres

### Collaboration avec déploiement

**Fourni à Jazi pour CI/CD :**
- Liste dépendances Python (Flask 3.0.0, Werkzeug 3.0.1)
- Points d'entrée pour tests (app fixture pytest)
- Documentation endpoints pour tests E2E
- Health check endpoint pour monitoring Render

### Résultats

**Tests API locaux :**
- 12/12 tests passent (100%)
- Temps réponse : <50ms génération
- Validation JSON : OK

**Performance :**
- Génération 15x15 : ~10ms
- Génération 30x30 : ~40ms
- Mémoire : <50MB

### Difficultés rencontrées

**Problème 1 : Variables globales Flask**
- Cause : current_maze modifiée sans déclaration global
- Solution : Ajout `global current_maze` dans fonctions

**Problème 2 : Validation paramètres**
- Cause : Types mixtes (string/int) des query params
- Solution : Conversion explicite avec gestion erreurs

**Problème 3 : CORS en développement**
- Cause : Appels API depuis différents ports
- Solution : Configuration Flask pour accepter requêtes locales

### Templates HTML créés

- `templates/index.html` - Page accueil avec formulaire
- Interface utilisateur simple pour démo
- Liens vers API endpoints

### Stack technique API

- **Framework** : Flask 3.0.0
- **WSGI** : Gunicorn 21.2.0 (production)
- **Templating** : Jinja2 (inclus Flask)
- **Serialization** : JSON natif Python
- **Testing** : pytest-flask 1.3.0

### Prochaines étapes
- Améliorer interface HTML (CSS/JavaScript)
- Ajouter visualisation maze côté client
- Monitoring métriques API (temps réponse, usage)
- Documentation OpenAPI/Swagger possible

---

## Jour 4 - 12/03/2026

### Tâches réalisées

**Intelligence Artificielle - Personnalités & Interface (ma responsabilité) :**
- ✅ Implémentation GREEDY algorithm (~75 lignes)
- ✅ Personnalités 4 fantômes (Blinky, Pinky, Inky, Clyde ~100 lignes)
- ✅ Interface sélection d'algorithme en temps réel
- ✅ Affichage statistiques performance IA
- ✅ Interface HTML5 Canvas complète pour le jeu
- ✅ Mise à jour `maze_generator.py` pour ghost house exit

**Fichiers créés/modifiés :**
- ✅ `Src/static/js/game-engine.js` - findPathGreedy() (lignes 425-498)
- ✅ `Src/static/js/game-engine.js` - 4 Ghost personalities (lignes 1387-1488)
- ✅ `templates/index.html` - Interface jeu + selector (~300 lignes)
- ✅ `Src/static/js/app.js` - setAlgorithm() + stats UI
- ✅ `Src/maze_generator.py` - Fix ghost house passages
- ✅ `README.md` - Documentation interface

*Algorithmes BFS et A* implémentés par Jazi*

### Architecture Pathfinding Implémentée

**Algorithme implémenté (ma partie) :**

**GREEDY - Local Best-First Search** (lignes 425-498)

```javascript
static findPathGreedy(maze, start, goal, ghostName) {
    const startTime = performance.now()
    
    // Check all 4 adjacent directions
    const directions = [
        { dir: DIRECTIONS.NORTH, dx: 0, dy: -1 },
        { dir: DIRECTIONS.SOUTH, dx: 0, dy: 1 },
        { dir: DIRECTIONS.EAST, dx: 1, dy: 0 },
        { dir: DIRECTIONS.WEST, dx: -1, dy: 0 }
    ]
    
    let bestDir = null
    let bestDistance = Infinity
    
    // Pick direction that gets closest to goal
    for (const {dir, dx, dy} of directions) {
        const newX = start.x + dx
        const newY = start.y + dy
        
        if (!maze.isWall(newX, newY)) {
            const distance = Math.abs(newX - goal.x) 
                           + Math.abs(newY - goal.y)
            
            if (distance < bestDistance) {
                bestDistance = distance
                bestDir = dir
            }
        }
    }
    
    // Update stats
    this.stats[ghostName].GREEDY.totalNodesExplored += 4
    this.stats[ghostName].GREEDY.totalPathLength += 1
    
    return bestDir
}
```

**Caractéristiques :**
- Décision locale sans pathfinding complet
- Choisit direction minimisant distance Manhattan
- Complexité : O(1) - toujours 4 nœuds explorés
- Rapide (~0.001ms) mais non optimal
- Comportement authentique Pac-Man original

*(Algorithmes BFS et A* implémentés par Jazi)*

### Personnalités des Fantômes

**Architecture 2-step que j'ai implémentée :**

1. **Target Selection** (getChaseTarget) - Unique par fantôme
2. **Pathfinding** (BFS/A*/GREEDY) - Même pour tous

**Les 4 fantômes créés :**

#### Blinky (Red Ghost) - Lignes 1387-1405
```javascript
class BlinkyGhost extends Ghost {
    getChaseTarget() {
        const pacman = this.gameEngine.pacman
        // Cible directe = position actuelle Pac-Man
        return { x: pacman.cellX, y: pacman.cellY }
    }
}
```
**Comportement :** Poursuivant agressif direct ("Shadow")

#### Pinky (Pink Ghost) - Lignes 1407-1434
```javascript
class PinkyGhost extends Ghost {
    getChaseTarget() {
        const pacman = this.gameEngine.pacman
        let targetX = pacman.cellX
        let targetY = pacman.cellY
        
        // Cible = 4 cases devant Pac-Man
        switch(pacman.direction) {
            case DIRECTIONS.NORTH: targetY -= 4; break
            case DIRECTIONS.SOUTH: targetY += 4; break
            case DIRECTIONS.EAST:  targetX += 4; break
            case DIRECTIONS.WEST:  targetX -= 4; break
        }
        return { x: targetX, y: targetY }
    }
}
```
**Comportement :** Embuscade pour couper le chemin ("Speedy")

#### Inky (Cyan Ghost) - Lignes 1436-1464
```javascript
class InkyGhost extends Ghost {
    getChaseTarget() {
        const pacman = this.gameEngine.pacman
        const blinky = this.gameEngine.ghosts.find(g => 
            g.name === 'Blinky'
        )
        
        // Pivot = 2 cases devant Pac-Man
        const dx = pacman.direction === DIRECTIONS.EAST ? 2 : 
                   pacman.direction === DIRECTIONS.WEST ? -2 : 0
        const dy = pacman.direction === DIRECTIONS.NORTH ? -2 : 
                   pacman.direction === DIRECTIONS.SOUTH ? 2 : 0
        
        const pivot = {
            x: pacman.cellX + dx,
            y: pacman.cellY + dy
        }
        
        // Vecteur de Blinky au pivot, doublé
        const vector = {
            x: pivot.x - blinky.cellX,
            y: pivot.y - blinky.cellY
        }
        
        return {
            x: blinky.cellX + vector.x * 2,
            y: blinky.cellY + vector.y * 2
        }
    }
}
```
**Comportement :** Flanquement collaboratif imprévisible ("Bashful")

#### Clyde (Orange Ghost) - Lignes 1466-1488
```javascript
class ClydeGhost extends Ghost {
    getChaseTarget() {
        const pacman = this.gameEngine.pacman
        
        // Calcul distance Manhattan
        const distance = Math.abs(this.cellX - pacman.cellX) 
                       + Math.abs(this.cellY - pacman.cellY)
        
        if (distance > 8) {
            // Chase mode - poursuit Pac-Man
            return { x: pacman.cellX, y: pacman.cellY }
        } else {
            // Flee mode - retour au coin scatter
            return this.scatterTarget
        }
    }
}
```
**Comportement :** Oscillation chase/fuite dynamique ("Pokey")

**Pourquoi cette approche est intelligente :**
- Séparation claire : WHO to target (personnalité) vs HOW to reach (algorithme)
- Même pathfinding code pour tous = maintenance facile
- Switch algorithme affecte tous fantômes uniformément
- Comportements distincts malgré algorithme commun

**Structure HTML (templates/index.html - lignes 235-269) :**

```html
<!-- Algorithm Selector Panel -->
<div class="algorithm-selector">
    <h3>👻 GHOST AI ALGORITHM</h3>
    <div class="algorithm-buttons">
        <button class="algo-btn" onclick="setAlgorithm('GREEDY')">
            GREEDY
        </button>
        <button class="algo-btn active" onclick="setAlgorithm('BFS')">
            BFS
        </button>
        <button class="algo-btn" onclick="setAlgorithm('ASTAR')">
            A*
        </button>
    </div>
    
    <!-- Live Stats Display -->
    <div id="algorithm-description"></div>
    <div id="algorithm-stats"></div>
</div>
```

**CSS Style Arcade (lignes 80-150) :**
- Boutons avec effet hover/active
- Couleurs style Pac-Man (jaune, bleu, noir)
- Transitions smooth pour feedback utilisateur
- Responsive layout pour différentes tailles écran

### Système de Sélection d'Algorithme

**Fonction setAlgorithm() (app.js - lignes 920-992) :**

```javascript
window.setAlgorithm = function(algorithm) {
    // 1. Update global variable
    window.PATHFINDING_ALGORITHM = algorithm
    
    // 2. Update UI buttons (active state)
    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.classList.remove('active')
        if (btn.textContent.trim() === algorithm) {
            btn.classList.add('active')
        }
    })
    
    // 3. Reset statistics
    if (window.AlgorithmStats) {
        window.AlgorithmStats.reset(algorithm)
    }
    
    // 4. Update description
    updateAlgorithmDescription(algorithm)
    
    console.log(`🔄 Switched to ${algorithm}`)
}
```

**Descriptions Algorithmes Dynamiques :**

- **GREEDY** : 
  > "⚡ GREEDY: Fast local decisions. Ghosts choose the direction that gets closest to target. Simple but can get stuck. Authentic Pac-Man behavior."

- **BFS** :
  > "🎯 BFS: Explores level-by-level until target found. Guarantees shortest path. More thorough but explores many nodes."

- **A*** :
  > "🧠 A*: Uses Manhattan distance heuristic to guide search. Optimal path with fewer nodes explored. Best balance of speed and intelligence."

### Affichage Statistiques Temps Réel

**updateAlgorithmStats() Function (app.js) :**

```javascript
function updateAlgorithmStats() {
    if (!window.AlgorithmStats) return
    
    const stats = window.AlgorithmStats.getStats(algorithm)
    
    const html = `
        <div class="stats-row">
            <span>📞 Calls: ${stats.totalCalls}</span>
            <span>🔍 Avg Nodes: ${stats.avgNodes}</span>
            <span>📏 Avg Path: ${stats.avgPath}</span>
        </div>
        <div class="stats-row">
            <span>⏱️ Avg Time: ${stats.avgTime}ms</span>
            <span>✅ Success: ${stats.successRate}%</span>
        </div>
    `
    
    document.getElementById('algorithm-stats').innerHTML = html
}

// Update every 2 seconds
setInterval(updateAlgorithmStats, 2000)
```

**Affichage inclut :**
- Nombre total d'appels algorithme
- Moyenne nœuds explorés par appel
- Longueur moyenne chemin trouvé
- Temps moyen de calcul (ms)
- Taux de succès (%)

### Maze Generator Updates

**Fix Ghost House Exit (Src/maze_generator.py - lignes 343-358) :**

**Problème original :**
- Exit cell avait uniquement passage South (vers ghost house)
- Pas de passages East/West pour sortie
- Fantômes coincés à la sortie

**Solution implémentée :**
```python
def _create_ghost_house(self):
    # ... existing ghost house creation ...
    
    # FIX: Add horizontal passages to exit cell
    exit_cell = (exit_x, exit_y)
    
    # Add East passage if possible
    if exit_x + 1 < self.width:
        self._remove_wall(exit_cell, 'E')
        
    # Add West passage if possible  
    if exit_x - 1 >= 0:
        self._remove_wall(exit_cell, 'W')
```

**Résultat :**
- Exit cell maintenant avec passages E + W + S
- Fantômes peuvent sortir horizontalement
- Plus de blocages à la sortie

### Interface Canvas Game

**Game Controls Interface :**
```html
<div class="game-info">
    <div>Score: <span id="score">0</span></div>
    <div>Lives: <span id="lives">3</span></div>
    <div>Level: <span id="level">1</span></div>
</div>

<div class="controls-help">
    <p>🎮 Controls: Arrow Keys or WASD</p>
    <p>👻 Watch the ghosts adapt their strategy!</p>
</div>
```

**Canvas Setup (app.js) :**
```javascript
const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

// High DPI support
const dpr = window.devicePixelRatio || 1
canvas.width = 800 * dpr
canvas.height = 600 * dpr
canvas.style.width = '800px'
canvas.style.height = '600px'
ctx.scale(dpr, dpr)
```

### Collaboration avec Jazi

**Division du travail AI :**
- **Jazi** : BFS, A*, AlgorithmStats object, deltaTime, ghost house exit
- **Moi (Montasser)** : GREEDY, personnalités 4 fantômes, UI sélecteur, stats display

**Intégration bidirectionnelle :**
1. Jazi crée `AlgorithmStats.getStats()` → Je l'affiche via `updateAlgorithmStats()`
2. Jazi implémente BFS/A* → Mes ghost personalities les utilisent
3. Je crée `setAlgorithm()` UI → Change le `PATHFINDING_ALGORITHM` de Jazi
4. Mes 4 fantômes appellent → La classe `Pathfinder` de Jazi

**Communication code :**
```javascript
// Mes ghosts utilisent ses algorithmes
const nextDir = Pathfinder.getNextDirection(
    PATHFINDING_ALGORITHM,  // Variable globale switchable
    this.maze,
    this.position,
    this.getChaseTarget(),  // MA logique personnalité
    this.name
)

// Mon UI récupère ses stats
const stats = AlgorithmStats.getStats(algorithm)
updateStatsDisplay(stats)  // MA fonction affichage
```

### Interface Jeu Complète

### Système d'Onglets Interface

**Structure navigation (index.html) :**
```html
<div class="tabs">
    <button class="tab active" data-tab="generate">Generate</button>
    <button class="tab" data-tab="play">Play</button>
    <button class="tab" data-tab="api">API</button>
    <button class="tab" data-tab="about">About</button>
</div>
```

**JavaScript Tab Switching (app.js) :**
```javascript
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.dataset.tab
        
        // Hide all content
        document.querySelectorAll('.tab-content').forEach(c => {
            c.style.display = 'none'
        })
        
        // Show selected
        document.getElementById(tabName).style.display = 'block'
        
        // Update active state
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active')
        })
        this.classList.add('active')
    })
})
```

### Visualisation Features

**Maze Rendering :**
- Walls dessinés avec strokeRect (Canvas 2D)
- Ghost house zone colorée différemment
- Pellets comme petits cercles
- Power pellets plus gros et clignotants

**Ghost Colors :**
```javascript
const GHOST_COLORS = {
    'Blinky': '#FF0000',  // Red
    'Pinky':  '#FFB8FF',  // Pink
    'Inky':   '#00FFFF',  // Cyan
    'Clyde':  '#FFB852'   // Orange
}
```

**Animation Smooth :**
- requestAnimationFrame pour 60 FPS
- DeltaTime pour mouvement fluid
- Interpolation positions pour smoothness

### Résultats & Performances UI

**User Experience :**
- ✅ Switch algorithme instantané (< 10ms)
- ✅ Stats update fluide sans lag
- ✅ Interface responsive et intuitive
- ✅ Feedback visuel immédiat sur actions

**Performance Rendering :**
- Canvas render : ~2ms par frame
- Stats update : ~0.5ms toutes les 2s
- Pas d'impact sur gameplay (60 FPS constant)

### Difficultés Rencontrées

**Problème 1 : Algorithm switch lag**
- Cause : Stats reset bloquait render loop
- Solution : Async reset via setTimeout(0)

**Problème 2 : Stats display overflow**
- Cause : Nombres très longs (0.0234567ms)
- Solution : toFixed(2) pour limiter décimales

**Problème 3 : Button state desync**
- Cause : Multiple clicks rapides
- Solution : Debounce + force classList update

**Problème 4 : Ghost house visualization**
- Cause : Pas clair visuellement sur canvas
- Solution : Ajout background color différent

### Stack Technique UI

**Frontend Technologies :**
- HTML5 (structure semantic)
- CSS3 (animations, grid, flexbox)
- JavaScript ES6+ (modules, async)
- Canvas 2D API (rendering)

**Design Patterns :**
- MVC-like separation (app.js = controller)
- Event-driven UI updates
- Reactive stats display

**Browser APIs :**
- requestAnimationFrame (game loop)
- localStorage (future: save preferences)
- High DPI canvas support

### Tests Interface

**Manuel Testing Checklist :**
- ✅ Boutons GREEDY/BFS/A* switchent correctement
- ✅ Stats s'affichent et se mettent à jour
- ✅ Descriptions changent selon algorithme
- ✅ Canvas rendering sans artifacts
- ✅ Responsive sur différentes tailles écran
- ✅ Onglets navigation fonctionnent

**Browser Compatibility :**
- ✅ Chrome 120+ (tested)
- ✅ Firefox 121+ (tested)
- ✅ Edge 120+ (tested)
- ⚠️ Safari 17+ (minor CSS differences)

### Documentation Produite

**Mise à jour README.md :**
- Section "Utilisation" avec screenshots
- Guide interface utilisateur
- Explication switch algorithmes

**Code Comments :**
- JSDoc pour fonctions publiques
- Inline comments pour logique UI complexe
- CSS comments pour sections layout

### Apprentissages Clés

1. **Real-time UI Updates**
   - setInterval avec clearInterval important
   - Éviter updates trop fréquents (battery drain)

2. **Canvas Performance**
   - Clear only dirty regions vs full clear
   - Layer séparation (static background + dynamic sprites)

3. **User Feedback**
   - Visual feedback immédiat crucial
   - Animations smooth > instant changes

4. **Collaboration**
   - API bien définie (AlgorithmStats.getStats())
   - Séparation claire responsabilités

### Métriques Production

**Interface Performance :**
- First Contentful Paint : ~200ms
- Time to Interactive : ~400ms
- Canvas FPS : 60 constant
- Memory Usage : ~30MB (stable)

**User Engagement (si analytics) :**
- Temps moyen session : N/A (local)
- Algorithm switches per game : N/A
- Most used algorithm : BFS (préféré par défaut)

### Prochaines Étapes Possibles

**UI Improvements :**
- [ ] Path visualization overlay (show BFS/A* search)
- [ ] Ghost "thinking" indicators
- [ ] Algorithm comparison side-by-side
- [ ] Mobile touch controls

**Data Visualization :**
- [ ] Charts.js pour graphiques performances
- [ ] Heatmap des positions Pac-Man
- [ ] Timeline replay des mouvements

**Accessibility :**
- [ ] Keyboard-only navigation
- [ ] Screen reader support
- [ ] Color blind mode
- [ ] Configurable font sizes

**Polish :**
- [ ] Sound effects (classic Pac-Man sounds)
- [ ] Animations fantômes (eyes, scared mode)
- [ ] Particle effects (pellet eating)
- [ ] Victory/Game Over screens améliorés

