# Code Source - Générateur de Labyrinthes Pac-Man

## 📁 Structure du code

### Fichiers principaux

- **`main.py`** : Script principal pour générer, afficher et analyser des labyrinthes
- **`maze_generator.py`** : Générateur de labyrinthes type Braid Maze (sans culs-de-sac)
- **`ascii_renderer.py`** : Rendu ASCII des labyrinthes dans la console
- **`maze_analyzer.py`** : Tests et analyses de qualification des labyrinthes

## 🚀 Utilisation

### Génération d'un labyrinthe

```bash
python main.py [largeur] [hauteur]
```

**Exemples :**
```bash
# Labyrinthe 15x15 (par défaut)
python main.py

# Labyrinthe 20x10
python main.py 20 10

# Petit labyrinthe 8x8
python main.py 8 8
```

### Utilisation des modules individuels

**Génération seule :**
```bash
python maze_generator.py
```
→ Crée `maze_output.json`

**Affichage ASCII :**
```bash
python ascii_renderer.py [fichier.json]
```

**Analyse qualité :**
```bash
python maze_analyzer.py [fichier.json]
```

## 📊 Format JSON du labyrinthe

Le labyrinthe est exporté au format JSON avec la structure suivante :

```json
{
  "metadata": {
    "width": 10,
    "height": 10,
    "type": "braid_maze",
    "algorithm": "DFS + dead-end removal"
  },
  "cells": {
    "0,0": {
      "x": 0,
      "y": 0,
      "passages": ["E", "S"],
      "degree": 2
    },
    "1,0": {
      "x": 1,
      "y": 0,
      "passages": ["W", "E", "S"],
      "degree": 3
    }
    // ... autres cellules
  }
}
```

### Détails du format

- **metadata** : informations sur le labyrinthe
  - `width`, `height` : dimensions
  - `type` : type d'algorithme utilisé
  - `algorithm` : description de l'algorithme

- **cells** : dictionnaire de toutes les cellules
  - Clé : `"x,y"` (coordonnées)
  - `passages` : liste des directions de passages ouverts (`N`, `S`, `E`, `W`)
  - `degree` : nombre de passages ouverts (0-4)

## 🎯 Algorithme : Braid Maze

### Principe

1. **Génération d'un labyrinthe parfait** avec DFS (Depth-First Search)
   - Arbre couvrant du graphe
   - 1 seul chemin entre 2 cellules
   - Présence de culs-de-sac

2. **Suppression de tous les culs-de-sac**
   - Identification des cellules de degré 1
   - Ouverture d'un passage supplémentaire aléatoire
   - Création de cycles

3. **Résultat : Braid Maze**
   - ❌ Aucun cul-de-sac (dead end)
   - ✅ Présence de cycles multiples
   - ✅ Graphe connexe
   - ✅ Adapté au gameplay Pac-Man

## 🧪 Tests de qualification

Le module `maze_analyzer.py` implémente plusieurs tests :

### 1. Test de connexité
- Vérifie que toutes les cellules sont accessibles
- Utilise un BFS (Breadth-First Search)
- Calcule le ratio de cellules accessibles

### 2. Analyse des culs-de-sac
- Compte les cellules de degré 1 (dead ends)
- **Objectif Pac-Man : 0 culs-de-sac**

### 3. Distribution des degrés
- Analyse la répartition des degrés (1, 2, 3, 4)
- Calcule le degré moyen
- Optimal pour Pac-Man : degré moyen 2.5-3

### 4. Score qualité Pac-Man
Combine 3 critères :
- **Connexité** (40%) : 100 si connexe, 0 sinon
- **Anti-culs-de-sac** (40%) : 100 si aucun, décroît linéairement
- **Cycles** (20%) : basé sur le degré moyen

**Score >= 90/100 → Prêt pour Pac-Man**

## 📈 Évolutions futures

- [ ] Génération avec obstacles fixes (zones non traversables)
- [ ] Algorithmes alternatifs (LERW, Cellular Automata)
- [ ] Export vers formats graphiques (PNG, SVG)
- [ ] Interface graphique pour visualisation interactive
- [ ] Optimisation des performances pour grandes dimensions

## 👥 Auteurs

Projet TER - Groupe TER_S2_F
- Nour Jazi
- Nour Montasser
