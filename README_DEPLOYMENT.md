# Déploiement du Générateur de Labyrinthes Pac-Man

## 📦 Architecture

```
┌──────────────┐         HTTP/REST        ┌─────────────────┐
│   Client     │ ◄──────────────────────► │   API Server    │
│   Local      │     GET/POST JSON        │   (Cloud/Local) │
│              │                           │                 │
│ - GUI        │                           │ - Flask         │
│ - Rendu ASCII│                           │ - Generator     │
│ - Tests      │                           │ - Analyzer      │
└──────────────┘                           └─────────────────┘
```

## 🚀 Déploiement sur Render

### Étape 1 : Préparation

1. Push du code sur GitHub
2. Créer un compte sur [render.com](https://render.com)
3. Connecter le repository GitHub

### Étape 2 : Configuration Render

1. Créer un nouveau **Web Service**
2. Sélectionner le repository `TER_S2_F`
3. Configuration automatique via `render.yaml`

**Paramètres :**
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn --bind 0.0.0.0:$PORT Src.api_server:app`
- **Health Check Path:** `/health`

### Étape 3 : Déploiement

Render déploie automatiquement à chaque push sur `main`.

**URL de l'API :** `https://pacman-maze-generator.onrender.com`

## 🧪 Tests

### Tests Locaux

```bash
# Lancer le serveur local
python Src/api_server.py

# Dans un autre terminal
python Src/test_api.py
```

### Tests avec Curl

**Local :**
```bash
# Health check
curl http://localhost:5000/health

# Générer un labyrinthe
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d '{"width": 15, "height": 15}'
```

**Cloud :**
```bash
curl https://pacman-maze-generator.onrender.com/health
curl -X POST https://pacman-maze-generator.onrender.com/generate \
  -H "Content-Type: application/json" \
  -d '{"width": 20, "height": 20}'
```

### Tests Automatisés

```bash
# Tests unitaires
pytest Src/test_maze_generator.py

# Tests API
pytest Src/test_api.py

# Tous les tests
pytest
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Le fichier `.github/workflows/deploy.yml` configure :

1. **Tests automatiques** à chaque push
2. **Validation des caractéristiques** (connexité, dead ends, score)
3. **Notification** si tests OK

### Workflow

```
Push → GitHub → Tests → ✓ Pass → Render Auto-Deploy
                    ↓
                    ✗ Fail → Pas de déploiement
```

### Tester le CI/CD

**Casser volontairement :**
```python
# Dans maze_generator.py, ligne 180
# Commenter la suppression des dead ends
# self._remove_dead_ends()  # ← Commenté
```

**Résultat :** Tests échouent → Pas de déploiement

## 📡 API Documentation

### Endpoints

#### `GET /`
Retourne la documentation de l'API

#### `GET /health`
Vérifie l'état du service
```json
{
  "status": "healthy",
  "service": "maze-generator"
}
```

#### `POST /generate`
Génère un labyrinthe

**Request:**
```json
{
  "width": 15,
  "height": 15
}
```

**Response:**
```json
{
  "success": true,
  "maze": { ... },
  "analysis": {
    "connectivity": true,
    "dead_ends": 0,
    "score": 84.5
  }
}
```

#### `POST /analyze`
Analyse un labyrinthe

**Request:**
```json
{
  "maze": { ... }
}
```

## 🖥️ Client Local

```bash
python Src/client_local.py
```

Le client permet de :
- Se connecter à l'API (local ou cloud)
- Générer des labyrinthes
- Afficher en ASCII
- Sauvegarder en JSON

## 📊 Types de Tests

### 1. Tests Fonctionnels
- Vérification des paramètres (taille 30x30 = 900 cellules)
- Validation de la structure JSON
- Codes de retour HTTP

### 2. Tests Bout en Bout
- Workflow complet : génération → analyse
- Tests en local puis en cloud
- Cohérence des résultats

### 3. Tests Caractéristiques
- Connexité 100%
- Zéro cul-de-sac
- Score qualité ≥ 80
- Distribution des degrés

### 4. Tests Performance
- Temps de réponse < 2s
- Génération 20x20

## 🔧 Développement Local

```bash
# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python Src/api_server.py

# Le serveur est accessible sur http://localhost:5000
```

## 🐛 Debugging

### Logs Render
```bash
# Voir les logs en temps réel
Render Dashboard → Service → Logs
```

### Tester localement avant push
```bash
# Tests complets
pytest -v

# Vérifier l'API
python Src/client_local.py
```

## 📝 Checklist Déploiement

- [ ] Tests locaux passent
- [ ] `requirements.txt` à jour
- [ ] `render.yaml` configuré
- [ ] Push sur GitHub
- [ ] GitHub Actions verts
- [ ] Render déploie automatiquement
- [ ] Tests cloud avec curl
- [ ] Client local se connecte au cloud

## 🎯 Division du Travail

**Jazi :**
- API Flask (`api_server.py`)
- Configuration Render
- CI/CD GitHub Actions
- Documentation déploiement

**Montasser :**
- Tests (`test_api.py`, `test_maze_generator.py`)
- Client local (`client_local.py`)
- Tests bout en bout
- Validation caractéristiques
