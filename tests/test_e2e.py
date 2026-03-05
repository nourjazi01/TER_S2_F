"""
Tests de bout en bout (End-to-End)
Teste l'API déployée dans le cloud ou en local
"""

import pytest
import requests
import json
import os


# URL de base - peut être locale ou distante
BASE_URL = os.environ.get('API_BASE_URL', 'http://localhost:5000')


class TestEndToEnd:
    """Tests de bout en bout sur l'API déployée."""
    
    def test_api_is_reachable(self):
        """Test : l'API doit être accessible."""
        try:
            response = requests.get(f"{BASE_URL}/", timeout=10)
            assert response.status_code == 200, \
                f"L'API n'est pas accessible (code {response.status_code})"
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Impossible de contacter l'API : {e}")
            
    def test_generate_maze_endpoint(self):
        """Test : génération d'un maze via l'API déployée."""
        try:
            response = requests.post(
                f"{BASE_URL}/api/generate-maze",
                json={'width': 20, 'height': 20},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            assert response.status_code == 200
            data = response.json()
            
            assert data['success'] == True
            assert data['width'] == 20
            assert data['height'] == 20
            
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Erreur lors de la requête : {e}")
            
    def test_get_maze_endpoint(self):
        """Test : récupération d'un maze via GET."""
        try:
            response = requests.get(f"{BASE_URL}/api/maze", timeout=10)
            
            assert response.status_code == 200
            data = response.json()
            
            assert 'metadata' in data
            assert 'cells' in data
            
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Erreur lors de la requête : {e}")
            
    def test_maze_dimensions_match_request(self):
        """Test : les dimensions du maze correspondent à la requête."""
        try:
            width, height = 30, 30
            response = requests.post(
                f"{BASE_URL}/api/generate-maze",
                json={'width': width, 'height': height},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            data = response.json()
            maze = data['maze']
            
            assert maze['metadata']['width'] == width
            assert maze['metadata']['height'] == height
            assert len(maze['cells']) == width * height
            
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Erreur lors de la requête : {e}")
            
    def test_invalid_dimensions_rejected(self):
        """Test : dimensions invalides doivent être rejetées."""
        try:
            response = requests.post(
                f"{BASE_URL}/api/generate-maze",
                json={'width': 100, 'height': 100},
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            assert response.status_code == 400
            data = response.json()
            assert 'error' in data
            
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Erreur lors de la requête : {e}")


class TestDeploymentHealth:
    """Tests de santé du déploiement."""
    
    def test_response_time_acceptable(self):
        """Test : le temps de réponse doit être acceptable (<5s)."""
        try:
            import time
            start = time.time()
            response = requests.get(f"{BASE_URL}/api/maze", timeout=10)
            elapsed = time.time() - start
            
            assert response.status_code == 200
            assert elapsed < 5.0, \
                f"Temps de réponse trop long : {elapsed:.2f}s"
                
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Erreur lors de la requête : {e}")
            
    def test_multiple_consecutive_requests(self):
        """Test : plusieurs requêtes consécutives doivent fonctionner."""
        try:
            for i in range(3):
                response = requests.post(
                    f"{BASE_URL}/api/generate-maze",
                    json={'width': 10, 'height': 10},
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                assert response.status_code == 200, \
                    f"Requête {i+1}/3 a échoué"
                    
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Erreur lors des requêtes : {e}")


if __name__ == '__main__':
    # Pour tester en local : export API_BASE_URL=http://localhost:5000
    # Pour tester en distant : export API_BASE_URL=https://votre-app.onrender.com
    print(f"Testing API at: {BASE_URL}")
    pytest.main([__file__, '-v'])
