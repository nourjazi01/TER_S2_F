# TER_S2_F

## Membres du groupe

- Nour Jazi
- Nour Montasser

## Description du projet

Travail d’Étude et de Recherche (TER) portant sur la **génération algorithmique de labyrinthes dans l’esprit Pac-Man**.
### Objectifs

- Générer des labyrinthes **sans culs-de-sac** (dead ends)
- Garantir la présence de **cycles multiples** pour améliorer la jouabilité
- Assurer une **connexité complète** du graphe
- Implémenter et comparer différents algorithmes de génération
- Développer des outils d'analyse et de qualification

### Algorithme principal : Braid Maze

1. Génération d'un labyrinthe parfait (DFS)
2. Suppression systématique de tous les culs-de-sac
3. Création automatique de cycles
4. Export au format JSON

### État actuel (16/02/2026)

✅ Générateur fonctionnel (Braid Maze)  
✅ Export JSON structuré  
✅ Rendu ASCII dans la console  
✅ Suite de tests de qualification  
✅ Score qualité Pac-Man automatique  

**Meilleur score atteint :** 85.0/100
## Structure du projet

- **RA/** : Rapports d'activité individuels et références
  - `ra_jazi.md` : Rapport d'activité de Nour Jazi
  - `ra_montasser.md` : Rapport d'activité de Nour Montasser
  - `mazes.md` : Références bibliographiques explorées
  
- **Src/** : Code source du générateur
  - `main.py` : Script principal
  - `maze_generator.py` : Générateur Braid Maze
  - `ascii_renderer.py` : Rendu ASCII
  - `maze_analyzer.py` : Tests de qualification
  - `find_best_maze.py` : Recherche du meilleur labyrinthe
  
- **Gallery/** : Meilleurs labyrinthes générés
  - `best_maze.json` : Meilleur labyrinthe (format JSON)
  - `best_ascii.txt` : Rendu ASCII avec statistiques
  - `best_ascii.png` : Capture d'écran (à créer)
  
- **Proto/** : Prototypes et documents de recherche

## 🚀 Utilisation

### Génération simple

```bash
cd Src
python main.py [largeur] [hauteur]
```

### Recherche du meilleur labyrinthe

```bash
cd Src
python find_best_maze.py
```

Génère 10 labyrinthes et garde le meilleur score.

## 📊 Résultats Actuels

**Dernière génération (15x15) :**
- Connexité : 100%
- Culs-de-sac : 0
- Degré moyen : 2.25
- Score global : 85.0/100

## 📚 Documentation

Voir les fichiers README dans chaque répertoire pour plus de détails :
- [Src/README.md](Src/README.md) - Documentation technique du code
- [Gallery/README.md](Gallery/README.md) - Information sur les meilleurs labyrinthes
- [RA/mazes.md](RA/mazes.md) - Références bibliographiques