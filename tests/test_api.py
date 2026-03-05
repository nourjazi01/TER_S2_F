"""
Tests API pour les endpoints HTTP du générateur de labyrinthes
Tests locaux et tests de bout en bout (end-to-end)
"""

import pytest
import json
import sys
import os

# Ajouter le répertoire racine au chemin
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import app


@pytest.fixture
def client():
    """Fixture pytest pour le client de test Flask."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestAPIEndpoints:
    """Tests des endpoints de l'API."""
    
    def test_index_route(self, client):
        """Test : la route / doit retourner 200 OK."""
        response = client.get('/')
        assert response.status_code == 200
        
    def test_get_maze_endpoint(self, client):
        """Test : GET /api/maze doit retourner un labyrinthe."""
        response = client.get('/api/maze')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'metadata' in data
        assert 'cells' in data
        
    def test_get_maze_info_endpoint(self, client):
        """Test : GET /api/maze-info doit retourner les infos."""
        # D'abord générer un maze
        client.get('/api/maze')
        
        # Puis demander les infos
        response = client.get('/api/maze-info')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'width' in data
        assert 'height' in data


class TestGenerateMazeAPI:
    """Tests de génération de labyrinthe via API."""
    
    def test_generate_maze_default(self, client):
        """Test : POST /api/generate-maze sans paramètres."""
        response = client.post('/api/generate-maze',
                              json={},
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['success'] == True
        assert 'maze' in data
        assert data['width'] == 15  # Valeur par défaut
        assert data['height'] == 15
        
    def test_generate_maze_custom_size(self, client):
        """Test : POST /api/generate-maze avec dimensions personnalisées."""
        response = client.post('/api/generate-maze',
                              json={'width': 20, 'height': 25},
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['success'] == True
        assert data['width'] == 20
        assert data['height'] == 25
        
    def test_generate_maze_with_parameters(self, client):
        """Test : POST /api/generate-maze avec tous les paramètres."""
        response = client.post('/api/generate-maze',
                              json={
                                  'width': 30,
                                  'height': 30,
                                  'playability': 0.7,
                                  'dead_end_ratio': 0.0,
                                  'cycle_intensity': 0.8
                              },
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['success'] == True
        assert data['width'] == 30
        assert data['height'] == 30
        assert 'parameters' in data
        assert data['parameters']['playability'] == 0.7
        
    def test_generate_maze_invalid_dimensions_too_small(self, client):
        """Test : dimensions trop petites doivent être rejetées."""
        response = client.post('/api/generate-maze',
                              json={'width': 3, 'height': 3},
                              content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        
    def test_generate_maze_invalid_dimensions_too_large(self, client):
        """Test : dimensions trop grandes doivent être rejetées."""
        response = client.post('/api/generate-maze',
                              json={'width': 100, 'height': 100},
                              content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data


class TestAPIMazeStructure:
    """Tests de structure du JSON retourné par l'API."""
    
    def test_api_returns_valid_json(self, client):
        """Test : l'API doit retourner du JSON valide."""
        response = client.post('/api/generate-maze',
                              json={'width': 15, 'height': 15},
                              content_type='application/json')
        
        assert response.status_code == 200
        assert response.content_type == 'application/json'
        
        # Vérifier que c'est du JSON valide
        data = json.loads(response.data)
        assert isinstance(data, dict)
        
    def test_api_maze_has_correct_cell_count(self, client):
        """Test : le maze retourné doit avoir le bon nombre de cellules."""
        width, height = 12, 18
        response = client.post('/api/generate-maze',
                              json={'width': width, 'height': height},
                              content_type='application/json')
        
        data = json.loads(response.data)
        maze = data['maze']
        
        expected_cells = width * height
        actual_cells = len(maze['cells'])
        assert actual_cells == expected_cells


class TestAPIContentType:
    """Tests des types de contenu HTTP."""
    
    def test_post_without_json_content_type(self, client):
        """Test : POST sans Content-Type application/json."""
        response = client.post('/api/generate-maze',
                              data='{"width": 10, "height": 10}')
        
        # Devrait quand même fonctionner ou retourner une erreur claire
        assert response.status_code in [200, 400, 415]
        
    def test_get_returns_json(self, client):
        """Test : GET /api/maze doit retourner du JSON."""
        response = client.get('/api/maze')
        assert response.content_type == 'application/json'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
