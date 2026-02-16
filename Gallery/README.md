# Gallery - Meilleurs Labyrinthes Générés

Ce répertoire contient les meilleurs labyrinthes produits par notre générateur.

## 📁 Contenu

### Meilleur Labyrinthe Actuel

- **`best_maze.json`** : Données JSON du meilleur labyrinthe
- **`best_ascii.txt`** : Rendu ASCII avec statistiques complètes
- **`best_ascii.png`** : Capture d'écran du rendu ASCII (à créer)

## 🏆 Statistiques du Meilleur Labyrinthe

**Génération :** 16/02/2026

**Dimensions :** 15 x 15 cellules

**Score Qualité Pac-Man :** 85.0/100

### Critères de qualité

- ✅ **Connexité** : 100% (225/225 cellules accessibles)
- ✅ **Culs-de-sac** : 0 (objectif Pac-Man atteint)
- ⚠️ **Cycles** : Degré moyen 2.25 (optimal : 2.5-3)

### Distribution des degrés

- Degré 2 : 76.0% (171 cellules)
- Degré 3 : 23.1% (52 cellules)  
- Degré 4 : 0.9% (2 cellules)

## 📝 Format JSON

Le fichier `best_maze.json` contient :

```json
{
  "metadata": {
    "width": 15,
    "height": 15,
    "type": "braid_maze",
    "algorithm": "DFS + dead-end removal"
  },
  "cells": {
    "x,y": {
      "x": 0,
      "y": 0,
      "passages": ["E", "S"],
      "degree": 2
    }
  }
}
```

## 🎯 Processus de Sélection

Pour sélectionner le meilleur labyrinthe :

1. Génération de 10 labyrinthes avec paramètres identiques
2. Analyse automatique de chaque labyrinthe
3. Calcul du score qualité Pac-Man (0-100)
4. Sélection du labyrinthe avec le meilleur score

### Résultats de la dernière génération

- Score moyen : 84.3/100
- Score minimum : 83.4/100
- Score maximum : 85.0/100
- **Meilleur sélectionné : 85.0/100**

## 📸 Comment créer best_ascii.png

1. Ouvrir le fichier `best_ascii.txt`
2. Copier le rendu ASCII dans un terminal avec police monospace
3. Prendre une capture d'écran
4. Sauvegarder comme `best_ascii.png` dans ce répertoire

**Ou utiliser le script :**

```bash
cd ../Src
python find_best_maze.py
# Puis faire une capture d'écran du terminal
```

## 🔄 Régénération

Pour générer un nouveau meilleur labyrinthe :

```bash
cd ../Src
python find_best_maze.py
```

Le script tentera 10 générations et gardera automatiquement le meilleur résultat.

---

*Dernière mise à jour : 16/02/2026*
