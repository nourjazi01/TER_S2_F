# Rapport d'Activité — Nour Montasser

---

## Phase 1 — Génération de labyrinthes

Analyse des besoins et recherche sur les algorithmes de génération de labyrinthes. Contraintes identifiées pour un labyrinthe type Pac-Man : grille 2D connexe, pas de culs-de-sac, cycles multiples, possibilité de wrap-around.

Plusieurs familles étudiées : labyrinthes parfaits (DFS, Prim, Kruskal, Wilson) et labyrinthes imparfaits mieux adaptés (Braid Maze, Growing Tree + ajout de cycles, Room+Corridor). Conclusion : approche hybride nécessaire pour coller au style Pac-Man.

Développement des outils d'analyse et de visualisation :
- `ascii_renderer.py` — rendu Unicode avec les caractères box-drawing (`─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼`)
- `maze_analyzer.py` — qualification du labyrinthe : connexité (BFS), comptage culs-de-sac, distribution des degrés, score global (40% connexité + 40% anti-dead-ends + 20% cycles)
- `find_best_maze.py` — génère N labyrinthes et retourne le meilleur score

**Résultats sur 15×15 :** meilleur score 84.8/100, moyenne 84.3 sur 10 labyrinthes.

**Difficulté principale :** gestion des 16 cas d'intersections pour le rendu Unicode.

---

## Phase 2 — Web, tests & CI/CD

Développement de l'API REST Flask et des tests associés.

**API développée (`app.py`) :**
- `GET /api/maze` — retourne le labyrinthe courant en JSON
- `POST /api/generate-maze` — génère un nouveau labyrinthe avec paramètres (width, height, playability, cycle_intensity)
- `GET /api/maze-info` — métadonnées du labyrinthe actuel
- Support `PORT` depuis variable d'environnement pour le déploiement cloud

**Tests (ma partie) :**
- 12 tests API (codes HTTP, format JSON, validation paramètres)
- 19 tests caractéristiques (connexité, dead ends, cycles, score qualité)

**Difficultés rencontrées :**
- Variable globale `current_maze` sans déclaration `global` → UnboundLocalError
- Paramètres query string reçus en string → conversion explicite nécessaire

---

## Phase 3 — Jeu Pac-Man & IA fantômes

Implémentation de l'algorithme Greedy, des personnalités des fantômes et de l'interface de jeu.

**Algorithme Greedy :**
Décision locale pure : pour chaque fantôme, on évalue les 4 directions possibles et on choisit celle qui minimise la distance Manhattan à la cible. O(1), ~0.001ms, comportement authentique Pac-Man original.

**Personnalités des 4 fantômes :**

L'architecture sépare le *ciblage* (propre à chaque fantôme) du *pathfinding* (commun à tous via `Pathfinder`). Chaque fantôme redéfinit uniquement `getChaseTarget()` :

- **Blinky** — cible la position exacte de Pac-Man (poursuite directe)
- **Pinky** — cible 4 cases devant Pac-Man (embuscade)
- **Inky** — calcul vectoriel combinant la position de Blinky et celle de Pac-Man (flanquement imprévisible)
- **Clyde** — poursuit si distance > 8, fuit vers son coin sinon (oscillation)

**Interface :**
- Panneau de sélection d'algorithme avec switch live (GREEDY / BFS / A*)
- Affichage des stats en temps réel (appels, nœuds explorés, temps moyen, taux de succès)
- Fix `maze_generator.py` : la cellule de sortie de la ghost house n'avait pas de passages E/W, les fantômes restaient bloqués

---

## Phase 4 — Nouvelles fonctionnalités & refonte UI

**Système de notation des labyrinthes :**
Les labyrinthes sauvegardés peuvent être notés de 1 à 5 étoiles. Les notes sont stockées en MongoDB avec `rating_sum`, `rating_count` et `rating_avg` mis à jour atomiquement. La galerie peut être triée par note ou par date.

**Troisième type de pellet :**
Ajout du bonus fruit en plus des pellets réguliers et power pellets. Le placement est déterministe par hash de la position — pas aléatoire, toujours au même endroit sur un labyrinthe donné.

**Système de replay avec trajectoire :**
- Enregistrement du chemin de Pac-Man sans fantômes
- Rejeu de ce chemin avec les fantômes actifs (algorithme sélectionné)
- Export JSON de la trajectoire et du replay

**Refonte UI :**
- Deux panneaux de contrôle côte à côte de hauteur égale : *Recording & Playback* (orange) et *AI Configuration* (cyan)
- En-têtes de section, dégradés d'arrière-plan, bordures lumineuses arcade
- Layout responsive : une colonne sous 1180px
- Compteur de pas au moment de la capture de Pac-Man affiché dans les stats
