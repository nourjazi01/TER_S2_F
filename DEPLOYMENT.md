# Déploiement et CI/CD - Guide Complet

## Architecture du Projet

```
Générateur Local (Votre PC)  ←→  API Cloud (Render)  ←→  Client (Interface Web)
     [Développement]              [Production]              [Visualisation]
```

**Séparation des responsabilités :**
- **Cloud (Render)** : Génération de labyrinthes via API HTTP
- **Local** : Visualisation graphique, tests
- **CI/CD (GitHub Actions)** : Tests automatiques et déploiement

---

## 1. Préparation du Déploiement

### 1.1 Structure des fichiers

Le projet contient maintenant :
```
TER_S2_F/
├── app.py                    # Application Flask (API HTTP)
├── requirements.txt          # Dépendances Python
├── render.yaml              # Configuration Render
├── pytest.ini               # Configuration pytest
├── .github/
│   └── workflows/
│       └── ci-cd.yml        # Pipeline CI/CD
├── tests/                   # Suite de tests
│   ├── test_functional.py   # Tests fonctionnels
│   ├── test_api.py          # Tests API
│   ├── test_maze_characteristics.py  # Tests qualité maze
│   └── test_e2e.py          # Tests bout en bout
├── test_api.sh              # Script de test bash
├── test_api.ps1             # Script de test PowerShell
├── Src/                     # Code source du générateur
└── templates/               # Interface web
```

### 1.2 Vérifier les dépendances

```bash
pip install -r requirements.txt
```

---

## 2. Déploiement sur Render

### 2.1 Créer un compte Render

