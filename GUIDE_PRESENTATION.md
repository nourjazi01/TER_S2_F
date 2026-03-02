# 🎤 Guide de Présentation - Jour 3

## 📋 Structure de Présentation (20-30 min)

### 1. Introduction (2 min)

**Slide 1: Titre**
```
Jour 3 : Déploiement Cloud et API HTTP
Générateur de Labyrinthes Pac-Man

Équipe:
- Jazi: Backend & Déploiement Cloud
- Montasser: Tests & Validation
```

**Slide 2: Objectifs Jour 3**
- ✅ Transformer générateur local en Web Service
- ✅ API HTTP REST pour communication
- ✅ Déploiement dans le cloud (Render)
- ✅ Suite de tests complète
- ✅ CI/CD pipeline automatisé

---

### 2. Architecture (5 min)

**Slide 3: Architecture Client-Serveur**
```
┌──────────────┐         HTTP/REST        ┌─────────────────┐
│   Client     │ ◄──────────────────────► │   API Server    │
│   Local      │     GET/POST JSON        │   (Cloud)       │
├──────────────┤                           ├─────────────────┤
│ - GUI        │                           │ - Flask App     │
│ - Rendu      │                           │ - Generator     │
│ - Tests      │                           │ - Analyzer      │
└──────────────┘                           └─────────────────┘
     ▲                                             │
     │                                             │
     └────── Visualisation Locale ────────────────┘
```

**Points à mentionner:**
- Séparation frontend/backend
- Communication JSON
- Client peut être n'importe où
- API accessible mondialement

**Slide 4: Stack Technique**

**Backend:**
- Python 3.12
- Flask (micro-framework web)
- Gunicorn (serveur WSGI production)
- Flask-CORS (requêtes cross-origin)

**Tests:**
- pytest (framework de tests)
- requests (client HTTP)

**Déploiement:**
- GitHub (versioning)
- GitHub Actions (CI/CD)
- Render (cloud platform)

---

### 3. API HTTP (Jazi - 7 min)

**Slide 5: Définition de l'API**

| Endpoint | Méthode | Description | Paramètres |
|----------|---------|-------------|------------|
| `/` | GET | Documentation | - |
| `/health` | GET | Health check | - |
| `/generate` | POST | Génère maze | width, height |
| `/analyze` | POST | Analyse maze | maze (JSON) |

**Slide 6: Exemple Requête/Réponse**

**Request:**
```json
POST /generate
{
  "width": 15,
  "height": 15
}
```

**Response:**
```json
{
  "success": true,
  "maze": {
    "metadata": {...},
    "cells": {...}
  },
  "analysis": {
    "connectivity": true,
    "dead_ends": 0,
    "score": 84.5
  }
}
```

**Slide 7: Code API (extrait)**
```python
@app.route('/generate', methods=['POST'])
def generate_maze():
    data = request.get_json() or {}
    width = data.get('width', 15)
    height = data.get('height', 15)
    
    # Validation
    if width < 3 or width > 100:
        return jsonify({"error": "Invalid size"}), 400
    
    # Génération
    generator = MazeGenerator(width, height)
    maze = generator.generate()
    
    return jsonify({"success": True, "maze": maze})
```

**Live Demo:**
```bash
# Health check
curl https://VOTRE-APP.onrender.com/health

# Générer maze
curl -X POST https://VOTRE-APP.onrender.com/generate \
  -H "Content-Type: application/json" \
  -d '{"width": 15, "height": 15}'
```

---

### 4. Tests (Montasser - 7 min)

**Slide 8: Stratégie de Tests**

**3 Types de Tests:**

1. **Tests Fonctionnels**
   - Validation paramètres
   - Codes HTTP corrects
   - Structure JSON valide

2. **Tests Caractéristiques**
   - Connexité 100%
   - Zéro cul-de-sac
   - Score qualité ≥ 80

3. **Tests Bout en Bout**
   - Workflow complet
   - Local → Cloud
   - Cohérence résultats

**Slide 9: Exemples de Tests**

```python
def test_generate_custom_size():
    """Vérifier taille 30x30 = 900 cellules."""
    payload = {"width": 30, "height": 30}
    response = requests.post(f"{API_URL}/generate", json=payload)
    
    assert response.status_code == 200
    maze = response.json()['maze']
    assert maze['metadata']['width'] == 30
    assert len(maze['cells']) == 900  # 30 * 30

def test_no_dead_ends():
    """Braid Maze : zéro cul-de-sac."""
    response = requests.post(f"{API_URL}/generate")
    analysis = response.json()['analysis']
    assert analysis['dead_ends'] == 0
```

**Slide 10: Résultats Tests**

