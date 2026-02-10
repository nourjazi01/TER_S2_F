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
