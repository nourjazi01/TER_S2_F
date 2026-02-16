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