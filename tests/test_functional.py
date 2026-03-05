"""
Tests fonctionnels pour le générateur de labyrinthes Pac-Man
Ces tests vérifient les fonctionnalités de base du système.
"""

import pytest
import sys
import os

# Ajouter le répertoire Src au chemin
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'Src'))

from maze_generator import MazeGenerator


class TestMazeDimensions:
    """Tests de vérification des dimensions du labyrinthe."""
    
    def test_maze_30x30_dimensions(self):
        """Test simple : un maze 30x30 doit avoir les bonnes dimensions."""
        generator = MazeGenerator(30, 30)
        maze = generator.generate()
        
        metadata = maze['metadata']
        assert metadata['width'] == 30, "La largeur devrait être 30"
        assert metadata['height'] == 30, "La hauteur devrait être 30"
        
    def test_maze_15x15_dimensions(self):
        """Test : un maze 15x15 doit avoir les bonnes dimensions."""
        generator = MazeGenerator(15, 15)
        maze = generator.generate()
        
        metadata = maze['metadata']
        assert metadata['width'] == 15
        assert metadata['height'] == 15
        
    def test_maze_10x20_dimensions(self):
        """Test : un maze rectangulaire 10x20 doit avoir les bonnes dimensions."""
        generator = MazeGenerator(10, 20)
        maze = generator.generate()
        
        metadata = maze['metadata']
        assert metadata['width'] == 10
        assert metadata['height'] == 20
        
    def test_cell_count(self):
        """Test : le nombre de cellules doit correspondre à width * height."""
        width, height = 12, 18
        generator = MazeGenerator(width, height)
        maze = generator.generate()
        
        expected_cells = width * height
        actual_cells = len(maze['cells'])
        assert actual_cells == expected_cells, \
            f"Attendu {expected_cells} cellules, obtenu {actual_cells}"


class TestMazeStructure:
    """Tests de vérification de la structure du JSON."""
    
    def test_maze_has_metadata(self):
        """Test : le maze doit contenir une section metadata."""
        generator = MazeGenerator(10, 10)
        maze = generator.generate()
        
        assert 'metadata' in maze
        assert 'width' in maze['metadata']
        assert 'height' in maze['metadata']
        assert 'type' in maze['metadata']
        
    def test_maze_has_cells(self):
        """Test : le maze doit contenir une section cells."""
        generator = MazeGenerator(10, 10)
        maze = generator.generate()
        
        assert 'cells' in maze
        assert isinstance(maze['cells'], dict)
        assert len(maze['cells']) > 0
        
    def test_cell_structure(self):
        """Test : chaque cellule doit avoir les bonnes propriétés."""
        generator = MazeGenerator(5, 5)
        maze = generator.generate()
        
        # Vérifier une cellule aléatoire
        cell_key = list(maze['cells'].keys())[0]
        cell = maze['cells'][cell_key]
        
        assert 'x' in cell
        assert 'y' in cell
        assert 'passages' in cell
        assert isinstance(cell['passages'], list)  # passages is a list, not dict


class TestMazeGeneration:
    """Tests de génération de labyrinthe."""
    
    def test_minimum_size(self):
        """Test : doit pouvoir générer un labyrinthe 5x5 (taille minimale)."""
        generator = MazeGenerator(5, 5)
        maze = generator.generate()
        
        assert maze is not None
        assert len(maze['cells']) == 25
        
    def test_large_size(self):
        """Test : doit pouvoir générer un grand labyrinthe 50x50."""
        generator = MazeGenerator(50, 50)
        maze = generator.generate()
        
        assert maze is not None
        assert len(maze['cells']) == 2500
        
    def test_ghost_house_option(self):
        """Test : option ghost_house doit être respectée."""
        # Avec ghost house
        gen_with = MazeGenerator(15, 15, ghost_house=True)
        maze_with = gen_with.generate()
        
        # Sans ghost house
        gen_without = MazeGenerator(15, 15, ghost_house=False)
        maze_without = gen_without.generate()
        
        assert maze_with['metadata']['ghost_house'] == True
        assert maze_without['metadata']['ghost_house'] == False


class TestMazeParameters:
    """Tests des paramètres de jouabilité."""
    
    def test_playability_parameter(self):
        """Test : paramètre playability doit être accepté."""
        generator = MazeGenerator(10, 10, playability=0.7)
        maze = generator.generate()
        
        assert maze is not None
        
    def test_dead_end_ratio_parameter(self):
        """Test : paramètre dead_end_ratio doit être accepté."""
        generator = MazeGenerator(10, 10, dead_end_ratio=0.0)
        maze = generator.generate()
        
        assert maze is not None
        
    def test_cycle_intensity_parameter(self):
        """Test : paramètre cycle_intensity doit être accepté."""
        generator = MazeGenerator(10, 10, cycle_intensity=0.8)
        maze = generator.generate()
        
        assert maze is not None


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
