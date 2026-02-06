# Rapport d'Activité - Jazi

**Date :** 06/02/2026

## Activités du jour

### Tâches réalisées

- Mise en place de la structure du projet TER
- Analyse des contraintes pour la génération de labyrinthes type Pac-Man
- Identification des algorithmes adaptés

### Recherches effectuées

#### 🎯 Contraintes identifiées pour les labyrinthes type Pac-Man

- ❌ Aucun cul-de-sac (dead end)
- ✅ Présence de cycles multiples
- ✅ Graphe connexe
- ✅ Jouabilité optimale

#### 📚 Algorithmes adaptés recensés

**1. Braid Maze (recommandé - le plus classique)**
- Principe : générer un labyrinthe parfait puis supprimer tous les dead ends
- Chaque suppression crée un cycle
- Très proche des labyrinthes Pac-Man
- Citation : *"Le labyrinthe final est un braid maze, caractérisé par l'absence de culs-de-sac et la présence de cycles."*

**2. Graph with Minimum Degree ≥ 2**
- Approche graphe théorique
- Forcer chaque nœud à avoir au moins 2 voisins
- Garantit l'absence de dead ends
- Très défendable théoriquement

**3. Loop-Erased Random Walk (LERW modifié)**
- Marche aléatoire créant des cycles
- Modification : empêcher degré 1
- Avantage : très naturel, variété élevée
- Inconvénient : moins courant, plus complexe

**4. Hybrid DFS + Forced Cycles**
- DFS pour connexité + ajout aléatoire de passages
- Suppression explicite des dead ends
- Simple, testable et progressif
- Citation : *"Les cycles sont introduits volontairement afin d'éliminer les culs-de-sac et d'améliorer la jouabilité."*

#### 📊 Tableau comparatif

| Algorithme | Dead ends | Cycles | Complexité | Pac-Man |
|------------|-----------|--------|------------|---------|
| Braid Maze | ❌ | ✅ | ⭐⭐ | ⭐⭐⭐ |
| Min degree ≥ 2 | ❌ | ✅ | ⭐⭐ | ⭐⭐⭐ |
| LERW modifié | ❌ | ✅ | ⭐⭐⭐ | ⭐⭐ |
| Cellular Automata | ❌ | ✅ | ⭐⭐⭐ | ⭐⭐ |
| CSP | ❌ | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Hybrid DFS + cycles | ❌ | ✅ | ⭐⭐ | ⭐⭐⭐ |

### Difficultés rencontrées

- Nécessité de bien différencier labyrinthes parfaits (avec dead ends) vs labyrinthes avec cycles
- Clarification des contraintes : les labyrinthes parfaits sont exclus en sortie finale

### Prévisions pour la prochaine séance

- Approfondir l'algorithme Braid Maze (priorité)
- Expérimenter avec Hybrid DFS + Forced Cycles
- Commencer l'implémentation d'un prototype simple
- Tester la génération et valider l'absence de dead ends
