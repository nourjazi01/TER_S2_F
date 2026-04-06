# 🎮 TER_S2_F - Pac-Man Game with Advanced Ghost AI

## 👥 Membres du groupe

- **Nour Jazi** - Pathfinding algorithms, ghost AI architecture, game engine optimization
- **Nour Montasser** - Maze generation, web interface, game visualization & testing

## 📝 Description du projet

Travail d'Étude et de Recherche (TER) sur la génération algorithmique de labyrinthes et l'implémentation d'un jeu Pac-Man complet avec système d'Intelligence Artificielle avancé pour les fantômes.

## 🎯 Objectifs

### Phase 1: Génération de Labyrinthes (Complétée)
- ✅ Générer des labyrinthes sans culs-de-sac (dead ends)
- ✅ Garantir des cycles multiples pour la jouabilité
- ✅ Assurer une connexité complète du graphe
- ✅ Exposer le générateur via une API HTTP (JSON)
- ✅ Automatiser tests et déploiement avec CI/CD

### Phase 2: Implémentation du Jeu Pac-Man (Complétée)
- ✅ Moteur de jeu complet avec canvas HTML5
- ✅ Système de contrôle Pac-Man (clavier)
- ✅ Gestion des pellets et power pellets
- ✅ Système de vies et score
- ✅ Modes de jeu (scatter, chase, frightened)

### Phase 3: Intelligence Artificielle des Fantômes (Complétée)
- ✅ Implémentation de 3 algorithmes de pathfinding:
  - **BFS (Breadth-First Search)** - Recherche en largeur
  - **A* (A-Star)** - Recherche heuristique optimale
  - **GREEDY** - Recherche gloutonne locale
- ✅ Personnalités uniques pour chaque fantôme:
  - 🔴 **Blinky** (rouge) - Chasse directe
  - 🩷 **Pinky** (rose) - Embuscade 4 cases devant
  - 🩵 **Inky** (cyan) - Flanquement collaboratif
  - 🟠 **Clyde** (orange) - Chasse/fuite dynamique
- ✅ Système de comparaison des algorithmes en temps réel
- ✅ Interface de sélection d'algorithme en direct

## 🧠 Architecture de l'Intelligence Artificielle

### Algorithmes de Pathfinding Implémentés

#### 1. BFS (Breadth-First Search)
```
Caractéristiques:
- Exploration niveau par niveau (FIFO queue)
- Garantit le chemin le plus court
- Complexité: O(V + E)
- Usage mémoire: O(V)

Avantages: Chemin optimal garanti, simple
Inconvénients: Explore beaucoup de nœuds inutiles
```

#### 2. A* (A-Star)
```
Caractéristiques:
- Utilise heuristique (distance Manhattan)
- f(n) = g(n) + h(n)
- Complexité: O(E log V)
- Usage mémoire: O(V)

Avantages: Optimal + efficace (explore moins de nœuds)
Inconvénients: Plus complexe, nécessite heuristique admissible
```

#### 3. GREEDY (Glouton)
```
Caractéristiques:
- Décision locale uniquement (1 pas)
- Choisit direction minimisant distance
- Complexité: O(1)
- Usage mémoire: O(1)

Avantages: Très rapide, comportement authentique Pac-Man
Inconvénients: Pas optimal, peut rester bloqué
```

### Personnalités des Fantômes

Chaque fantôme utilise le **même algorithme** mais avec une **cible différente**:

| Fantôme | Couleur | Stratégie de Ciblage | Comportement |
|---------|---------|---------------------|--------------|
| **Blinky** | 🔴 Rouge | Position actuelle de Pac-Man | Poursuivant agressif direct |
| **Pinky** | 🩷 Rose | 4 cases devant Pac-Man | Embuscade pour couper le chemin |
| **Inky** | 🩵 Cyan | Calcul vectoriel (Blinky + 2 devant Pac-Man) | Flanquement collaboratif imprévisible |
| **Clyde** | 🟠 Orange | Pac-Man si >8 cases, sinon coin | Oscillation chase/fuite |

### Fréquence d'Exécution

Les algorithmes sont appelés **uniquement aux intersections**, pas à chaque frame:

