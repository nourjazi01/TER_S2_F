"""
Tests pour l'API du générateur de labyrinthes
Tests fonctionnels, tests bout en bout, tests des caractéristiques
"""

import pytest
import requests
import json
from maze_analyzer import MazeAnalyzer


# Configuration
API_BASE_URL = "http://localhost:5000"  # Local
# API_BASE_URL = "https://votre-app.onrender.com"  # Cloud (à modifier)


class TestAPIFunctional:
    """Tests fonctionnels de l'API."""
    
    def test_health_endpoint(self):
        """Vérifie que l'endpoint /health fonctionne."""
        response = requests.get(f"{API_BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
    
    def test_home_endpoint(self):
        """Vérifie que l'endpoint / retourne la documentation."""
        response = requests.get(f"{API_BASE_URL}/")
        assert response.status_code == 200
        data = response.json()
        assert 'endpoints' in data
    
    def test_generate_default_maze(self):
        """Test génération avec paramètres par défaut."""
        response = requests.post(f"{API_BASE_URL}/generate")
        assert response.status_code == 200
        data = response.json()
        assert data['success'] is True
        assert 'maze' in data
        assert 'analysis' in data
    
    def test_generate_custom_size(self):
        """Test génération avec taille personnalisée."""
        payload = {"width": 20, "height": 10}
        response = requests.post(
            f"{API_BASE_URL}/generate",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        
        # Vérifier que la taille demandée est respectée
        maze = data['maze']
        assert maze['metadata']['width'] == 20
        assert maze['metadata']['height'] == 10
        
        # Vérifier le nombre de cellules
        assert len(maze['cells']) == 20 * 10
    
    def test_invalid_parameters(self):
        """Test avec paramètres invalides."""
        # Taille trop grande
        payload = {"width": 150, "height": 150}
        response = requests.post(
            f"{API_BASE_URL}/generate",
            json=payload
        )
        assert response.status_code == 400
        
        # Paramètres non entiers
        payload = {"width": "abc", "height": 10}
        response = requests.post(
            f"{API_BASE_URL}/generate",
            json=payload
        )
        assert response.status_code == 400


class TestMazeCharacteristics:
    """Tests des caractéristiques des labyrinthes générés."""
    
    def test_no_dead_ends(self):
        """Vérifie qu'il n'y a pas de culs-de-sac (Braid Maze)."""
        response = requests.post(f"{API_BASE_URL}/generate")
        data = response.json()
        
        assert data['analysis']['dead_ends'] == 0, \
            "Le labyrinthe ne doit pas avoir de culs-de-sac"
    
    def test_full_connectivity(self):
        """Vérifie que le labyrinthe est entièrement connexe."""
        response = requests.post(f"{API_BASE_URL}/generate")
        data = response.json()
        
        assert data['analysis']['connectivity'] is True, \
            "Toutes les cellules doivent être accessibles"
    
    def test_quality_score(self):
        """Vérifie que le score qualité est acceptable."""
        response = requests.post(f"{API_BASE_URL}/generate")
        data = response.json()
        
        score = data['analysis']['score']
        assert score >= 80, \
            f"Le score qualité ({score}) doit être >= 80"
    
    def test_maze_structure(self):
        """Vérifie la structure JSON du labyrinthe."""
        response = requests.post(f"{API_BASE_URL}/generate")
        data = response.json()
        maze = data['maze']
        
        # Vérifier métadonnées
        assert 'metadata' in maze
        assert 'width' in maze['metadata']
        assert 'height' in maze['metadata']
        assert 'type' in maze['metadata']
        
        # Vérifier cellules
        assert 'cells' in maze
        assert len(maze['cells']) > 0
        
        # Vérifier format des cellules
        for cell_key, cell_data in maze['cells'].items():
            assert 'x' in cell_data
            assert 'y' in cell_data
            assert 'passages' in cell_data
            assert 'degree' in cell_data
            assert isinstance(cell_data['passages'], list)
    
    def test_degree_distribution(self):
        """Vérifie la distribution des degrés."""
        response = requests.post(f"{API_BASE_URL}/generate")
        data = response.json()
        maze = data['maze']
        
        degrees = [cell['degree'] for cell in maze['cells'].values()]
        
        # Tous degrés >= 2 (pas de culs-de-sac)
        assert all(d >= 2 for d in degrees), \
            "Tous les degrés doivent être >= 2"
        
        # Degré moyen raisonnable
        avg_degree = sum(degrees) / len(degrees)
        assert 2.0 <= avg_degree <= 3.5, \
            f"Degré moyen ({avg_degree:.2f}) hors limites"


class TestEndToEnd:
    """Tests de bout en bout (workflow complet)."""
    
    def test_generate_and_analyze_workflow(self):
        """Test du workflow complet: génération puis analyse."""
        # 1. Générer un labyrinthe
        gen_response = requests.post(
            f"{API_BASE_URL}/generate",
            json={"width": 12, "height": 12}
        )
        assert gen_response.status_code == 200
        maze = gen_response.json()['maze']
        
        # 2. Analyser le labyrinthe généré
        analyze_response = requests.post(
            f"{API_BASE_URL}/analyze",
            json={"maze": maze}
        )
        assert analyze_response.status_code == 200
        analysis = analyze_response.json()['analysis']
        
        # 3. Vérifier cohérence
        assert analysis['connectivity']['is_connected']
        assert analysis['dead_ends']['dead_end_count'] == 0
    
    def test_multiple_generations(self):
        """Teste plusieurs générations successives."""
        scores = []
        
        for i in range(5):
            response = requests.post(f"{API_BASE_URL}/generate")
            assert response.status_code == 200
            score = response.json()['analysis']['score']
            scores.append(score)
        
        # Tous les scores doivent être > 80
        assert all(s >= 80 for s in scores)
        
        # Variance acceptable (générations différentes)
        assert max(scores) - min(scores) < 10


class TestPerformance:
    """Tests de performance."""
    
    def test_response_time(self):
        """Vérifie que le temps de réponse est acceptable."""
        import time
        
        start = time.time()
        response = requests.post(
            f"{API_BASE_URL}/generate",
            json={"width": 20, "height": 20}
        )
        duration = time.time() - start
        
        assert response.status_code == 200
        assert duration < 2.0, \
            f"La génération a pris {duration:.2f}s (max 2s)"


# Script pour exécuter les tests
if __name__ == "__main__":
    print("Exécution des tests de l'API...")
    print(f"URL de base: {API_BASE_URL}")
    print("\nAssurez-vous que le serveur est lancé !")
    print("Local: python api_server.py")
    print("\nLancement des tests...\n")
    
    pytest.main([__file__, "-v", "--tb=short"])
