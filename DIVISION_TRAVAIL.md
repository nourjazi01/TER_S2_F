# 👥 Division du Travail - Jour 3

## 📊 Vue d'Ensemble

```
┌─────────────────────┐           ┌──────────────────────┐
│     JAZI            │           │     MONTASSER        │
│  Backend / Cloud    │           │   Tests / Client     │
├─────────────────────┤           ├──────────────────────┤
│ - API Flask         │           │ - Tests unitaires    │
│ - Config Render     │           │ - Tests API          │
│ - CI/CD Pipeline    │           │ - Tests bout en bout │
│ - Déploiement       │           │ - Client local       │
│ - Monitoring        │           │ - Validation         │
└─────────────────────┘           └──────────────────────┘
         │                                   │
         └───────────────┬───────────────────┘
                         ▼
              🎯 Projet Jour 3 Complet
```

---

## 🔵 JAZI - Backend & Déploiement

### 📁 Fichiers Principaux
```
Src/api_server.py           ← Vous avez créé
requirements.txt            ← Vous avez créé
render.yaml                 ← Vous avez créé
.github/workflows/deploy.yml ← Vous avez créé
```

### ✅ Tâches

#### 1. Comprendre l'API (30 min)
```bash
# Lire et comprendre
cat Src/api_server.py

# Points importants:
# - Flask application
# - CORS activé
# - 4 endpoints: /, /health, /generate, /analyze
# - Validation paramètres
# - Gestion erreurs
```

**Questions à se poser:**
- Que fait chaque endpoint ?
- Comment Flask gère les requêtes POST ?
- Pourquoi CORS est nécessaire ?
- Comment gunicorn démarre l'app ?

#### 2. Tester l'API Localement (45 min)
```bash
# Terminal 1: Lancer serveur
cd c:\Users\USER\Desktop\TER_S2_F
python Src/api_server.py

# Terminal 2: Tester
curl http://localhost:5000/health

# Ou avec PowerShell:
Invoke-RestMethod http://localhost:5000/health
```

**Checklist:**
- [ ] Serveur démarre sans erreur
- [ ] /health retourne "healthy"
- [ ] /generate crée un maze
- [ ] Logs visibles dans Terminal 1

#### 3. Créer Repository GitHub (30 min)
```bash
# Dans le dossier TER_S2_F
git init
git add .
git commit -m "Jour 3: API HTTP et déploiement cloud"
git branch -M main

# Sur github.com: créer nouveau repository "TER_S2_F"
git remote add origin https://github.com/VOTRE_USERNAME/TER_S2_F.git
git push -u origin main
```

**Vérifier:**
- [ ] Tous les fichiers sont sur GitHub
- [ ] .gitignore fonctionne (__pycache__ pas uploadé)
- [ ] README visible

#### 4. GitHub Actions (20 min)
```bash
# Aller sur GitHub → votre repository → Actions
# Vérifier que le workflow "CI/CD Pipeline" s'est exécuté
```

**Si vert ✓:**
- Tests passent
- Prêt pour déploiement

**Si rouge ✗:**
- Lire les logs
- Corriger erreur
- Re-push

#### 5. Déploiement Render (45 min)

