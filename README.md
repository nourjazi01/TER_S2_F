# TER_S2_F

## Membres du groupe

- Nour Jazi
- Nour Montasser

## Description du projet

Travail d'Etude et de Recherche (TER) sur la generation algorithmique de labyrinthes dans l'esprit Pac-Man.

## Objectifs

- Generer des labyrinthes sans culs-de-sac (dead ends)
- Garantir des cycles multiples pour la jouabilite
- Assurer une connexite complete du graphe
- Exposer le generateur via une API HTTP (JSON)
- Automatiser tests et deploiement avec CI/CD

## Algorithme retenu

Hybrid Prim-DFS + Braid Maze:

1. Generation hybride de la structure (DFS + selection aleatoire)
2. Placement d'une ghost house 3x3 au centre (optionnelle)
3. Suppression des dead ends selon `dead_end_ratio`
4. Ajout de cycles selon `cycle_intensity`
5. Ajout de tunnels horizontaux wrap-around
6. Export JSON

## Etat actuel

- Generateur fonctionnel
- API Flask operationnelle
- 51 tests automatises
- CI/CD GitHub Actions
- Deploiement automatique Render

Meilleur score observe: **89.2/100**

## Structure du projet

- `Src/`
  - `maze_generator.py`: generation de maze
  - `maze_analyzer.py`: metriques et qualification
  - `ascii_renderer.py`: rendu ASCII
  - `find_best_maze.py`: recherche automatique du meilleur maze
  - `main.py`: point d'entree CLI
- `tests/`
  - `test_functional.py`
  - `test_api.py`
  - `test_maze_characteristics.py`
  - `test_e2e.py`
- `app.py`: serveur Flask (web service)
- `templates/`: interface web
- `.github/workflows/ci-cd.yml`: pipeline CI/CD
- `render.yaml`: configuration Render

## Utilisation locale

### 1) Installation

```bash
pip install -r requirements.txt
```

### 2) Mode CLI

```bash
cd Src
python main.py 15 15
```

### 3) Mode API (Flask)

```bash
python app.py
```

Serveur local: `http://localhost:5000`

## API definie

- `GET /api/maze`
  - Retourne le labyrinthe courant en JSON
- `POST /api/generate-maze`
  - Genere un labyrinthe avec parametres
  - Exemple JSON:

```json
{
  "width": 15,
  "height": 15,
  "playability": 0.5,
  "dead_end_ratio": 0.0,
  "cycle_intensity": 0.5
}
```

- `GET /api/maze-info`
  - Retourne les metadonnees du labyrinthe courant

## Tests

Suite de **51 tests**:

- 13 tests fonctionnels
- 12 tests API
- 19 tests caracteristiques (qualite)
- 7 tests E2E

Execution rapide:

```bash
pytest tests/test_functional.py tests/test_api.py tests/test_maze_characteristics.py -v
```

E2E (local/cloud):

```bash
pytest tests/test_e2e.py -v
```

## CI/CD

Pipeline GitHub Actions:

1. Run tests (core)
2. Si OK: deploy automatique sur Render
3. Si KO: deploiement bloque

Demonstration effectuee: un commit avec erreur intentionnelle a bien ete bloque par les tests.

## Deploiement cloud

Deploiement sur Render avec:

- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`
- `RENDER_APP_URL`

URL de deploiement (production):

- https://ter-s2-f.onrender.com

Voir: `DEPLOYMENT.md`

## Documentation

- `DEPLOYMENT.md`: guide de deploiement cloud
- `TESTING.md`: guide des tests
- `TEST_SYNTHESIS.md`: synthese des tests
- `Src/README.md`: details techniques du code
- `Gallery/README.md`: meilleurs labyrinthes generes
- `RA/ra_jazi.md`: rapport de Nour Jazi
- `RA/ra_montasser.md`: rapport de Nour Montasser
