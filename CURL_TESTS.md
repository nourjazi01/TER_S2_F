# 🧪 Commandes Curl pour Tester l'API

## 📍 Local (http://localhost:5000)

### 1. Health Check
```bash
curl http://localhost:5000/health
```

**Réponse attendue:**
```json
{
  "status": "healthy",
  "service": "maze-generator"
}
```

### 2. Documentation API
```bash
curl http://localhost:5000/
```

**Réponse attendue:**
```json
{
  "service": "Pac-Man Maze Generator API",
  "version": "1.0",
  "endpoints": {
    "/generate": "POST - Génère un labyrinthe",
    "/analyze": "POST - Analyse un labyrinthe",
    "/health": "GET - Vérifie l'état du service"
  }
}
```

### 3. Générer Labyrinthe (défaut 15x15)
```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json"
```

### 4. Générer Labyrinthe (taille personnalisée)
```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 20, \"height\": 20}"
```

### 5. Test Validation (taille 30x30)
```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 30, \"height\": 30}"
```

**Vérifier dans la réponse:**
- `maze.metadata.width == 30`
- `maze.metadata.height == 30`
- `maze.cells` contient 900 cellules

### 6. Sauvegarder la Réponse
```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 15, \"height\": 15}" \
  -o maze_generated.json
```

---

## ☁️ Cloud (Render)

**Remplacer `YOUR-APP-NAME` par le nom de votre service Render**

### 1. Health Check
```bash
curl https://YOUR-APP-NAME.onrender.com/health
```

### 2. Générer Labyrinthe
```bash
curl -X POST https://YOUR-APP-NAME.onrender.com/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 15, \"height\": 15}"
```

### 3. Test Performance (20x20)
```bash
time curl -X POST https://YOUR-APP-NAME.onrender.com/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 20, \"height\": 20}"
```

---

## 🧪 Tests de Validation

### Test 1: Paramètres Invalides (doit retourner 400)
```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 150, \"height\": 150}"
```

**Réponse attendue:**
```json
{
  "success": false,
  "error": "width et height doivent être entre 3 et 100"
}
```

### Test 2: Paramètres Non-Entiers (doit retourner 400)
```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": \"abc\", \"height\": 10}"
```

### Test 3: Vérification Caractéristiques
```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 15, \"height\": 15}" | grep -E "connectivity|dead_ends|score"
```

**Vérifier:**
- `"connectivity": true`
- `"dead_ends": 0`
- `"score": >= 80`

---

## 📊 PowerShell (Windows)

### Générer avec PowerShell
```powershell
$body = @{
    width = 15
    height = 15
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/generate" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Sauvegarder en JSON
```powershell
$body = @{
    width = 20
    height = 20
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/generate" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body | ConvertTo-Json -Depth 10 | Out-File maze.json
```

---

## 🎯 Tests Bout en Bout

### Workflow Complet
```bash
# 1. Vérifier que le service est up
curl http://localhost:5000/health

# 2. Générer un maze
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 12, \"height\": 12}" \
  -o generated_maze.json

# 3. Le maze est sauvegardé dans generated_maze.json
# 4. Vous pouvez l'analyser avec le client local
```

---

## 📝 Notes

### Cold Start (Render Free Tier)
Si le service est en veille (après 15min d'inactivité), la première requête peut prendre 20-30 secondes pour "réveiller" le service.

### Timeout
Augmenter le timeout pour les grandes tailles:
```bash
curl --max-time 30 -X POST http://localhost:5000/generate ...
```

### Pretty Print JSON
Avec `jq` (si installé):
```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d "{\"width\": 10, \"height\": 10}" | jq .
```
