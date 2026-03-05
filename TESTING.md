# Guide de Test de l'API Pac-Man Maze Generator

## Tests avec curl

### 1. Tests en Local

#### Démarrer le serveur local
```bash
python app.py
```

Le serveur démarre sur `http://localhost:5000`

#### Test 1 : Vérifier que l'API est accessible
```bash
curl http://localhost:5000/
```

**Résultat attendu** : Page HTML (code 200)

#### Test 2 : Récupérer un maze par défaut
```bash
curl http://localhost:5000/api/maze
```

**Résultat attendu** : JSON avec metadata et cells

#### Test 3 : Générer un maze 30x30
```bash
curl -X POST http://localhost:5000/api/generate-maze \
  -H "Content-Type: application/json" \
  -d '{"width": 30, "height": 30}'
```

**Test fonctionnel** : Vérifier que les dimensions sont correctes
```bash
curl -X POST http://localhost:5000/api/generate-maze \
  -H "Content-Type: application/json" \
  -d '{"width": 30, "height": 30}' | python -m json.tool | grep -E '"width"|"height"'
```

**Résultat attendu** :
```json
    "width": 30,
    "height": 30,
```

#### Test 4 : Générer un maze avec paramètres de jouabilité
```bash
curl -X POST http://localhost:5000/api/generate-maze \
  -H "Content-Type: application/json" \
  -d '{
    "width": 20,
    "height": 20,
    "playability": 0.7,
    "dead_end_ratio": 0.0,
    "cycle_intensity": 0.8
  }'
```

#### Test 5 : Tester la validation (dimensions invalides)
```bash
curl -X POST http://localhost:5000/api/generate-maze \
  -H "Content-Type: application/json" \
  -d '{"width": 100, "height": 100}'
```

**Résultat attendu** : Code 400 avec message d'erreur

#### Test 6 : Obtenir les informations du maze
```bash
curl http://localhost:5000/api/maze-info
```

**Résultat attendu** : JSON avec width, height, type, etc.

---

### 2. Tests sur l'API Déployée (Render)

Remplacer `localhost:5000` par l'URL de votre déploiement Render :

#### Définir l'URL de production
```bash
export API_URL="https://votre-app.onrender.com"
```

#### Test 1 : API accessible en production
```bash
curl $API_URL/
```

#### Test 2 : Générer un maze en production
```bash
curl -X POST $API_URL/api/generate-maze \
  -H "Content-Type: application/json" \
  -d '{"width": 15, "height": 15}'
```

#### Test 3 : Test de bout en bout complet
```bash
# 1. Générer un maze
RESPONSE=$(curl -s -X POST $API_URL/api/generate-maze \
  -H "Content-Type: application/json" \
  -d '{"width": 25, "height": 25}')

# 2. Vérifier le succès
echo $RESPONSE | python -m json.tool | grep "success"

# 3. Vérifier les dimensions
echo $RESPONSE | python -m json.tool | grep -E '"width"|"height"'
```

#### Test 4 : Mesurer le temps de réponse
```bash
time curl -X POST $API_URL/api/generate-maze \
  -H "Content-Type: application/json" \
  -d '{"width": 20, "height": 20}'
```

**Critère** : Devrait être < 5 secondes

---

### 3. Tests Automatisés avec Scripts

#### Script de test complet (test_api.sh)

```bash
#!/bin/bash

# Configuration
API_URL="${1:-http://localhost:5000}"
echo "Testing API at: $API_URL"
echo "================================"

# Test 1: Health check
echo "Test 1: Health check..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/)
if [ $STATUS -eq 200 ]; then
    echo "✓ PASS: API is reachable (HTTP $STATUS)"
else
    echo "✗ FAIL: API returned HTTP $STATUS"
    exit 1
fi

# Test 2: Generate 30x30 maze
echo "Test 2: Generate 30x30 maze..."
RESPONSE=$(curl -s -X POST $API_URL/api/generate-maze \
    -H "Content-Type: application/json" \
    -d '{"width": 30, "height": 30}')

WIDTH=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['width'])")
HEIGHT=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['height'])")

if [ "$WIDTH" = "30" ] && [ "$HEIGHT" = "30" ]; then
    echo "✓ PASS: Dimensions are correct (30x30)"
else
    echo "✗ FAIL: Expected 30x30, got ${WIDTH}x${HEIGHT}"
    exit 1
fi

# Test 3: Invalid dimensions should fail
echo "Test 3: Invalid dimensions (should fail)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/api/generate-maze \
    -H "Content-Type: application/json" \
    -d '{"width": 100, "height": 100}')

if [ $STATUS -eq 400 ]; then
    echo "✓ PASS: Invalid dimensions rejected (HTTP $STATUS)"
else
    echo "✗ FAIL: Should have returned 400, got $STATUS"
    exit 1
fi

# Test 4: Check maze has no dead ends
echo "Test 4: Verify maze has no dead ends..."
# This requires running the Python analyzer
# (Covered by pytest tests)

echo "================================"
echo "All curl tests passed!"
```