1. Aller sur [https://render.com](https://render.com)
2. Créer un compte (gratuit)
3. Connecter votre compte GitHub

### 2.2 Créer un Web Service

#### Suivre le tutorial officiel :
[https://render.com/docs/your-first-deploy](https://render.com/docs/your-first-deploy)

#### Étapes rapides :

1. **Dashboard Render** → "New +" → "Web Service"
2. **Connecter le repository GitHub** : `TER_S2_F`
3. **Configuration** :
   - Name: `pacman-maze-generator`
   - Environment: `Python 3`
   - Region: `Frankfurt` (ou le plus proche)
   - Branch: `main`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
   - Instance Type: `Free`

4. **Variables d'environnement** (optionnel) :
   - `PYTHON_VERSION`: `3.12.0`

5. Cliquer "Create Web Service"

### 2.3 Attendre le déploiement

- Le premier déploiement prend 2-5 minutes
- Render va :
  - Cloner le repository
  - Installer les dépendances
  - Lancer le serveur Gunicorn
  - Fournir une URL (ex: `https://pacman-maze-generator.onrender.com`)

### 2.4 Vérifier le déploiement

```bash
# Tester l'API déployée
curl https://votre-app.onrender.com/api/maze
```

---

## 3. Configuration CI/CD avec GitHub Actions

### 3.1 Secrets GitHub

Il faut configurer des secrets dans GitHub pour l'automatisation :

1. **Aller sur GitHub** → Votre repository → Settings → Secrets and variables → Actions
2. **Ajouter les secrets** :

   - `RENDER_API_KEY` :
     - Aller sur [Render Dashboard](https://dashboard.render.com/u/)
     - Account Settings → API Keys
     - Créer une nouvelle clé → Copier
     
   - `RENDER_SERVICE_ID` :
     - Dashboard Render → Votre service
     - Copier l'ID du service (dans l'URL ou Settings)
     
   - `RENDER_APP_URL` :
     - URL complète de votre app (ex: `https://pacman-maze-generator.onrender.com`)

### 3.2 Pipeline CI/CD

Le fichier `.github/workflows/ci-cd.yml` contient 3 jobs :

#### **Job 1: Test** (exécuté sur toutes les branches)
- ✅ Installe les dépendances
- ✅ Exécute les tests fonctionnels
- ✅ Exécute les tests API
- ✅ Exécute les tests de caractéristiques
- ✅ Génère un rapport de couverture

#### **Job 2: Deploy** (uniquement sur `main` après succès des tests)
- ✅ Déclenche le déploiement sur Render via API
- ✅ Attend 60 secondes
- ✅ Exécute les tests E2E sur l'API déployée

#### **Job 3: Test Failure Scenario** (sur les Pull Requests)
- ✅ Vérifie que les tests bloquent le code cassé

---

## 4. Tests

### 4.1 Tests Locaux (Avant Push)

#### Démarrer le serveur local
```bash
python app.py
```

#### Exécuter tous les tests
```bash
pytest tests/ -v
```

#### Tests par catégorie
```bash
# Tests fonctionnels
pytest tests/test_functional.py -v

# Tests API
pytest tests/test_api.py -v

# Tests caractéristiques (connectivité, dead ends)
pytest tests/test_maze_characteristics.py -v
```

#### Tests avec curl (rapide)
```bash
# Bash
./test_api.sh http://localhost:5000

# PowerShell
.\test_api.ps1 -ApiUrl "http://localhost:5000"
```

### 4.2 Tests de Bout en Bout (E2E)

#### Local
```bash
pytest tests/test_e2e.py -v
```

#### Production
```bash
export API_BASE_URL=https://votre-app.onrender.com
pytest tests/test_e2e.py -v
```

### 4.3 Couverture de Code

```bash
pip install pytest-cov
pytest tests/ --cov=Src --cov-report=html
```

Ouvrir `htmlcov/index.html` pour voir le rapport.

---

## 5. Workflow de Développement

### 5.1 Développement d'une nouvelle fonctionnalité

```bash
# 1. Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et tester localement
python app.py
pytest tests/ -v

# 3. Commit
git add .
git commit -m "Add: nouvelle fonctionnalité"

# 4. Push
git push origin feature/nouvelle-fonctionnalite
```

**→ GitHub Actions va automatiquement :**
- ✅ Exécuter les tests
- ✅ Vérifier que tout passe
- ❌ Bloquer si les tests échouent

### 5.2 Merge vers main (Déploiement Automatique)

```bash
# 1. Créer une Pull Request sur GitHub
# 2. Vérifier que les tests passent (GitHub Actions)
# 3. Merger la PR

# Ou en ligne de commande :
git checkout main
git pull origin main
git merge feature/nouvelle-fonctionnalite
git push origin main
```

**→ GitHub Actions va automatiquement :**
1. ✅ Exécuter les tests
2. ✅ Déployer sur Render
3. ✅ Tester l'API déployée

---

## 6. Démonstration : Tests Bloquent le Déploiement

### 6.1 Créer une branche de test

```bash
git checkout -b test-failure
```

### 6.2 Casser délibérément le code

Modifier `Src/maze_generator.py` (ligne ~50) :

```python
def generate(self):
    # DELIBERATELY BROKEN FOR CI/CD DEMO
    raise Exception("This is a test failure!")
    # ... reste du code
```

### 6.3 Commit et Push

```bash
git add Src/maze_generator.py
git commit -m "TEST: Deliberately break maze generation (CI/CD demo)"
git push origin test-failure
```

### 6.4 Observer sur GitHub

1. Aller sur **Actions** dans GitHub
2. Observer le workflow "CI/CD Pipeline"
3. **Résultat attendu** :
   - ❌ Job "Test" échoue
   - ⏸️ Job "Deploy" ne s'exécute pas
   - La PR ne peut pas être mergée

### 6.5 Réparer et Vérifier

```bash
# Annuler le commit cassé
git revert HEAD
git push origin test-failure
```

**Résultat attendu** :
- ✅ Job "Test" passe
- ✅ Déploiement peut maintenant se faire (si mergé vers main)

---

## 7. Utilisation de l'API

### 7.1 Définition de l'API

#### Endpoint 1 : Générer un maze
```http
POST /api/generate-maze
Content-Type: application/json

{
  "width": 30,
  "height": 30,
  "playability": 0.5,
  "dead_end_ratio": 0.0,
  "cycle_intensity": 0.8
}
```

**Réponse** :
```json
{
  "success": true,
  "width": 30,
  "height": 30,
  "maze": {
    "metadata": { ... },
    "cells": { ... }
  },
  "parameters": { ... }
}
```

#### Endpoint 2 : Récupérer le maze actuel
```http
GET /api/maze
```

**Réponse** :
```json
{
  "metadata": {
    "width": 15,
    "height": 15,
    "type": "braid_maze",
    "algorithm": "Hybrid Prim-DFS + dead-end removal",
    "has_ghost_house": true
  },
  "cells": {
    "0,0": {
      "x": 0,
      "y": 0,
      "passages": {
        "N": false,
        "S": true,
        "E": true,
        "W": false
      }
    },
    ...
  }
}
```

#### Endpoint 3 : Informations du maze
```http
GET /api/maze-info
```

### 7.2 Exemples d'utilisation

#### curl
```bash
# Générer un maze 25x25
curl -X POST https://votre-app.onrender.com/api/generate-maze \
  -H "Content-Type: application/json" \
  -d '{"width": 25, "height": 25}'

# Récupérer le maze
curl https://votre-app.onrender.com/api/maze | jq .
```

#### Python
```python
import requests

# Générer un maze
response = requests.post(
    'https://votre-app.onrender.com/api/generate-maze',
    json={'width': 30, 'height': 30}
)
maze_data = response.json()

print(f"Maze généré : {maze_data['width']}x{maze_data['height']}")
```

#### JavaScript
```javascript
// Générer un maze
fetch('https://votre-app.onrender.com/api/generate-maze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    width: 20,
    height: 20,
    playability: 0.7
  })
})
  .then(response => response.json())
  .then(data => {
    console.log('Maze généré:', data);
  });
```

---

## 8. Visualisation Locale (GUI)

### 8.1 Démarrer l'interface locale

```bash
python app.py
```

Ouvrir [http://localhost:5000](http://localhost:5000) dans le navigateur.

### 8.2 Modifier pour utiliser l'API Cloud

Éditer `templates/index.html` pour pointer vers l'API Render :

```javascript
// Remplacer
const API_URL = '/api/generate-maze';

// Par
const API_URL = 'https://votre-app.onrender.com/api/generate-maze';
```

---

## 9. Monitoring et Debugging

### 9.1 Logs Render

1. Dashboard Render → Votre service → "Logs"
2. Voir les requêtes en temps réel
3. Identifier les erreurs

### 9.2 Vérifier la santé

```bash
# Health check
curl https://votre-app.onrender.com/api/maze

# Si erreur 500, vérifier les logs Render
```

### 9.3 Logs GitHub Actions

1. GitHub → Actions → Workflow récent
2. Cliquer sur un job pour voir les détails
3. Examiner les étapes qui ont échoué

---

## 10. Types de Tests - Résumé

| Type | Fichier | Objectif | Quand |
|------|---------|----------|-------|
| **Fonctionnels** | `test_functional.py` | Dimensions, structure JSON | Avant commit |
| **API** | `test_api.py` | Endpoints HTTP, validation | Avant commit |
| **Caractéristiques** | `test_maze_characteristics.py` | Connectivité, dead ends, cycles | Avant commit |
| **End-to-End** | `test_e2e.py` | API déployée (local/cloud) | Après déploiement |
| **curl** | `test_api.sh`, `test_api.ps1` | Tests manuels rapides | Ad-hoc |

---

## 11. Troubleshooting

### Problème : Tests échouent en local mais pas sur GitHub Actions
- Vérifier la version Python (`python --version`)
- Vérifier les dépendances (`pip list`)
- Nettoyer le cache : `rm -rf __pycache__ .pytest_cache`

### Problème : Déploiement Render échoue
- Vérifier `requirements.txt` (dépendances complètes)
- Vérifier les logs Render
- S'assurer que `gunicorn` est dans les dépendances

### Problème : API ne répond pas
- Vérifier que le service Render est "Running"
- Tester en local d'abord
- Vérifier les logs d'erreur

### Problème : GitHub Actions ne se déclenche pas
- Vérifier que le fichier `.github/workflows/ci-cd.yml` existe
- Vérifier la branche (doit être `main` pour deploy)
- Vérifier les secrets GitHub (API keys)

---

## 12. Best Practices

✅ **Toujours tester en local avant de push**
```bash
pytest tests/ -v
```

✅ **Utiliser des branches pour les fonctionnalités**
```bash
git checkout -b feature/ma-fonctionnalite
```

✅ **Écrire des tests pour chaque nouvelle fonctionnalité**

✅ **Vérifier les logs après déploiement**

✅ **Maintenir `requirements.txt` à jour**
```bash
pip freeze > requirements.txt
```

✅ **Documenter les changements d'API**

---

## 13. Ressources

- [Render Docs - First Deploy](https://render.com/docs/your-first-deploy)
- [Render Docs - Deploys](https://render.com/docs/deploys)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Pytest Documentation](https://docs.pytest.org/)
- [REST API Guide](https://realpython.com/api-integration-in-python/)

---

## 14. Checklist de Déploiement

- [ ] Compte Render créé
- [ ] Repository GitHub connecté à Render
- [ ] Web Service Render configuré
- [ ] Secrets GitHub configurés (RENDER_API_KEY, RENDER_SERVICE_ID, RENDER_APP_URL)
- [ ] Tests locaux passent (`pytest tests/ -v`)
- [ ] CI/CD workflow testé (test-failure branch)
- [ ] API déployée fonctionne (`curl https://votre-app.onrender.com/api/maze`)
- [ ] Tests E2E passent sur l'API déployée
- [ ] Documentation mise à jour

---

**Votre générateur de labyrinthes Pac-Man est maintenant dans le cloud !** 🎮☁️
