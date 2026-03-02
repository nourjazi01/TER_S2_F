# 📋 TODO Liste - Jour 3

## ✅ Complété

### Infrastructure
- [x] API Flask créée (`api_server.py`)
- [x] Configuration Render (`render.yaml`)
- [x] Dépendances (`requirements.txt`)
- [x] CI/CD GitHub Actions (`.github/workflows/deploy.yml`)
- [x] `.gitignore` configuré

### Tests
- [x] Tests unitaires (`test_maze_generator.py`)
- [x] Tests API complets (`test_api.py`)
  - [x] Tests fonctionnels
  - [x] Tests caractéristiques
  - [x] Tests bout en bout
  - [x] Tests performance
- [x] Script vérification (`verify_deployment.py`)

### Client
- [x] Client local interactif (`client_local.py`)
- [x] Support local/cloud

### Documentation
- [x] README déploiement (`README_DEPLOYMENT.md`)
- [x] Guide démarrage rapide (`QUICKSTART_JOUR3.md`)
- [x] Tests curl (`CURL_TESTS.md`)
- [x] Rapports activité:
  - [x] `ra_jazi_jour3.md`
  - [x] `ra_montasser_jour3.md`

---

## 🔄 En Cours

### JAZI - Backend/Déploiement
- [ ] Créer repository GitHub
- [ ] Push code initial
- [ ] Configurer Render account
- [ ] Connecter repository à Render
- [ ] Déployer première version
- [ ] Tester health check cloud
- [ ] Documenter URL de l'API cloud

### MONTASSER - Tests/Validation
- [ ] Lancer serveur local
- [ ] Exécuter tous les tests pytest
- [ ] Tester client local (mode local)
- [ ] Valider tests curl locaux
- [ ] Après déploiement: tester client local (mode cloud)
- [ ] Après déploiement: valider tests curl cloud

---

## 🎯 Tâches Partagées

### Démonstration CI/CD
- [ ] Test 1: Code correct
  - [ ] Push → GitHub Actions ✓
  - [ ] Render déploie automatiquement
  
- [ ] Test 2: Code cassé (intentionnel)
  - [ ] Commenter `self._remove_dead_ends()` dans `maze_generator.py`
  - [ ] Push → GitHub Actions ✗
  - [ ] Render NE déploie PAS
  
- [ ] Test 3: Réparation
  - [ ] Décommenter la ligne
  - [ ] Push → GitHub Actions ✓
  - [ ] Render déploie

---

## 📊 Checklist Présentation

### Points à Expliquer
- [ ] Architecture client-serveur (schéma)
- [ ] API REST endpoints (documentation)
- [ ] Définition API (request/response)
- [ ] Types de tests (3 catégories)
- [ ] Pipeline CI/CD (schéma workflow)
- [ ] Déploiement cloud (Render)
- [ ] Démonstration échec/succès tests

### Démo Live
- [ ] Montrer serveur local running
- [ ] Client local → génération
- [ ] Affichage ASCII
- [ ] Tests pytest en action
- [ ] GitHub Actions (badge vert)
- [ ] API cloud accessible
- [ ] Client local → cloud
- [ ] Curl test cloud

---

## 🐛 Problèmes à Résoudre

### Connus
- [ ] Structure imports `Src/` (solution: `sys.path` ou `PYTHONPATH`)
- [ ] Render free tier: cold start 15-30s
- [ ] Tests API nécessitent serveur lancé

### À Vérifier
- [ ] Performance cloud vs local
- [ ] Gestion concurrent requests
- [ ] Timeout pour grandes tailles (50x50+)

---

## 📈 Améliorations Futures (Jour 4)

### API
- [ ] Authentification (API key)
- [ ] Rate limiting
- [ ] Cache (Redis)
- [ ] WebSocket pour génération temps réel
- [ ] Endpoint `/best` (génère 10, retourne meilleur)

### Tests
- [ ] Tests de charge (locust, k6)
- [ ] Tests sécurité
- [ ] Coverage report (pytest-cov)
- [ ] Integration avec SonarQube

### Monitoring
- [ ] Logs structurés (JSON)
- [ ] Métriques Prometheus
- [ ] Dashboard Grafana
- [ ] Alertes (uptime monitoring)

### CI/CD
- [ ] Environnements staging/production
- [ ] Blue-green deployment
- [ ] Rollback automatique
- [ ] Container Docker

---

## 🎓 Questions Préparation

1. **Pourquoi REST plutôt que GraphQL ?**
   - Simplicité pour cas d'usage simple
   - Génération = opération POST claire
   - Documentation facile

2. **Pourquoi Render plutôt que AWS/Azure ?**
   - Gratuit pour commencer
   - Déploiement ultra simple (Git push)
   - Auto-scaling inclus
   - Documentation claire

3. **Comment garantir qualité déploiements ?**
   - Tests automatiques obligatoires
   - Pas de merge si tests rouges
   - Pas de déploiement si build échoue
   - Validation caractéristiques maze

4. **Que se passe-t-il si un test échoue ?**
   - GitHub Actions bloque le workflow
   - Render ne reçoit pas notification
   - Version précédente reste en production
   - Développeur alerté par email

5. **Comment tester en local avant push ?**
   - `pytest` pour tous les tests
   - `python verify_deployment.py` pour check complet
   - Client local pour test utilisateur
   - Curl pour test HTTP bas niveau
