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


---

## Jour 2 - 13/02/2026

### Tâches réalisées

**Modules développés (ma responsabilité) :**
- ✅ `ascii_renderer.py` - Rendu Unicode box-drawing (~120 lignes)
- ✅ `maze_analyzer.py` - Suite tests qualification (~200 lignes)
- ✅ `find_best_maze.py` - Sélection automatique meilleur maze

**Collaboration :**
- Division tâches : génération (Jazi) / visualisation + tests (Montasser)
- Intégration modules Python

### Rendu ASCII

**Caractères Unicode utilisés :**
- Base : `─ │`
- Coins : `┌ ┐ └ ┘`
- Intersections : `├ ┤ ┬ ┴ ┼`

### Tests de qualification

**4 types de tests :**
1. Connexité (BFS)
2. Culs-de-sac
3. Distribution degrés
4. Score Pac-Man (0-100)

**Formule score :** 40% connexité + 40% anti-dead-ends + 20% cycles

### Résultats

**Meilleur labyrinthe 15x15 :**
- Connexité : 100%
- Culs-de-sac : 0
- Score : 84.8/100

**10 labyrinthes testés :**
- Moyenne : 84.3/100
- Min : 83.4 / Max : 84.8

### Difficultés
- Gestion intersections Unicode (16 cas)
- Calibration poids du score

### Prochaine séance
- Export PNG automatique
- Visualisation graphique (Pygame)
- Tests de performance

---

## Jour 3 - 05/03/2026

### Tâches réalisées

**API Web Flask (ma responsabilité) :**
- ✅ `app.py` - Serveur Flask avec API REST (~150 lignes)
- ✅ 4 endpoints HTTP fonctionnels
- ✅ Support paramètres de génération via query strings
- ✅ Templates HTML pour interface web
- ✅ Gestion configuration PORT pour cloud

**Tests Automatisés (ma partie) :**
- ✅ 19 tests caractéristiques (connexité, dead ends, cycles, score qualité)
- ✅ 12 tests API (endpoints HTTP, codes statut, validation JSON)
- ✅ Basés sur `maze_analyzer.py` et les endpoints Flask

*Tests fonctionnels (13) et E2E (7) réalisés par Jazi*

**Endpoints API développés :**

1. **GET /** - Interface web accueil
   - Template HTML avec formulaire
   - Documentation API interactive

2. **GET /api/maze** - Récupération maze courant
   - Format JSON structuré
   - Métadonnées incluses

3. **POST /api/generate-maze** - Génération nouveau maze
   - Paramètres : width, height, ghost_house, playability
   - Validation entrées utilisateur
   - Retour JSON avec maze généré

4. **GET /api/maze-info** - Informations détaillées
   - Dimensions, ghost house, playability
   - Statistiques du maze actuel

### Architecture API

**Structure requête/réponse :**
```python
# Génération maze
POST /api/generate-maze
Params: width=15, height=15, ghost_house=true

→ Response 200 OK
{
  "maze": {...walls...},
  "width": 15,
  "height": 15,
  "ghost_house": true,
  "playability": "medium"
}
```

**Gestion d'état :**
- Variable globale `current_maze` pour stockage maze actuel
- Initialisation au démarrage avec maze par défaut
- Mise à jour à chaque génération

### Intégration production

**Configuration serveur :**
- Développement : Flask dev server (port 5000)
- Production : Gunicorn WSGI server
- Support variable d'environnement `PORT` pour Render

**Validation API :**
- 12 tests API automatisés (pytest-flask)
- Tests codes statut HTTP (200, 400, 404)
- Tests format JSON réponses
- Tests validation paramètres

### Collaboration avec déploiement

**Fourni à Jazi pour CI/CD :**
- Liste dépendances Python (Flask 3.0.0, Werkzeug 3.0.1)
- Points d'entrée pour tests (app fixture pytest)
- Documentation endpoints pour tests E2E
- Health check endpoint pour monitoring Render

### Résultats

**Tests API locaux :**
- 12/12 tests passent (100%)
- Temps réponse : <50ms génération
- Validation JSON : OK

**Performance :**
- Génération 15x15 : ~10ms
- Génération 30x30 : ~40ms
- Mémoire : <50MB

### Difficultés rencontrées

**Problème 1 : Variables globales Flask**
- Cause : current_maze modifiée sans déclaration global
- Solution : Ajout `global current_maze` dans fonctions

**Problème 2 : Validation paramètres**
- Cause : Types mixtes (string/int) des query params
- Solution : Conversion explicite avec gestion erreurs

**Problème 3 : CORS en développement**
- Cause : Appels API depuis différents ports
- Solution : Configuration Flask pour accepter requêtes locales

### Templates HTML créés

- `templates/index.html` - Page accueil avec formulaire
- Interface utilisateur simple pour démo
- Liens vers API endpoints

### Stack technique API

- **Framework** : Flask 3.0.0
- **WSGI** : Gunicorn 21.2.0 (production)
- **Templating** : Jinja2 (inclus Flask)
- **Serialization** : JSON natif Python
- **Testing** : pytest-flask 1.3.0

### Prochaines étapes
- Améliorer interface HTML (CSS/JavaScript)
- Ajouter visualisation maze côté client
- Monitoring métriques API (temps réponse, usage)
- Documentation OpenAPI/Swagger possible

