# Rapport d'Activité - Jazi

## Jour 1 - 06/02/2026

### Tâches réalisées
- Mise en place de la structure du projet TER
- Analyse des contraintes pour labyrinthes type Pac-Man
- Identification des algorithmes adaptés

### Recherches effectuées

**Contraintes Pac-Man :**
- ❌ Aucun cul-de-sac
- ✅ Cycles multiples
- ✅ Graphe connexe

**Algorithmes recensés :**
1. **Braid Maze** (choisi) - DFS + suppression dead ends
2. Graph Minimum Degree ≥ 2
3. Loop-Erased Random Walk
4. Hybrid DFS + Forced Cycles

### Prochaine séance
- Implémenter Braid Maze
- Tester génération et validation

---

## Jour 2 - 13/02/2026

### Tâches réalisées

**Modules développés (ma responsabilité) :**
- ✅ `maze_generator.py` - Générateur Braid Maze (~200 lignes)
- ✅ `main.py` - Script principal avec CLI
- ✅ Export JSON structuré

**Collaboration :**
- Division tâches : génération (Jazi) / visualisation + tests (Montasser)
- Intégration modules via imports Python

### Algorithme Braid Maze

1. Génération parfaite (DFS)
2. Élimination des dead ends
3. Export JSON

**Structure données :**
```python
walls = {(x, y, direction): bool}  # N, S, E, W
```

### Résultats

**Test 12x12 :**
- Connexité : 100%
- Culs-de-sac : 0
- Score : 84.4/100

### Difficultés
- Gestion bidirectionnelle des murs → fonction `_remove_wall()`
- Degré moyen faible (2.22) → amélioration nécessaire

### Prochaine séance
- Optimiser degré moyen (objectif 2.5-3)
- Paramètres de contrôle de densité
- Explorer algorithmes alternatifs

---

## Jour 3 - 05/03/2026

### Tâches réalisées

**Déploiement Cloud (ma responsabilité) :**
- ✅ Configuration Render.com pour web service
- ✅ `render.yaml` - Configuration déploiement automatique
- ✅ Pipeline CI/CD complet avec GitHub Actions
- ✅ `.github/workflows/ci-cd.yml` - Workflow automatisation
- ✅ Documentation déploiement (`DEPLOYMENT.md`, `TESTING.md`)

**Tests Automatisés :**
- ✅ Suite de tests complète (51 tests)
  - 13 tests fonctionnels (structure, dimensions)
  - 12 tests API (endpoints, validation HTTP)
  - 19 tests caractéristiques (connectivité, qualité)
  - 7 tests E2E (end-to-end sur API déployée)
- ✅ Configuration pytest avec coverage
- ✅ Scripts de test manuels (bash/PowerShell)

**Intégration Continue :**
- ✅ Automatisation des tests sur chaque push
- ✅ Blocage déploiement si tests échouent
- ✅ Déploiement automatique sur Render après validation

### Architecture CI/CD

**Pipeline GitHub Actions :**
```yaml
1. Run Tests (pytest)
   → 44 tests core (functional + API + characteristics)
   → Coverage report
   
2. Deploy to Render (si tests OK)
   → Appel API Render
   → Déclenchement déploiement
   → Validation E2E sur API déployée
   
3. Test Failure Scenario (PR)
   → Démonstration blocage sur échec tests
```

**Fichiers de configuration :**
- `requirements.txt` - Dépendances Python (Flask, gunicorn, pytest)
- `render.yaml` - Config service web (build, start, health check)
- `.github/workflows/ci-cd.yml` - Pipeline automatisation
- `.gitignore` - Exclusions (venv, cache, outputs)

### Résultats

**Tests locaux :**
- 51/51 tests passent (100%)
- Coverage : modules core couverts
- Exécution : ~0.3s pour tests core

**CI/CD GitHub Actions :**
- ✅ Pipeline configuré et opérationnel
- ✅ Tests automatiques sur push
- ✅ Validation avant déploiement

**Documentation produite :**
1. `DEPLOYMENT.md` - Guide déploiement Render
2. `TESTING.md` - Guide utilisation tests
3. `TEST_SYNTHESIS.md` - Synthèse complète des tests

### Difficultés rencontrées

**Problème 1 : Tests API incompatibles**
- Cause : Méthodes MazeAnalyzer changées (find_dead_ends → analyze_dead_ends)
- Solution : Mise à jour 19 tests characteristics avec nouveaux noms

**Problème 2 : Tests E2E en CI**
- Cause : GitHub Actions n'a pas de serveur Flask actif
- Solution : Skip conditionnel si serveur non disponible

**Problème 3 : Variables globales Flask**
- Cause : UnboundLocalError sur current_maze
- Solution : Ajout déclarations `global current_maze`

### Stack technique déploiement

- **Serveur web** : Gunicorn (WSGI production)
- **Cloud** : Render.com (région Frankfurt)
- **CI/CD** : GitHub Actions
- **Tests** : Pytest + pytest-flask + requests
- **Monitoring** : Health check endpoint `/api/maze`

### Prochaines étapes
- Finaliser configuration Render avec secrets GitHub
- Tester déploiement automatique complet
- Démontrer blocage sur échec tests (requirement prof)
- Captures d'écran pour rapport final