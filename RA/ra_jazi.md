# Rapport d'Activité - Jazi

## Jour 1 - 06/02/2026

### Tâches réalisées
- Mise en place de la structure du projet TER
- Analyse des contraintes pour labyrinthes type Pac-Man
- Identification des algorithmes adaptés

### Recherches effectuées

**Contraintes Pac-Man :**
- ❌ Aucun cul-de-sac
- ✅ Cycles multiples
- ✅ Graphe connexe

**Algorithmes recensés :**
1. **Braid Maze** (choisi) - DFS + suppression dead ends
2. Graph Minimum Degree ≥ 2
3. Loop-Erased Random Walk
4. Hybrid DFS + Forced Cycles

### Prochaine séance
- Implémenter Braid Maze
- Tester génération et validation

---

## Jour 2 - 13/02/2026

### Tâches réalisées

**Modules développés (ma responsabilité) :**
- ✅ `maze_generator.py` - Générateur Braid Maze (~200 lignes)
- ✅ `main.py` - Script principal avec CLI
- ✅ Export JSON structuré

**Collaboration :**
- Division tâches : génération (Jazi) / visualisation + tests (Montasser)
- Intégration modules via imports Python

### Algorithme Braid Maze

1. Génération parfaite (DFS)
2. Élimination des dead ends
3. Export JSON

**Structure données :**
```python
walls = {(x, y, direction): bool}  # N, S, E, W
```

### Résultats

**Test 12x12 :**
- Connexité : 100%
- Culs-de-sac : 0
- Score : 84.4/100

### Difficultés
- Gestion bidirectionnelle des murs → fonction `_remove_wall()`
- Degré moyen faible (2.22) → amélioration nécessaire

### Prochaine séance
- Optimiser degré moyen (objectif 2.5-3)
- Paramètres de contrôle de densité
- Explorer algorithmes alternatifs

---

## Jour 3 - 05/03/2026

### Tâches réalisées

**Déploiement Cloud (ma responsabilité) :**
- ✅ Configuration Render.com pour web service
- ✅ `render.yaml` - Configuration déploiement automatique
- ✅ Pipeline CI/CD complet avec GitHub Actions
- ✅ `.github/workflows/ci-cd.yml` - Workflow automatisation
- ✅ Documentation déploiement (`DEPLOYMENT.md`, `TESTING.md`)

**Tests Automatisés (ma partie) :**
- ✅ 13 tests fonctionnels (structure, dimensions, paramètres)
- ✅ 7 tests E2E (end-to-end sur API déployée)
- ✅ Configuration pytest avec coverage
- ✅ Scripts de test manuels (bash/PowerShell)

*Tests caractéristiques (19) et API (12) réalisés par Montasser*

**Intégration Continue :**
- ✅ Automatisation des tests sur chaque push
- ✅ Blocage déploiement si tests échouent
- ✅ Déploiement automatique sur Render après validation

### Architecture CI/CD

**Pipeline GitHub Actions :**
```yaml
1. Run Tests (pytest)
   → 44 tests core (functional + API + characteristics)
   → Coverage report
   
2. Deploy to Render (si tests OK)
   → Appel API Render
   → Déclenchement déploiement
   → Validation E2E sur API déployée
   
3. Test Failure Scenario (PR)
   → Démonstration blocage sur échec tests
```

**Fichiers de configuration :**
- `requirements.txt` - Dépendances Python (Flask, gunicorn, pytest)
- `render.yaml` - Config service web (build, start, health check)
- `.github/workflows/ci-cd.yml` - Pipeline automatisation
- `.gitignore` - Exclusions (venv, cache, outputs)

### Résultats

**Tests locaux :**
- 51/51 tests passent (100%)
- Coverage : modules core couverts
- Exécution : ~0.3s pour tests core

**CI/CD GitHub Actions :**
- ✅ Pipeline configuré et opérationnel
- ✅ Tests automatiques sur push
- ✅ Validation avant déploiement

**Documentation produite :**
1. `DEPLOYMENT.md` - Guide déploiement Render
2. `TESTING.md` - Guide utilisation tests
3. `TEST_SYNTHESIS.md` - Synthèse complète des tests

### Difficultés rencontrées

**Problème 1 : Tests API incompatibles**
- Cause : Méthodes MazeAnalyzer changées (find_dead_ends → analyze_dead_ends)
- Solution : Mise à jour 19 tests characteristics avec nouveaux noms

**Problème 2 : Tests E2E en CI**
- Cause : GitHub Actions n'a pas de serveur Flask actif
- Solution : Skip conditionnel si serveur non disponible

**Problème 3 : Variables globales Flask**
- Cause : UnboundLocalError sur current_maze
- Solution : Ajout déclarations `global current_maze`

### Stack technique déploiement

- **Serveur web** : Gunicorn (WSGI production)
- **Cloud** : Render.com (région Frankfurt)
- **CI/CD** : GitHub Actions
- **Tests** : Pytest + pytest-flask + requests
- **Monitoring** : Health check endpoint `/api/maze`

