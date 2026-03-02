# 🚀 Guide de Démarrage Rapide - Jour 3

## ✅ Prérequis
- Python 3.12 installé
- Git installé
- Compte GitHub
- Compte Render (gratuit)

## 📦 Installation

```bash
# Installer les dépendances
pip install -r requirements.txt
```

## 🏃 Lancer le Serveur Local

```bash
python Src/api_server.py
```

Le serveur démarre sur `http://localhost:5000`

## 🧪 Tester l'API

### Méthode 1 : Client Local (recommandé)
```bash
python Src/client_local.py
```

### Méthode 2 : Tests Automatisés
```bash
# Tests unitaires
pytest Src/test_maze_generator.py -v

# Tests API (serveur doit tourner)
pytest Src/test_api.py -v

# Tous les tests
pytest -v
```

### Méthode 3 : Curl
```bash
# Health check
curl http://localhost:5000/health

# Générer maze
curl -X POST http://localhost:5000/generate -H "Content-Type: application/json" -d "{\"width\": 15, \"height\": 15}"
```

## ☁️ Déployer sur Render

### 1. Préparer GitHub
```bash
git init
git add .
git commit -m "Initial commit - Jour 3"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/TER_S2_F.git
git push -u origin main
```

### 2. Configurer Render
1. Aller sur [render.com](https://render.com)
2. Sign up / Login
3. **New** → **Web Service**
4. **Connect Repository** → Sélectionner `TER_S2_F`
5. Render détecte automatiquement `render.yaml`
6. **Create Web Service**

### 3. Attendre le Déploiement
- Render build automatiquement
- URL fournie : `https://VOTRE-APP.onrender.com`
- Health check : `https://VOTRE-APP.onrender.com/health`

### 4. Tester en Cloud
```bash
# Modifier l'URL dans client_local.py
python Src/client_local.py
# Choisir option 2 (Cloud)
# Entrer votre URL Render
```

## 🔄 CI/CD

Les tests s'exécutent automatiquement à chaque push grâce à GitHub Actions.

**Voir les résultats :**
- GitHub → Votre repository → **Actions**

**Pipeline :**
```
Push → Tests unitaires → Tests caractéristiques → ✓ → Render déploie
```

## 🎯 Division du Travail

### Jazi (Backend/Déploiement)
```bash
# Fichiers principaux
Src/api_server.py
requirements.txt
render.yaml
.github/workflows/deploy.yml
```

**Tâches :**
1. Configurer Render
2. Push GitHub
3. Vérifier déploiement
4. Monitoring logs

### Montasser (Tests/Client)
```bash
# Fichiers principaux
Src/test_api.py
Src/test_maze_generator.py
Src/client_local.py
```

**Tâches :**
1. Lancer serveur local
2. Exécuter tous les tests
3. Valider client local
4. Tests curl local/cloud

## 📋 Checklist Finale

- [ ] `pip install -r requirements.txt`
- [ ] Serveur local démarre sans erreur
- [ ] Tests unitaires passent (`pytest Src/test_maze_generator.py`)
- [ ] Tests API passent (`pytest Src/test_api.py`)
- [ ] Client local fonctionne
- [ ] Push GitHub
- [ ] GitHub Actions ✓ vert
- [ ] Render déploie automatiquement
- [ ] Health check cloud OK
- [ ] Client local se connecte au cloud
- [ ] Tests bout en bout cloud OK

## 🐛 Problèmes Courants

### Tests API échouent
**Cause :** Serveur pas lancé
**Solution :** `python Src/api_server.py` dans un terminal séparé

### Import Error
**Cause :** Structure `Src/`
**Solution :** Lancer depuis la racine du projet

### Render déploiement échoue
**Cause :** Tests GitHub Actions échouent
**Solution :** Vérifier logs GitHub Actions, corriger code

### Cold Start Render
**Cause :** Service gratuit en veille après 15min inactivité
**Solution :** Première requête réveille le service (30s)

## 📊 Démonstration Tests

```bash
# Casser volontairement le code
# Dans Src/maze_generator.py, ligne ~180
# Commenter : # self._remove_dead_ends()

# Push
git add .
git commit -m "Test: intentional break"
git push

# Résultat : GitHub Actions échoue, Render ne déploie pas

# Réparer
# Décommenter la ligne
git add .
git commit -m "Fix: restore dead end removal"
git push

# Résultat : GitHub Actions ✓, Render déploie
```

## 🎓 Présentation

**Points à expliquer :**
1. Architecture client-serveur
2. API REST (endpoints, JSON)
3. Tests 3 types (fonctionnels, bout en bout, caractéristiques)
4. CI/CD pipeline (tests auto, déploiement conditionnel)
5. Démonstration échec/succès tests
6. Cloud vs Local

**Démo live :**
1. Montrer serveur local
2. Client local → génération
3. Tests pytest
4. GitHub Actions
5. API cloud
6. Client local → cloud
