# DÉVELOPPEMENT DES SLIDES - PAC-MAN SELF-PLAY AI

## Slides Ajoutées pour Approfondir

### SLIDE 17b: MINIMAX — EXEMPLE D'ARBRE

Arbre de jeu concret (profondeur 3) montrant:
- Calcul MAX/MIN avec scores réels
- Comment Pac-Man choisit la meilleure stratégie
- Démonstration numérique (exemple: UP = score 6)

**Contenu:**
```
                    RACINE (MAX)
                   /    |    \
              ↑    ↑     ↑
             UP  LEFT  RIGHT
            /      |      \
        (MIN)    (MIN)    (MIN)
        /  |      /  |      /  |
       ↓   ↓     ↓   ↓     ↓   ↓
      L   R    L   R    L   R
      |   |    |   |    |   |
     8   6    7   5    9   4  ← Évaluations (feuilles)
      \  /     \  /     \  /
       6        5        4    (MIN choisit minimum)
        \       |       /
         ────────┬────────
               6 (MAX choisit maximum)
             
             → Pac-Man choisit UP (score=6)
```

---

### SLIDE 18: ALPHA-BETA — PRUNING EN ACTION

Visualisation du pruning avec:
- Branches coupées (75% de réduction)
- Exemple concret des α-β bounds
- Graphique comparatif Minimax vs Alpha-Beta

**Points clés:**
- Même décision que Minimax (résultat identique)
- Beaucoup moins de nœuds explorés (60-70% réduction)
- IA temps réel compatible 60 FPS

---

### SLIDE 18b: EXPECTIMAX — AVEC PROBABILITÉS UNIFORMES

Arbre Expectimax montrant:
- Nœuds CHANCE au lieu de MIN
- Calcul de moyenne pour les actions probabilistes
- Différence: MINIMAX (min=6) vs EXPECTIMAX (moyenne=7)

**Quand l'utiliser:**
- Mode FRIGHTENED: fantôme aléatoire
- Expectimax modèle accurate (vs Minimax pessimiste)

---

## Résumé Timing Présenation

**18-20 minutes total:**
- Phases 1-3: 2 min
- IA fantômes: 5 min
- **Pac-Man AI (NOUVEAU): 8 min** ← Détails approfondis
- Tests + patterns: 2 min
- Démo + conclusion: 1 min

---

## Nouvelle Structure (28 slides)

| Slide | Titre |
|-------|-------|
| 15 | Minimax (sémantique) |
| 17b | **MINIMAX — EXEMPLE** ✨ |
| 16 | Alpha-Beta (sémantique) |
| 18 | **ALPHA-BETA — PRUNING** ✨ |
| 17 | Expectimax (sémantique) |
| 18b | **EXPECTIMAX — PROBABILITÉS** ✨ |
| 19 | Heuristiques & optimisations |
| 20 | Tests & validation |
| 21 | Résultats & métriques |
| 22 | Au-delà des classiques |
| 23 | Patterns de conception |
| 24 | API & composants |
| 25 | **Défis rencontrés** |
| 26 | Démonstration live |
| 27 | Conclusion |
| 28 | Questions |