### Prochaines étapes
- Finaliser configuration Render avec secrets GitHub
- Tester déploiement automatique complet
- Démontrer blocage sur échec tests (requirement prof)
- Captures d'écran pour rapport final

---

## Jour 4 - 12/03/2026

### Tâches réalisées

**Intelligence Artificielle - Algorithmes Core (ma responsabilité) :**
- ✅ Implémentation BFS (Breadth-First Search) - Optimal (~100 lignes)
- ✅ Implémentation A* (A-Star) avec heuristique Manhattan (~140 lignes)
- ✅ Système de statistiques en temps réel (AlgorithmStats ~70 lignes)
- ✅ Optimisation moteur de jeu (deltaTime normalization)
- ✅ Système de timing décision (lastDecisionCell tracking)
- ✅ Système sortie ghost house (LEAVING_HOUSE mode)

**Fichiers modifiés/créés :**
- ✅ `Src/static/js/game-engine.js` - findPathBFS() (lignes 189-283)
- ✅ `Src/static/js/game-engine.js` - findPathAStar() (lignes 285-423)
- ✅ `Src/static/js/game-engine.js` - AlgorithmStats object (lignes 11-82)
- ✅ `Src/static/js/game-engine.js` - Ghost.update() optimizations (lignes 857-930)
- ✅ `Src/static/js/game-engine.js` - leaveHouse() system
- ✅ `README.md` - Documentation algorithmes

*Algorithme GREEDY, personnalités fantômes et interface UI réalisés par Montasser*

### Architecture Pathfinding Implémentée

**Classe Pathfinder (lignes 146-543 de game-engine.js) :**

```javascript
class Pathfinder {
    static findPath(algorithm, maze, start, goal, ghostName) {
        switch(algorithm) {
            case 'BFS': return this.findPathBFS(...)
            case 'ASTAR': return this.findPathAStar(...)
            case 'GREEDY': return this.findPathGreedy(...)
        }
    }
}
```

**Algorithmes implémentés (ma partie) :**

1. **BFS - Breadth-First Search** (lignes 189-283)
   - Queue FIFO pour exploration niveau par niveau
   - Garantit chemin le plus court
   - Complexité : O(V + E)
   - Moyenne ~40-50 nœuds explorés par appel
   - Optimal mais moins efficace que A*

2. **A* - A-Star** (lignes 285-423)
   - Priority queue avec f(n) = g(n) + h(n)
   - Heuristique : Distance Manhattan
   - Complexité : O(E log V)
   - Moyenne ~20-30 nœuds explorés par appel
   - Optimal ET efficace (meilleur compromis)

*(Algorithme GREEDY implémenté par Montasser)*

### Système de Statistiques

**AlgorithmStats Object (lignes 11-82) :**

Tracking en temps réel pour chaque algorithme :
- `totalCalls` - Nombre d'appels algorithme
- `totalNodesExplored` - Nœuds explorés total
- `totalPathLength` - Longueur chemins total
- `totalTimeMs` - Temps calcul total (ms)
- `pathsFound` / `pathsNotFound` - Taux succès

**Affichage automatique :**
- Console : Toutes les 10 secondes (via gameLoop)
- Interface : Toutes les 2 secondes (via setInterval)

### Système Sortie Ghost House

**Problème résolu :**
Les fantômes ne savaient pas comment sortir de la maison

**Solution implémentée - Mode LEAVING_HOUSE :**

```javascript
// Ghost.update() - lignes 857-930
if (this.mode === 'LEAVING_HOUSE') {
    this.leaveHouse(deltaTime)
    return
}
```

**Fonction leaveHouse() créée :**
```javascript
leaveHouse(deltaTime) {
    const exit = this.gameMaze.getGhostHouseExit()
    
    // Move toward exit cell
    if (this.cellY > exit.y) {
        this.direction = DIRECTIONS.NORTH
    } else if (this.cellY < exit.y) {
        this.direction = DIRECTIONS.SOUTH
    }
    
    // Apply movement with deltaTime
    const moveAmount = this.speed * (deltaTime / 16.67)
    this.move(moveAmount)
    
    // Check if reached exit
    if (this.isAtExit()) {
        this.finishExiting()
    }
}
```

**Résultat :**
- Fantômes sortent un par un (timers échelonnés)
- Transition fluide de IN_HOUSE → LEAVING_HOUSE → SCATTER
- Plus de blocages à la sortie

*(Personnalités fantômes Blinky/Pinky/Inky/Clyde implémentées par Montasser)*

### Optimisations Moteur de Jeu

**DeltaTime Normalization (Ghost.update - lignes 857-930) :**
```javascript
// Normalisation 60fps baseline
const moveAmount = this.speed * (deltaTime / 16.67)
```