```
======================== test session starts ========================
collected 18 items

Src/test_maze_generator.py::test_initialization PASSED      [  5%]
Src/test_maze_generator.py::test_generate_creates_maze PASSED [11%]
Src/test_maze_generator.py::test_correct_dimensions PASSED  [16%]
Src/test_maze_generator.py::test_no_dead_ends PASSED        [22%]
Src/test_maze_generator.py::test_full_connectivity PASSED   [27%]
Src/test_api.py::test_health_endpoint PASSED                [33%]
Src/test_api.py::test_generate_default_maze PASSED          [38%]
Src/test_api.py::test_generate_custom_size PASSED           [44%]
...
======================== 18 passed in 3.42s ========================
```

**Live Demo:**
```bash
pytest Src/test_api.py -v
```

---

### 5. CI/CD Pipeline (Ensemble - 7 min)

**Slide 11: Workflow CI/CD**

```
┌──────────────┐
│  Developer   │
│  git push    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  GitHub Actions      │
│  - Install deps      │
│  - Run unit tests    │
│  - Check maze tests  │
└──────┬───────┬───────┘
       │       │
    ✓ OK    ✗ FAIL
       │       │
       │       └─────► ❌ Arrêt (pas de déploiement)
       │
       ▼
┌──────────────────────┐
│  Render              │
│  - Build image       │
│  - Deploy service    │
│  - Run health check  │
└──────────────────────┘
       │
       ▼
    🚀 Production
```

**Slide 12: Configuration GitHub Actions**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest Src/test_maze_generator.py -v
      - name: Check characteristics
        run: |
          # Vérifier: connexité, dead ends, score
```

**Slide 13: Configuration Render**

```yaml
# render.yaml
services:
  - type: web
    name: pacman-maze-generator
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn Src.api_server:app
    healthCheckPath: /health
```

**Live Demo - Scénario Échec:**
1. Montrer code actuel (fonctionnel)
2. Commenter `self._remove_dead_ends()`
3. Commit + Push
4. Montrer GitHub Actions → ❌ rouge
5. Montrer Render → Pas de nouveau déploiement

**Live Demo - Scénario Succès:**
1. Décommenter la ligne
2. Commit + Push
3. Montrer GitHub Actions → ✓ vert
4. Montrer Render → Déploiement automatique

---

### 6. Démonstration Live (5 min)

**Slide 14: Démonstration Client Local**

```bash
# Lancer client
python Src/client_local.py

# Choisir: Cloud
# URL: https://pacman-maze-generator.onrender.com