```
┌────────────────────────────────────────────┐
│ 60 FPS → ~4 frames/second avec algorithme │
│                                            │
│ Frame 1-14: Déplacement simple            │
│ Frame 15: INTERSECTION → Appel BFS/A*/etc │
│ Frame 16-29: Déplacement                  │
│ Frame 30: INTERSECTION → Appel algorithme │
│ ...                                        │
└────────────────────────────────────────────┘
```

**Résultat:** ~3-5 appels d'algorithme par fantôme par seconde (aux intersections uniquement)

### Système de Statistiques

Interface de comparaison en temps réel affichant:
- Nombre d'appels d'algorithme
- Moyenne de nœuds explorés
- Longueur moyenne du chemin
- Temps moyen de calcul (ms)
- Taux de succès (%)

## 🏗️ Architecture Technique

### Stack Frontend
- **HTML5 Canvas** - Rendu graphique du jeu
- **JavaScript ES6** - Moteur de jeu client-side
- **CSS3** - Interface utilisateur style arcade

### Stack Backend
- **Python 3.11+** - Langage principal
- **Flask 3.0** - Framework web
- **Gunicorn** - Serveur WSGI production

### Algorithmes & IA
- **Pathfinding** - BFS, A*, Greedy implémentés en JavaScript
- **Maze Generation** - Hybrid Prim-DFS + Braid Maze en Python
- **Ghost AI** - Architecture modulaire avec personnalités distinctes

## 📁 Structure du projet

```
TER_S2_F/
├── Src/
│   ├── maze_generator.py       # Génération de maze (Montasser)
│   ├── maze_analyzer.py        # Métriques et qualification (Montasser)
│   ├── ascii_renderer.py       # Rendu ASCII (Montasser)
│   ├── find_best_maze.py       # Recherche automatique (Montasser)
│   ├── main.py                 # Point d'entrée CLI
│   └── static/
│       └── js/
│           ├── game-engine.js  # Moteur de jeu + AI (Jazi)
│           └── app.js          # Interface web (Jazi/Montasser)
├── templates/
│   └── index.html             # Interface web (Montasser)
├── tests/
│   ├── test_functional.py     # Tests fonctionnels (Jazi)
│   ├── test_api.py           # Tests API (Montasser)
│   ├── test_maze_characteristics.py  # Tests qualité (Montasser)
│   └── test_e2e.py           # Tests E2E (Jazi)
├── RA/
│   ├── ra_jazi.md            # Rapport activité Jazi
│   └── ra_montasser.md       # Rapport activité Montasser
├── app.py                    # Serveur Flask (Montasser)
├── .github/workflows/
│   └── ci-cd.yml            # Pipeline CI/CD (Jazi)
└── render.yaml              # Configuration déploiement (Jazi)
```


## 🎮 Utilisation

### 1. Installation

```bash
# Cloner le repository
git clone <repository-url>
cd TER_S2_F

# Créer environnement virtuel
python -m venv .venv

# Activer l'environnement
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Installer dépendances
pip install -r requirements.txt
```

### 2. Lancer le Jeu Pac-Man

```bash
# Démarrer le serveur Flask
python app.py

# Ouvrir le navigateur
http://localhost:5000
```

**Interface de Jeu:**
1. Onglet **"Play"** - Jouer au jeu
2. Sélectionner l'algorithme (GREEDY / BFS / A*)
3. Cliquer "START GAME"
4. Utiliser les flèches ou WASD pour contrôler Pac-Man

### 3. Comparer les Algorithmes

L'interface affiche en temps réel:
```
┌────────────────────────────────────────────────────┐
│  GHOST AI ALGORITHM:  [GREEDY] [BFS] [A*]         │
├────────────────────────────────────────────────────┤
│  Calls: 120 | Avg Nodes: 45.3 | Avg Path: 8.5    │
│  Avg Time: 0.02ms | Success: 100%                 │
└────────────────────────────────────────────────────┘
```

**Changer d'algorithme en direct:**
- Cliquer sur un bouton (GREEDY/BFS/A*)
- Les fantômes utilisent immédiatement le nouvel algorithme
- Les statistiques se réinitialisent

