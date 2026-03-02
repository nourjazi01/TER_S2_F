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