# Générer: 20x20
```

**Montrer:**
- Connexion API cloud
- Génération labyrinthe
- Affichage ASCII
- Statistiques (connexité, dead ends, score)
- Sauvegarde JSON

---

### 7. Métriques & Résultats (3 min)

**Slide 15: Métriques**

| Métrique | Local | Cloud |
|----------|-------|-------|
| Temps réponse (15x15) | ~200ms | ~400ms |
| Temps réponse (30x30) | ~800ms | ~1200ms |
| Disponibilité | N/A | 99.9% |
| Tests passés | 18/18 | 18/18 |
| Score qualité moyen | 84.5 | 84.5 |

**Slide 16: Tests Validés**

✅ **Tests Fonctionnels:**
- Validation taille 30x30 = 900 cellules
- Paramètres invalides → 400 Bad Request
- Structure JSON correcte

✅ **Tests Caractéristiques:**
- Connexité 100% sur 100 générations
- Zéro cul-de-sac sur 100 générations
- Score moyen: 84.5/100

✅ **Tests Bout en Bout:**
- Workflow complet validé
- Local ↔ Cloud cohérent

---

### 8. Conclusion (2 min)

**Slide 17: Réalisations Jour 3**

✅ **API HTTP REST** opérationnelle
✅ **18 tests automatisés** (100% success)
✅ **CI/CD pipeline** avec GitHub Actions
✅ **Déploiement cloud** sur Render
✅ **Client local** connecté au cloud
✅ **Documentation complète**

**Slide 18: Prochaines Étapes (Jour 4)**

🔮 **Améliorations possibles:**
- Authentification (API keys)
- Rate limiting
- Cache Redis
- WebSocket temps réel
- Container Docker
- Monitoring Prometheus/Grafana

---

## 🎯 Conseils Présentation

### Avant

- [ ] Tester démo live (internet fonctionne ?)
- [ ] Préparer fenêtres terminaux
- [ ] Avoir URL Render prête
- [ ] Screenshots de backup si démo échoue
- [ ] Chronométrer (ne pas dépasser temps)

### Pendant

**Jazi parle de:**
- Architecture
- API endpoints
- Déploiement Render
- Partie démo CI/CD

**Montasser parle de:**
- Tests (3 types)
- Résultats tests
- Client local
- Validation caractéristiques

**Ensemble:**
- Démonstration CI/CD (échec/succès)
- Questions/réponses

### Après

- Montrer code sur écran
- Expliquer choix techniques
- Répondre aux questions
- Accepter feedback

---

## ❓ Questions Prévisibles

### Q1: "Pourquoi Flask et pas Django ?"
**R:** Flask est minimaliste, parfait pour une API simple. Django est trop lourd pour notre besoin (pas de base de données, pas d'admin, etc.).

### Q2: "Render gratuit = limitations ?"
**R:** Oui:
- Service en veille après 15min (cold start 30s)
- 750h/mois gratuit (suffisant pour démo)
- Pas de SLA 99.99%
Pour production: upgrade plan payant.

### Q3: "Sécurité de l'API ?"
**R:** Actuellement aucune authentification (démo). Pour production:
- API keys
- Rate limiting (éviter spam)
- HTTPS (inclus par Render)
- Input validation (déjà fait)

### Q4: "Tests suffisants ?"
**R:** Pour MVP oui. Manque:
- Tests de charge (locust)
- Tests sécurité
- Tests d'intégration plus poussés
- Coverage report

### Q5: "Différence tests fonctionnels vs caractéristiques ?"
**R:**
- **Fonctionnels:** L'API fonctionne correctement ? (HTTP, JSON, validation)
- **Caractéristiques:** Le maze généré est bon ? (connexité, dead ends, score)

### Q6: "Si GitHub Actions échoue ?"
**R:** Le déploiement est bloqué. La version précédente reste en production. On doit corriger le code et re-push.

### Q7: "Temps de développement ?"
**R:**
- Jazi: ~5h (API, config, déploiement)
- Montasser: ~5h (tests, client, validation)
- Total: ~10h (1 journée complète)

---

## 📸 Captures d'Écran à Préparer

1. **GitHub Repository**
   - Liste fichiers
   - Commits
   - Actions (badge vert)

2. **GitHub Actions**
   - Workflow passé (vert)
   - Workflow échoué (rouge)
   - Détails logs

3. **Render Dashboard**
   - Service running
   - Logs déploiement
   - Metrics

4. **Tests pytest**
   - Terminal avec tests passés
   - Coverage si disponible

5. **Client Local**
   - Menu
   - Maze en ASCII
   - Statistiques

6. **Curl/API**
   - Health check
   - Generate response

---

## 🎬 Script Démo

**[0:00] Introduction**
> "Bonjour, aujourd'hui nous présentons notre travail du jour 3: la transformation de notre générateur local en web service dans le cloud."

**[0:30] Architecture**
> "Jazi: Nous avons séparé le système en deux parties: le client local pour la visualisation, et l'API dans le cloud pour la génération."

**[2:00] API**
> "Jazi: L'API expose 4 endpoints REST. Le principal est /generate qui prend en paramètres la taille et retourne un maze en JSON. Démonstration..."
> [Curl live]

**[5:00] Tests**
> "Montasser: Nous avons développé 18 tests automatisés répartis en 3 catégories. Par exemple, ce test vérifie qu'un maze 30x30 contient bien 900 cellules..."
> [pytest live]

**[10:00] CI/CD**
> "Ensemble: Voici notre pipeline CI/CD. À chaque push, GitHub Actions exécute les tests. Si ils passent, Render déploie automatiquement. Démonstration avec un code intentionnellement cassé..."
> [Demo échec/succès]

**[17:00] Client Local**
> "Montasser: Le client local peut se connecter soit à l'API locale soit au cloud. Voici une génération en direct..."
> [Client local live]

**[20:00] Conclusion**
> "En résumé, nous avons une API fonctionnelle, 18 tests qui passent, un CI/CD automatisé et un déploiement cloud opérationnel. Questions ?"

---

## ✅ Checklist Présentation

### Avant la présentation
- [ ] Slides préparées (PowerPoint/PDF)
- [ ] Démo testée (avec internet)
- [ ] Code accessible (VS Code ouvert)
- [ ] GitHub Actions badge vert
- [ ] Render service running
- [ ] URL API notée
- [ ] Terminaux prêts (serveur, tests, client)
- [ ] Screenshots de backup
- [ ] Temps répété (ne pas dépasser)

### Pendant la présentation
- [ ] Parler clairement et lentement
- [ ] Montrer le code (pas juste les slides)
- [ ] Démonstration live (pas video)
- [ ] Expliquer choix techniques
- [ ] Répondre aux questions

### Après la présentation
- [ ] Demander feedback
- [ ] Noter questions intéressantes
- [ ] Partager URL API (si demandé)
- [ ] Préparer rapport final