### 4. Mode CLI (Génération de Maze)

```bash
cd Src
python main.py 15 15
```

### 5. API REST

```bash
# Démarrer le serveur
python app.py

# Endpoints disponibles:
# GET  /api/maze           - Récupérer maze actuel
# POST /api/generate-maze  - Générer nouveau maze
# GET  /api/maze-info      - Informations maze
```

**Exemple requête:**
```json
POST /api/generate-maze
{
  "width": 15,
  "height": 15,
  "playability": 0.5,
  "dead_end_ratio": 0.0,
  "cycle_intensity": 0.5
}
```

## 🧪 Tests

Suite de **51 tests automatisés**:

```bash
# Tests complets
pytest -v

# Tests spécifiques
pytest tests/test_functional.py -v     # 13 tests (Jazi)
pytest tests/test_api.py -v            # 12 tests (Montasser)
pytest tests/test_maze_characteristics.py -v  # 19 tests (Montasser)
pytest tests/test_e2e.py -v            # 7 tests (Jazi)

# Avec coverage
pytest --cov=Src --cov-report=html
```

**Répartition des tests:**
- ✅ 13 tests fonctionnels - Structure, dimensions, paramètres (Jazi)
- ✅ 12 tests API - Endpoints HTTP, validation (Montasser)
- ✅ 19 tests caractéristiques - Qualité maze (Montasser)
- ✅ 7 tests E2E - API déployée (Jazi)

## 🚀 CI/CD

Pipeline GitHub Actions automatisé:

```yaml
1. Checkout code
2. Setup Python 3.11
3. Install dependencies
4. Run 51 tests
5. ✅ Si tests OK  → Deploy to Render
6. ❌ Si tests KO  → Block deployment
```

**Démonstration:** Un commit avec erreur intentionnelle a été bloqué par les tests.

### Configuration Secrets

```bash
RENDER_API_KEY      # Clé API Render
RENDER_SERVICE_ID   # ID du service
RENDER_APP_URL      # URL de l'application
```

## 🌐 Déploiement Cloud

**URL Production:** https://ter-s2-f.onrender.com

**Stack déploiement:**
- **Platform:** Render.com (Frankfurt)
- **Server:** Gunicorn WSGI
- **Health Check:** GET /api/maze
- **Auto-deploy:** Via GitHub Actions

Voir documentation complète: [`DEPLOYMENT.md`](DEPLOYMENT.md)

## 📊 Résultats & Performances

### Génération de Maze
- **Score optimal:** 89.2/100
- **Temps génération 15x15:** ~10ms
- **Temps génération 30x30:** ~40ms
- **Connexité:** 100% garantie
- **Culs-de-sac:** 0 (braid maze)

### Performance IA des Fantômes

| Algorithme | Nœuds explorés | Temps moyen | Optimalité | Usage |
|-----------|---------------|-------------|-----------|-------|
| **GREEDY** | 4 (toujours) | ~0.001ms | Non optimal | Original Pac-Man |
| **BFS** | 30-50 | ~0.02ms | Optimal | Fantômes intelligents |
| **A*** | 15-25 | ~0.015ms | Optimal | Meilleur compromis |

### Tests
- **51/51 tests passent** (100%)
- **Coverage:** Modules core couverts
- **Temps exécution:** ~0.3s (tests core)

## 📚 Documentation

- [`README.md`](README.md) - Ce fichier (guide principal)
- [`DEPLOYMENT.md`](DEPLOYMENT.md) - Guide déploiement cloud (Jazi)
- [`TESTING.md`](TESTING.md) - Guide tests automatisés (Jazi)
- [`TEST_SYNTHESIS.md`](TEST_SYNTHESIS.md) - Synthèse complète tests (Jazi)
- [`Src/README.md`](Src/README.md) - Détails techniques code
- [`Gallery/README.md`](Gallery/README.md) - Meilleurs labyrinthes
- [`RA/ra_jazi.md`](RA/ra_jazi.md) - Rapport activité Jazi
- [`RA/ra_montasser.md`](RA/ra_montasser.md) - Rapport activité Montasser

## 🎯 Répartition du Travail

