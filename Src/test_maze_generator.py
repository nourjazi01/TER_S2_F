"""
Tests unitaires pour le générateur de labyrinthes
"""

import pytest
from maze_generator import MazeGenerator
from maze_analyzer import MazeAnalyzer


class TestMazeGenerator:
    """Tests du générateur."""
    
    def test_initialization(self):
        """Test de l'initialisation."""
        gen = MazeGenerator(10, 10)
        assert gen.width == 10
        assert gen.height == 10
    
    def test_generate_creates_maze(self):
        """Vérifie que generate() crée un labyrinthe."""
        gen = MazeGenerator(10, 10)
        maze = gen.generate()
        
        assert maze is not None
        assert 'metadata' in maze
        assert 'cells' in maze
    
    def test_correct_dimensions(self):
        """Vérifie que les dimensions sont correctes."""
        gen = MazeGenerator(12, 8)
        maze = gen.generate()
        
        assert maze['metadata']['width'] == 12
        assert maze['metadata']['height'] == 8
        assert len(maze['cells']) == 12 * 8
    
    def test_no_dead_ends(self):
        """Vérifie qu'il n'y a pas de culs-de-sac."""
        gen = MazeGenerator(15, 15)
        maze = gen.generate()
        
        analyzer = MazeAnalyzer(maze)
        dead_ends = analyzer.analyze_dead_ends()
        
        assert dead_ends['dead_end_count'] == 0
    
    def test_full_connectivity(self):
        """Vérifie la connexité complète."""
        gen = MazeGenerator(20, 20)
        maze = gen.generate()
        
        analyzer = MazeAnalyzer(maze)
        connectivity = analyzer.check_connectivity()
        
        assert connectivity['is_connected']
        assert connectivity['connectivity_ratio'] == 1.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