**Étape A: Créer compte**
1. Aller sur [render.com](https://render.com)
2. Sign up (gratuit)
3. Vérifier email

**Étape B: Déployer**
1. Dashboard → **New** → **Web Service**
2. **Connect GitHub** → Autoriser Render
3. Sélectionner repository `TER_S2_F`
4. Render détecte `render.yaml`
5. **Create Web Service**

**Étape C: Attendre build (~5 min)**
- Render installe dépendances
- Lance tests
- Démarre service

**Étape D: Obtenir URL**
- Render fournit: `https://VOTRE-APP.onrender.com`
- Copier cette URL

#### 6. Validation Cloud (20 min)
```bash
# Remplacer YOUR-APP par votre nom
curl https://YOUR-APP.onrender.com/health

# Si première requête: attendre 15-30s (cold start)
# Requêtes suivantes: rapides
```

**Tester:**
```bash
curl -X POST https://YOUR-APP.onrender.com/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 15, \"height\": 15}"
```

#### 7. Documentation (15 min)
Mettre à jour `README_DEPLOYMENT.md`:
```markdown
## URL de l'API

**Cloud (Production):** https://VOTRE-APP.onrender.com
```

### 📝 Rapport d'Activité
Compléter `RA/ra_jazi_jour3.md`:
- Difficultés rencontrées
- Solutions trouvées
- URL de l'API déployée
- Screenshots Render dashboard

### 🎯 Livrables Jazi
- [x] API fonctionnelle en local
- [ ] Repository GitHub créé et pushé
- [ ] GitHub Actions configuré (badge vert)
- [ ] Service déployé sur Render
- [ ] URL API cloud documentée
- [ ] Tests health check cloud OK
- [ ] RA complété

---

## 🟢 MONTASSER - Tests & Validation

### 📁 Fichiers Principaux
```
Src/test_api.py              ← Vous avez créé
Src/test_maze_generator.py   ← Vous avez créé
Src/client_local.py          ← Vous avez créé
Src/verify_deployment.py     ← Script helper
```

### ✅ Tâches

#### 1. Comprendre les Tests (30 min)
```bash
# Lire et comprendre
cat Src/test_api.py

# 4 classes de tests:
# - TestAPIFunctional: 5 tests
# - TestMazeCharacteristics: 5 tests
# - TestEndToEnd: 2 tests
# - TestPerformance: 1 test
```

**Questions à se poser:**
- Que teste chaque fonction ?
- Comment pytest fonctionne ?
- Qu'est-ce qu'un assert ?
- Différence test unitaire vs bout en bout ?

#### 2. Lancer Tests Unitaires (20 min)
```bash
cd c:\Users\USER\Desktop\TER_S2_F

# Tests du générateur
pytest Src/test_maze_generator.py -v

# Résultat attendu: 5 passed
```

**Vérifier:**
- [ ] test_initialization ✓
- [ ] test_generate_creates_maze ✓
- [ ] test_correct_dimensions ✓
- [ ] test_no_dead_ends ✓
- [ ] test_full_connectivity ✓

#### 3. Lancer Serveur + Tests API (30 min)
```bash
# Terminal 1: Serveur
python Src/api_server.py

# Terminal 2: Tests
# IMPORTANT: Modifier URL dans test_api.py si nécessaire
pytest Src/test_api.py -v

# Résultat attendu: 13 passed
```

**Analyser les résultats:**
- Quels tests échouent ? Pourquoi ?
- Temps d'exécution de chaque test ?
- Logs du serveur pendant tests ?

#### 4. Tester Client Local (30 min)
```bash
# AVEC serveur qui tourne
python Src/client_local.py

# Sélectionner:
# 1. Local
# Taille: 15x15
```

**Vérifier:**
- [ ] Connexion établie
- [ ] Maze généré
- [ ] ASCII affiché correctement
- [ ] Statistiques affichées
- [ ] Sauvegarde fonctionne

#### 5. Tests Curl (20 min)
```bash
# Suivre CURL_TESTS.md

# Test 1: Health
curl http://localhost:5000/health

# Test 2: Génération défaut
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json"

# Test 3: Taille 30x30 (validation fonctionnelle)
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 30, \"height\": 30}"

# Vérifier JSON: 900 cellules ?
```

#### 6. Tests Caractéristiques (30 min)

Créer script de validation `test_characteristics.sh`:
```bash
#!/bin/bash
echo "Tests des caractéristiques maze..."

# Générer 5 mazes
for i in {1..5}; do
  echo "Maze $i:"
  curl -X POST http://localhost:5000/generate \
    -H "Content-Type: application/json" \
    -d "{\"width\": 15, \"height\": 15}" \
    | grep -E "connectivity|dead_ends|score"
done
```

**Valider:**
- Tous: connectivity = true
- Tous: dead_ends = 0
- Tous: score >= 80

#### 7. Tests Bout en Bout (45 min)

**Workflow complet:**
```bash
# 1. Vérifier service
curl http://localhost:5000/health

# 2. Générer et sauvegarder
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 20, \"height\": 20}" \
  -o test_maze.json

# 3. Vérifier fichier
cat test_maze.json

# 4. Utiliser client avec ce maze (visualisation)
python Src/client_local.py
```

#### 8. Tests Cloud (après déploiement Jazi) (30 min)

```bash
# Obtenir URL de Jazi
# Modifier test_api.py ligne 11:
API_BASE_URL = "https://VOTRE-APP.onrender.com"

# Re-lancer tests
pytest Src/test_api.py -v

# Client local mode cloud
python Src/client_local.py
# Option 2: Cloud
# URL: https://VOTRE-APP.onrender.com
```

**Comparer:**
- Temps réponse local vs cloud
- Erreurs différentes ?
- Cold start impact ?

#### 9. Documentation Tests (20 min)

Créer `TEST_REPORT.md`:
```markdown
# Rapport de Tests - Jour 3

## Tests Unitaires
- Exécutés: 5
- Passés: 5
- Échoués: 0

## Tests API
- Exécutés: 13
- Passés: 13
- Échoués: 0

## Tests Caractéristiques
[Tableau avec 5 mazes générés]

## Tests Cloud
- URL: https://...
- Latence moyenne: XXXms
- Succès rate: 100%
```

### 📝 Rapport d'Activité
Compléter `RA/ra_montasser_jour3.md`:
- Tous les tests exécutés
- Résultats (screenshots)
- Problèmes rencontrés
- Métriques (temps, succès rate)

### 🎯 Livrables Montasser
- [ ] Tests unitaires exécutés et validés
- [ ] Tests API exécutés (local)
- [ ] Client local fonctionnel
- [ ] Tests curl documentés
- [ ] Tests caractéristiques validés
- [ ] Tests bout en bout complets
- [ ] Tests cloud (après déploiement)
- [ ] Rapport tests créé
- [ ] RA complété

---

## 🤝 Tâches Partagées

### Démonstration CI/CD (ensemble, 45 min)

**Préparation:**
- Jazi: Repository GitHub configuré
- Montasser: Tests locaux validés

**Scénario 1: Code Correct**
```bash
# Jazi commit et push
git add .
git commit -m "Working version"
git push

# Montasser observe:
# - GitHub Actions (badge vert)
# - Render dashboard (auto-deploy)
```

**Scénario 2: Code Cassé**
```bash
# Jazi édite maze_generator.py
# Ligne ~180: Commenter
# self._remove_dead_ends()

git add .
git commit -m "Intentional break for CI/CD demo"
git push

# Montasser observe:
# - GitHub Actions (badge rouge ✗)
# - Tests échouent: dead_ends > 0
# - Render NE déploie PAS
```

**Scénario 3: Réparation**
```bash
# Jazi décommente la ligne
git add .
git commit -m "Fix: restore dead end removal"
git push

# Montasser observe:
# - GitHub Actions (badge vert ✓)
# - Render déploie automatiquement
```

---

## 📊 Planning Suggéré

### Matin (9h-12h) - Travail Parallèle

**Jazi:**
- 9h00-9h30: Comprendre API
- 9h30-10h15: Tests locaux API
- 10h15-10h45: GitHub setup
- 10h45-11h00: Pause
- 11h00-12h00: Render configuration

**Montasser:**
- 9h00-9h30: Comprendre tests
- 9h30-10h00: Tests unitaires
- 10h00-10h45: Tests API local
- 10h45-11h00: Pause
- 11h00-11h30: Client local
- 11h30-12h00: Tests curl

### Midi (12h-13h30) - Pause

### Après-midi (13h30-17h) - Intégration

**13h30-14h00:** Point d'avancement
- Jazi: Statut déploiement
- Montasser: Résultats tests locaux

**14h00-15h00:** Finalisation déploiement (Jazi)
- Montasser: Tests cloud pendant ce temps

**15h00-15h15:** Pause

**15h15-16h00:** Démonstration CI/CD (ensemble)

**16h00-17h00:** Documentation et rapports

---

## 🎯 Critères de Succès Jour 3

### Minimum Viable
- [x] API fonctionne en local
- [ ] Tests passent en local
- [ ] Repository GitHub créé
- [ ] CI/CD pipeline configuré

### Objectif Standard
- [ ] API déployée sur Render
- [ ] Tests passent en cloud
- [ ] Client local connecte au cloud
- [ ] Démonstration CI/CD réussie

### Excellence
- [ ] Documentation complète
- [ ] Rapports détaillés
- [ ] Screenshots/vidéo démo
- [ ] Prêts pour présentation

---

## 💬 Communication

### Checkpoints
1. **10h00:** "Tests locaux OK ?"
2. **12h00:** "GitHub + Render configurés ?"
3. **14h00:** "Cloud accessible ?"
4. **16h00:** "CI/CD démo faite ?"

### Outils
- GitHub Issues pour bugs
- Commits clairs et descriptifs  
- Documentation au fur et à mesure

---

## 🆘 Aide

### Jazi Bloqué ?
```bash
# Tests locaux d'abord
python Src/verify_deployment.py

# Render logs
Dashboard → Service → Logs → Events
```

### Montasser Bloqué ?
```bash
# Serveur lancé ?
curl http://localhost:5000/health

# pytest installé ?
pip install -r requirements.txt
```

### Ensemble Bloqués ?
→ Revoir `QUICKSTART_JOUR3.md`
→ Consulter `README_DEPLOYMENT.md`
→ Tests curl dans `CURL_TESTS.md`