### Nour Jazi - Algorithmes Core & DevOps
**Responsabilités principales:**
- **Algorithmes Pathfinding Core:**
  - BFS (Breadth-First Search) implementation (~100 lignes)
  - A* (A-Star) avec heuristique Manhattan (~140 lignes)
  - AlgorithmStats tracking system (~70 lignes)
- **Optimisations Moteur:**
  - DeltaTime normalization pour mouvement fluide
  - Decision timing system (lastDecisionCell)
  - Ghost house exit system (LEAVING_HOUSE mode)
- **DevOps & CI/CD:**
  - Configuration GitHub Actions
  - Déploiement Render
  - Tests fonctionnels (13 tests)
  - Tests E2E (7 tests)

**Fichiers créés/modifiés:**
- `Src/static/js/game-engine.js` (BFS, A*, AlgorithmStats)
- `.github/workflows/ci-cd.yml`
- `render.yaml`
- `tests/test_functional.py`
- `tests/test_e2e.py`
- `DEPLOYMENT.md`, `TESTING.md`, `TEST_SYNTHESIS.md`

### Nour Montasser - Personnalités Ghost & Interface
**Responsabilités principales:**
- **Algorithme & Personnalités Ghost:**
  - GREEDY algorithm implementation (~75 lignes)
  - Blinky personality (direct chase)
  - Pinky personality (4 ahead ambush)
  - Inky personality (collaborative flank)
  - Clyde personality (chase/flee oscillation)
- **Interface & Visualisation:**
  - Interface HTML5 Canvas jeu complet
  - Système sélection algorithme UI
  - Affichage stats temps réel
  - Maze generator + ghost house fix
- **Tests & API:**
  - Tests API (12 tests)
  - Tests caractéristiques (19 tests)

**Fichiers créés/modifiés:**
- `Src/static/js/game-engine.js` (GREEDY, 4 ghost classes)
- `Src/maze_generator.py` (ghost house fix)
- `templates/index.html` (interface jeu)
- `Src/static/js/app.js` (UI controls)
- `app.py` (API Flask)
- `tests/test_api.py`
- `tests/test_maze_characteristics.py`

## 🔄 Évolution du Projet

### Phase 1 (Semaines 1-2) - Fondations
- Recherche algorithmes génération maze
- Implémentation Braid Maze
- Tests de base
- Export JSON

### Phase 2 (Semaine 3) - Web & Tests
- API Flask REST
- Interface web
- 51 tests automatisés
- CI/CD pipeline

### Phase 3 (Semaines 4-6) - Jeu Complet
- Moteur de jeu Pac-Man
- Système de contrôle
- Gestion collisions
- Pellets et scoring

### Phase 4 (Semaines 7-8) - IA Avancée
- Implémentation BFS
- Implémentation A*
- Implémentation Greedy
- Personnalités fantômes
- Interface de comparaison
- Statistiques temps réel

## 🏆 Fonctionnalités Uniques

1. **Comparaison d'algorithmes en direct** - Switch entre BFS/A*/GREEDY pendant le jeu
2. **Statistiques temps réel** - Métriques de performance pour chaque algorithme
3. **Personnalités authentiques** - Comportements uniques inspirés du Pac-Man original
4. **Architecture modulaire** - Séparation claire ciblage/pathfinding
5. **Interface interactive** - Sélection d'algorithme et visualisation
6. **Documentation complète** - Explications détaillées des algorithmes

## 🛠️ Technologies Utilisées

**Frontend:**
- HTML5 Canvas
- JavaScript ES6+ (modules)
- CSS3 (animations, arcade style)

**Backend:**
- Python 3.11
- Flask 3.0
- Gunicorn (WSGI)

**Tests:**
- Pytest 7.4
- pytest-flask
- pytest-cov

**DevOps:**
- GitHub Actions (CI/CD)
- Render.com (hosting)
- Git (version control)

**Algorithmes:**
- BFS (Breadth-First Search)
- A* (A-Star with Manhattan heuristic)
- Greedy Best-First Search
- Hybrid Prim-DFS (maze generation)

## 📜 License

Ce projet est un travail académique réalisé dans le cadre du TER (Travail d'Étude et de Recherche).