**Decision Timing Optimization :**
```javascript
// Appel algorithme UNIQUEMENT aux intersections
const atNewCell = (currentCellKey !== this.lastDecisionCell)
if (this.isAtCenter() && atNewCell) {
    this.chooseDirection()  // Appel BFS/A*/GREEDY
    this.lastDecisionCell = currentCellKey
}
```

Fréquence : ~3-5 appels/seconde/fantôme au lieu de 60 fps

**Ghost.chooseDirection() Refactored (lignes 1119-1150) :**
```javascript
chooseDirection() {
    const target = this.getTarget()  // Selon mode/personnalité
    const nextDir = Pathfinder.getNextDirection(
        PATHFINDING_ALGORITHM,  // Sélectionné par UI
        this.gameMaze.maze,
        { x: this.cellX, y: this.cellY },
        target,
        this.name
    )
    this.direction = nextDir
}
```

### Résultats & Performances

**Comparaison Algorithmes (moyenne sur 100+ appels) :**

| Algorithme | Nœuds explorés | Temps (ms) | Optimalité | Usage |
|-----------|---------------|-----------|-----------|--------|
| GREEDY    | 4 (fixe)      | ~0.001    | Non       | Original |
| BFS       | 40-50         | ~0.02     | Optimal   | Intelligent |
| A*        | 20-30         | ~0.015    | Optimal   | Meilleur |

**Taux de succès :** 100% pour tous algorithmes

**Impact performance :**
- Pas de lag même avec 4 fantômes A* simultanés
- 60 FPS constant maintenu
- Mémoire stable (~50MB)

### Difficultés Rencontrées

**Problème 1 : Ghosts stuck in ghost house**
- Cause : Pas de système de sortie de la maison
- Solution : Ajout mode `LEAVING_HOUSE` avec pathfinding vers exit cell

**Problème 2 : Direction reversal bug**
- Cause : Filtrage `opposite direction` avant construction liste
- Solution : Reconstruction logique - collect first, then filter

**Problème 3 : Movement speed glitching**
- Cause : Pas de normalisation deltaTime
- Solution : `speed * (deltaTime / 16.67)` pour tous mouvements

**Problème 4 : Redundant algorithm calls**
- Cause : Appel à chaque frame au centre de la cellule
- Solution : Tracking `lastDecisionCell` pour éviter appels répétés

**Problème 5 : Tunnel wrap escapes**
- Cause : Ghosts sortant du maze via x=0 (pas de cellule)
- Solution : Bounds checking dans `handleTunnelWrap()`

### Stack Technique IA

**Langages & Frameworks :**
- JavaScript ES6+ (classes, modules)
- HTML5 Canvas (rendering)
- Data structures : Map, Set, Array (heaps custom)

**Algorithmes :**
- BFS avec FIFO queue
- A* avec priority queue + Manhattan heuristic
- Greedy best-first local search
- DeltaTime normalization (game loop)

**Design Patterns :**
- Strategy Pattern (algorithmes interchangeables)
- Template Method (Ghost base class + personnalités)
- Observer Pattern (stats tracking)

### Collaboration avec Montasser

**Division du travail AI :**
- **Jazi (moi)** : BFS, A*, AlgorithmStats, deltaTime, ghost house exit
- **Montasser** : GREEDY, personnalités 4 fantômes, UI sélecteur, stats display

**Intégration :**
- Mon AlgorithmStats.getStats() → Son updateAlgorithmStats() UI
- Mes algorithmes BFS/A* → Son interface de sélection
- Ma classe Pathfinder → Ses ghost personalities l'utilisent

### Documentation Produite

**Mise à jour README.md :**
- Section "Architecture de l'IA" complète
- Explications détaillées BFS/A*/GREEDY
- Tableau comparatif performances
- Descriptions personnalités fantômes

**Code Documentation :**
- 150+ lignes de commentaires dans Pathfinder class
- JSDoc pour fonctions principales
- Exemples d'utilisation en inline comments

### Apprentissages Clés

1. **Pathfinding != Simple algorithme**
   - Nécessite adaptation au contexte jeu
   - Compromis performance/optimalité crucial

2. **Heuristics matter**
   - Manhattan distance parfaite pour grille
   - A* surpasse BFS malgré même optimalité

3. **Timing optimization**
   - Ne PAS recalculer chaque frame (60fps)
   - Intersections suffisent (3-5 Hz)

4. **Game feel**
   - GREEDY parfois "meilleur" pour jouabilité
   - Optimal ≠ Fun

### Prochaines Étapes Possibles

**Améliorations IA :**
- [ ] Path visualization (show explored nodes)
- [ ] Collaborative ghost communication
- [ ] Predictive pathfinding (anticipate Pac-Man)
- [ ] Machine learning pour patterns joueur

**Optimisations Performance :**
- [ ] Web Workers pour pathfinding async
- [ ] Path caching (memoization)
- [ ] Incremental A* (LPA*, D*)

**Analyses Scientifiques :**
- [ ] Benchmark suite complet
- [ ] Statistical analysis des performances
- [ ] Player difficulty analysis par algorithme