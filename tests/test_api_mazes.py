"""
Tests API pour les endpoints de stockage de labyrinthes (MongoDB)
Ces tests utilisent des mocks pour simuler les opérations de base de données.
"""

import pytest
import json
import sys
import os
from unittest.mock import patch, MagicMock

# Ajouter le répertoire racine au chemin
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import app


@pytest.fixture
def client():
    """Fixture pytest pour le client de test Flask."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestSaveMazeEndpoint:
    """Tests pour POST /api/mazes/save"""

    @patch('app.save_maze')
    def test_save_maze_success(self, mock_save, client):
        """Test : sauvegarder un labyrinthe avec succès."""
        # D'abord générer un maze
        client.post('/api/generate-maze', json={'width': 10, 'height': 10})

        mock_save.return_value = {
            'maze_id': '507f1f77bcf86cd799439011',
            'name': 'Maze_2024_001',
            'created_at': '2024-01-01T00:00:00Z'
        }

        response = client.post('/api/mazes/save', json={})

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'maze_id' in data
        assert 'name' in data

    def test_save_maze_no_current_maze(self, client):
        """Test : erreur si aucun labyrinthe n'est généré."""
        # Réinitialiser current_maze
        import app as app_module
        app_module.current_maze = None

        response = client.post('/api/mazes/save', json={})

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    @patch('app.save_maze')
    def test_save_maze_db_not_configured(self, mock_save, client):
        """Test : erreur si la base de données n'est pas configurée."""
        # Générer un maze d'abord
        client.post('/api/generate-maze', json={'width': 10, 'height': 10})

        mock_save.side_effect = ValueError("MONGODB_URI environment variable not set")

        response = client.post('/api/mazes/save', json={})

        assert response.status_code == 503
        data = json.loads(response.data)
        assert 'error' in data


class TestListMazesEndpoint:
    """Tests pour GET /api/mazes"""

    @patch('app.list_mazes')
    def test_list_mazes_empty(self, mock_list, client):
        """Test : liste vide quand aucun labyrinthe n'est sauvegardé."""
        mock_list.return_value = {
            'mazes': [],
            'total': 0,
            'limit': 20,
            'offset': 0
        }

        response = client.get('/api/mazes')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['mazes'] == []
        assert data['total'] == 0

    @patch('app.list_mazes')
    def test_list_mazes_with_results(self, mock_list, client):
        """Test : liste avec des labyrinthes sauvegardés."""
        mock_list.return_value = {
            'mazes': [
                {
                    '_id': '507f1f77bcf86cd799439011',
                    'name': 'Maze_2024_001',
                    'created_at': '2024-01-01T00:00:00Z',
                    'metadata': {'width': 15, 'height': 15}
                }
            ],
            'total': 1,
            'limit': 20,
            'offset': 0
        }

        response = client.get('/api/mazes')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['mazes']) == 1
        assert data['total'] == 1

    @patch('app.list_mazes')
    def test_list_mazes_pagination(self, mock_list, client):
        """Test : pagination des résultats."""
        mock_list.return_value = {
            'mazes': [],
            'total': 50,
            'limit': 10,
            'offset': 20
        }

        response = client.get('/api/mazes?limit=10&offset=20')

        assert response.status_code == 200
        mock_list.assert_called_with(10, 20, 'newest')

    @patch('app.list_mazes')
    def test_list_mazes_max_limit(self, mock_list, client):
        """Test : limite maximale de 100."""
        mock_list.return_value = {
            'mazes': [],
            'total': 0,
            'limit': 100,
            'offset': 0
        }

        response = client.get('/api/mazes?limit=200')

        assert response.status_code == 200
        # La limite doit être réduite à 100
        mock_list.assert_called_with(100, 0, 'newest')


class TestGetMazeEndpoint:
    """Tests pour GET /api/mazes/<maze_id>"""

    @patch('app.db_get_maze')
    def test_get_maze_success(self, mock_get, client):
        """Test : récupérer un labyrinthe existant."""
        mock_get.return_value = {
            '_id': '507f1f77bcf86cd799439011',
            'name': 'Maze_2024_001',
            'created_at': '2024-01-01T00:00:00Z',
            'metadata': {'width': 15, 'height': 15},
            'cells': {}
        }

        response = client.get('/api/mazes/507f1f77bcf86cd799439011')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['name'] == 'Maze_2024_001'
        assert 'cells' in data

    @patch('app.db_get_maze')
    def test_get_maze_not_found(self, mock_get, client):
        """Test : erreur si le labyrinthe n'existe pas."""
        mock_get.return_value = None

        response = client.get('/api/mazes/000000000000000000000000')

        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data


class TestDeleteMazeEndpoint:
    """Tests pour DELETE /api/mazes/<maze_id>"""

    @patch('app.delete_maze')
    def test_delete_maze_success(self, mock_delete, client):
        """Test : supprimer un labyrinthe existant."""
        mock_delete.return_value = True

        response = client.delete('/api/mazes/507f1f77bcf86cd799439011')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert data['deleted_id'] == '507f1f77bcf86cd799439011'

    @patch('app.delete_maze')
    def test_delete_maze_not_found(self, mock_delete, client):
        """Test : erreur si le labyrinthe n'existe pas."""
        mock_delete.return_value = False

        response = client.delete('/api/mazes/000000000000000000000000')

        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data


class TestLoadMazeEndpoint:
    """Tests pour POST /api/mazes/<maze_id>/load"""

    @patch('app.db_get_maze')
    def test_load_maze_success(self, mock_get, client):
        """Test : charger un labyrinthe sauvegardé."""
        mock_get.return_value = {
            '_id': '507f1f77bcf86cd799439011',
            'name': 'Maze_2024_001',
            'created_at': '2024-01-01T00:00:00Z',
            'metadata': {'width': 15, 'height': 15},
            'cells': {'0,0': {'x': 0, 'y': 0, 'passages': ['S', 'E']}}
        }

        response = client.post('/api/mazes/507f1f77bcf86cd799439011/load')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'maze' in data
        assert data['loaded_from'] == 'Maze_2024_001'

    @patch('app.db_get_maze')
    def test_load_maze_not_found(self, mock_get, client):
        """Test : erreur si le labyrinthe n'existe pas."""
        mock_get.return_value = None

        response = client.post('/api/mazes/000000000000000000000000/load')

        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    @patch('app.db_get_maze')
    def test_load_maze_sets_current_maze(self, mock_get, client):
        """Test : charger un maze le définit comme maze courant."""
        mock_get.return_value = {
            '_id': '507f1f77bcf86cd799439011',
            'name': 'Maze_2024_001',
            'created_at': '2024-01-01T00:00:00Z',
            'metadata': {'width': 20, 'height': 20},
            'cells': {'0,0': {'x': 0, 'y': 0, 'passages': ['S', 'E']}}
        }

        # Charger le maze
        client.post('/api/mazes/507f1f77bcf86cd799439011/load')

        # Vérifier que le maze courant est mis à jour
        response = client.get('/api/maze-info')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['width'] == 20
        assert data['height'] == 20


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