#### Rendre le script exécutable
```bash
chmod +x test_api.sh
```

#### Exécuter les tests
```bash
# Test local
./test_api.sh http://localhost:5000

# Test production
./test_api.sh https://votre-app.onrender.com
```

---

### 4. Tests avec PowerShell (Windows)

#### Test simple
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/maze" -Method GET
```

#### Générer un maze
```powershell
$body = @{
    width = 30
    height = 30
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/generate-maze" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

#### Script de test PowerShell (test_api.ps1)
```powershell
param(
    [string]$ApiUrl = "http://localhost:5000"
)

Write-Host "Testing API at: $ApiUrl" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`nTest 1: Health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ PASS: API is reachable" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ FAIL: API not reachable" -ForegroundColor Red
    exit 1
}

# Test 2: Generate 30x30 maze
Write-Host "`nTest 2: Generate 30x30 maze..." -ForegroundColor Yellow
$body = @{
    width = 30
    height = 30
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/generate-maze" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    if ($response.width -eq 30 -and $response.height -eq 30) {
        Write-Host "✓ PASS: Dimensions are correct (30x30)" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Wrong dimensions" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ FAIL: Request failed" -ForegroundColor Red
    exit 1
}

# Test 3: Invalid dimensions
Write-Host "`nTest 3: Invalid dimensions (should fail)..." -ForegroundColor Yellow
$body = @{
    width = 100
    height = 100
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/generate-maze" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✗ FAIL: Should have been rejected" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "✓ PASS: Invalid dimensions rejected" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Wrong error code" -ForegroundColor Red
        exit 1
    }
}

Write-Host ("`n" + "=" * 50) -ForegroundColor Cyan
Write-Host "All tests passed!" -ForegroundColor Green
```

---

### 5. Tests Pytest

#### Lancer tous les tests
```bash
pytest tests/ -v
```

#### Lancer un type de test spécifique
```bash
# Tests fonctionnels
pytest tests/test_functional.py -v

# Tests API
pytest tests/test_api.py -v

# Tests des caractéristiques
pytest tests/test_maze_characteristics.py -v

# Tests E2E (local)
pytest tests/test_e2e.py -v

# Tests E2E (production)
API_BASE_URL=https://votre-app.onrender.com pytest tests/test_e2e.py -v
```

#### Tests avec couverture
```bash
pip install pytest-cov
pytest tests/ --cov=Src --cov-report=html
```

Ouvre `htmlcov/index.html` pour voir le rapport de couverture.

---

### 6. Démonstration de Bloquage par Tests

Pour démontrer que le CI/CD bloque le déploiement si les tests échouent :

#### 1. Créer une branche de test
```bash
git checkout -b test-failure
```

#### 2. Casser délibérément le code
Modifier `Src/maze_generator.py` :
```python
def generate(self):
    # DELIBERATELY BROKEN
    raise Exception("This is a test failure!")
```

#### 3. Commit et push
```bash
git add Src/maze_generator.py
git commit -m "TEST: Deliberately break maze generation"
git push origin test-failure
```

#### 4. Observer
- GitHub Actions va exécuter les tests
- Les tests vont échouer
- Le déploiement ne sera **PAS** déclenché
- La PR ne peut pas être mergée

#### 5. Réparer et vérifier
```bash
git revert HEAD
git push origin test-failure
```

- Les tests passent
- Le déploiement peut maintenant se faire

---

## Résumé des Types de Tests

| Type | Fichier | Objectif |
|------|---------|----------|
| **Fonctionnels** | `test_functional.py` | Vérifier dimensions, structure JSON, paramètres |
| **API** | `test_api.py` | Tester endpoints HTTP, codes de statut, validation |
| **Caractéristiques** | `test_maze_characteristics.py` | Vérifier connexité, dead ends, cycles, qualité |
| **End-to-End** | `test_e2e.py` | Tester l'API déployée (local ou cloud) |
| **curl** | Scripts bash/PowerShell | Tests manuels rapides |

---

## Critères de Succès

✅ **Tests Fonctionnels**
- Maze 30x30 → dimensions = 30x30
- Maze 15x15 → 225 cellules
- Structure JSON valide

✅ **Tests API**
- GET /api/maze → 200 OK
- POST /api/generate-maze → JSON avec success=true
- Dimensions invalides → 400 Bad Request

✅ **Tests Caractéristiques**
- Connexité = 100%
- Dead ends = 0
- Degré minimum ≥ 2
- Score qualité ≥ 80/100

✅ **Tests E2E**
- API accessible (200 OK)
- Temps de réponse < 5s
- Génération fonctionnelle en production
