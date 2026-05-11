# DÉFIS RENCONTRÉS — ILLUSTRATIONS

## DÉFI 1: Ghost House Exit

### AVANT (Bloqué)
```
┌─────────────────────────────┐
│                             │
│   ┌──────────┐              │
│   │ GHOST    │              │
│   │ HOUSE    │              │
│   │ ███████  │              │
│   │ █ G █ G █  ← PIÉGÉS     │
│   │ ███████  │              │
│   └──────────┘              │
│                             │
└─────────────────────────────┘
⏱️ Fantômes sortent JAMAIS
```

### APRÈS (Sortie Garantie)
```
┌─────────────────────────────┐
│                             │
│   ┌──────────┐              │
│   │ GHOST    │              │
│   │ HOUSE    │              │
│   │ ███████  │              │
│   │ █ G █ G █              │
│   │ ███████  │              │
│   │    ↑     │              │  ← Passage ajouté
│   └──────────┘              │     vers le haut
│                             │
└─────────────────────────────┘
⏱️ Fantômes sortent en <2 sec
```

---

## DÉFI 2: Performance avec A*

### GRAPHIQUE: Appels d'Algorithme par Seconde

```
APPELS / SECONDE
│
240 │  ❌ AVANT: A* à chaque frame
    │  ████████████████████████
    │  (4 fantômes × 60 FPS)
    │  = LAG VISIBLE
    │
 60 │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
    │  (seuil 60 FPS)
    │
 12 │  ✅ APRÈS: A* uniquement
    │  aux intersections
    │  (4 fantômes × 3 appels/sec)
    │  = 60 FPS maintenu
    │
  0 └─────────────────────────────
       GREEDY    BFS    A*
```

---

## DÉFI 3: Comportement Trop Intelligent

### COURBE DE DIFFICULTÉ

```
DIFFICULTÉ / JOUABILITÉ
│
  IMPOSSIBLE │ 🔴 BFS / A*
             │ (fantômes trop forts)
             │
  DIFFICILE  │ 🟡 Avec personnalités
             │ (exploitable, fun)
             │
   MOYEN     │ 🟢 GREEDY
             │ (arcade, jouable)
             │
   FACILE    │ 🟢 Power pellet ON
             │ (Pac-Man carnivore)
             │
└─────────────────────────────────
  Débutant → Avancé
```

---

## DÉFI 4: Validation des Algorithmes

### STATS AFFICHÉES EN DIRECT

```
┌────────────────────────────────────┐
│ 👻 GHOST AI: [A*] (sélectionné)    │
├────────────────────────────────────┤
│ Calls:              342             │
│ Avg Nodes:          18.5            │
│ Avg Path Length:    8.2             │
│ Avg Time:           0.014 ms        │
│ Success Rate:       100%            │
└────────────────────────────────────┘
```

---

## DÉFI 5: Pac-Man Oscille

### CHEMIN OSCILLANT vs CHEMIN LISSE

```
SANS CORRECTION (Minimax brut)
┌─────────────────────────────────────┐
│                                     │
│   SPASTIQUE:                        │
│   🟡 ↗ ↖ ↗ ↖ ↗ ↖ → Pellet          │
│      (aller-retour dément)          │
│                                     │
│   Raison: Minimax décide coup-à-    │
│   coup sans mémoire. À chaque       │
│   étape, revenir était optimal.     │
│                                     │
└─────────────────────────────────────┘
❌ Pas naturel, peu convaincant
```

```
AVEC recentCells + reversal penalty + fast-path
┌─────────────────────────────────────┐
│                                     │
│   FLUIDE:                           │
│   🟡 ─→─→─→─→─→─→─→ Pellet         │
│      (mouvement linéaire)           │
│                                     │
│   Raison:                           │
│   • recentCells pénalise retour     │
│   • reversal penalty décourage      │
│     demi-tour                       │
│   • fast-path BFS = momentum        │
│                                     │
└─────────────────────────────────────┘
✅ Naturel, intelligent, fluide
```

---

## RÉSUMÉ VISUEL: Les 5 Défis

```
DÉFI 1          DÉFI 2          DÉFI 3          DÉFI 4          DÉFI 5
Ghost Exit      Performance     IA Trop Fort    Validation      Oscillation

❌ Bloqué      ❌ 240 calls/s  ❌ Jeu Impossi. ❌ Pas de       ❌ Spastique
                = LAG           = Pas fun       proof          = Mécanique
   ↓               ↓               ↓              ↓                ↓
✅ Passage     ✅ 12 calls/s   ✅ GREEDY +     ✅ Stats        ✅ recentCells
   garantis      = FLUIDE        modes +        en direct       + reversal
              (60 FPS!)        perso           (objectif)      + fast-path

RÉSULTAT:      RÉSULTAT:       RÉSULTAT:       RÉSULTAT:       RÉSULTAT:
Sortie <2s     Gameplay fluide Balance fun/    Comparaison     Mouvement
               même A*         hard             claire          intelligent
```
