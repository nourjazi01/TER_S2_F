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

### État actuel (05/03/2026)

✅ Générateur fonctionnel (Hybrid Prim-DFS + Braid Maze)  
✅ Ghost house centrale (zone 3x3)  
✅ Export JSON structuré  
✅ Rendu ASCII avec Unicode  
✅ Suite de tests de qualification  
✅ Score qualité Pac-Man automatique  
✅ **API HTTP avec Flask**  
✅ **Suite de tests complète (fonctionnels, API, caractéristiques, E2E)**  
✅ **CI/CD avec GitHub Actions**  
✅ **Déploiement automatique sur Render**  

**Meilleur score atteint :** 89.2/100
## Structure du projet

- **RA/** : Rapports d'activité individuels et références
  - `ra_jazi.md` : Rapport d'activité de Nour Jazi
  - `ra_montasser.md` : Rapport d'activité de Nour Montasser
  - `mazes.md` : Références bibliographiques explorées
  
- **Src/** : Code source du générateur
  - `main.py` : Script principal
  - `maze_generator.py` : Générateur Hybrid Prim-DFS + Braid Maze
  - `ascii_renderer.py` : Rendu ASCII
  - `maze_analyzer.py` : Tests de qualification
  - `find_best_maze.py` : Recherche du meilleur labyrinthe

- **tests/** : Suite de tests automatisés
  - `test_functional.py` : Tests fonctionnels (dimensions, structure)
  - `test_api.py` : Tests des endpoints API
  - `test_maze_characteristics.py` : Tests de qualité (connectivité, dead ends)
  - `test_e2e.py` : Tests de bout en bout (local/cloud)
  
- **app.py** : Application Flask (API HTTP)
- **templates/** : Interface web de visualisation
- **requirements.txt** : Dépendances Python
- **Mode Ligne de Commande

#### Génération simple

```bash
cd Src
python main.py [largeur] [hauteur]
```

#### Recherche du meilleur labyrinthe

```bash
cd Src
python find_best_maze.py
```

Génère 10 labyrinthes et garde le meilleur score.

### Mode Web Service (API HTTP)

#### Démarrer le serveur local

```bash
pip install -r requirements.txt
python app.py
```

Le serveur démarre sur `http://localhost:5000`

#### Tester l'API
Algorithme : Hybrid Prim-DFS + ghost house + tunnels horizontaux
- Connexité : 100%
- Culs-de-sac : 0
- Degré moyen : 2.46
- Score global : 89.2/100
- Ghost house : 3x3 au centre
- Tunnels : wrap-around gauche-droite
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guide complet de déploiement cloud (Render, CI/CD, GitHub Actions)
- **[TESTING.md](TESTING.md)** - Guide des tests (fonctionnels, API, caractéristiques, E2E, curl)
- **[Src/README.md](Src/README.md)** - Documentation technique du code
- **[Gallery/README.md](Gallery/README.md)** - Information sur les meilleurs labyrinthes
- **[RA/mazes.md](RA/mazes.md)** - Références bibliographiques

## 🛠️ Technologies

- **Python 3.12**
- **Flask** - Framework web pour l'API HTTP
- **Gunicorn** - Serveur WSGI pour production
- **Pytest** - Framework de tests
- **GitHub Actions** - CI/CD
- **Render** - Hébergement cloud

```bash
# Tous les tests
pytest tests/ -v

# Tests fonctionnels
pytest tests/test_functional.py -v

# Tests API
pytest tests/test_api.py -v

# Tests caractéristiques (qualité du maze)
pytest tests/test_maze_characteristics.py -v

# Tests E2E 
pytest tests/test_e2e.py -v
```

### Tests avec curl

```bash
# Bash
./test_api.sh http://localhost:5000

# PowerShell
.\test_api.ps1 -ApiUrl "http://localhost:5000"
```

## ☁️ Déploiement Cloud

Ce projet peut être déployé sur **Render** avec CI/CD automatique via **GitHub Actions**.

### Guide rapide

1. Créer un compte sur [Render.com](https://render.com)
2. Connecter le repository GitHub
3. Configurer les secrets GitHub (RENDER_API_KEY, RENDER_SERVICE_ID)
4. Push vers `main` → déploiement automatique

### Documentation complète

Voir **[DEPLOYMENT.md](DEPLOYMENT.md)** pour :
- Configuration Render
- Setup CI/CD
- Tests automatiques
- Démonstration du blocage par tests0/api/maze

# Générer un maze 30x30
curl -X POST http://localhost:5000/api/generate-maze \
  -H "Content-Type: application/json" \
  -d '{"width": 30, "height": 30}'
```

#### Voir la documentation complète

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guide complet de déploiement cloud
- **[TESTING.md](TESTING.md)** - Guide des tests (fonctionnels, API, E2E)
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