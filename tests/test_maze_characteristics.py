"""
Tests des caractéristiques des labyrinthes Pac-Man
Tests de qualité : connectivité, culs-de-sac, cycles, etc.
"""

import pytest
import sys
import os

# Ajouter le répertoire Src au chemin
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'Src'))

from maze_generator import MazeGenerator
from maze_analyzer import MazeAnalyzer


class TestMazeConnectivity:
    """Tests de connectivité du labyrinthe."""
    
    def test_maze_is_fully_connected(self):
        """Test : le labyrinthe doit être totalement connexe (100%)."""
        generator = MazeGenerator(15, 15)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        connectivity = analyzer.check_connectivity()
        
        assert connectivity['is_connected'] == True, \
            "Le labyrinthe devrait être connexe"
        assert connectivity['reachable_cells'] == connectivity['total_cells'], \
            "Toutes les cellules devraient être connectées"
        assert connectivity['connectivity_ratio'] == 1.0, \
            "Le ratio de connectivité devrait être 100%"
            
    def test_large_maze_connectivity(self):
        """Test : un grand labyrinthe doit aussi être connexe."""
        generator = MazeGenerator(30, 30)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        connectivity = analyzer.check_connectivity()
        
        assert connectivity['is_connected'] == True
        assert connectivity['connectivity_ratio'] == 1.0
        
    def test_small_maze_connectivity(self):
        """Test : un petit labyrinthe doit être connexe."""
        generator = MazeGenerator(5, 5)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        connectivity = analyzer.check_connectivity()
        
        assert connectivity['is_connected'] == True


class TestMazeDeadEnds:
    """Tests des culs-de-sac (dead ends)."""
    
    def test_braid_maze_has_no_dead_ends(self):
        """Test : un Braid Maze ne devrait avoir AUCUN cul-de-sac."""
        generator = MazeGenerator(15, 15, dead_end_ratio=0.0)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        dead_ends = analyzer.analyze_dead_ends()
        
        assert dead_ends['dead_end_count'] == 0, \
            f"Attendu 0 culs-de-sac, trouvé {dead_ends['dead_end_count']}"
        assert dead_ends['dead_end_ratio'] == 0.0, \
            "Le ratio de culs-de-sac devrait être 0%"
            
    def test_multiple_mazes_no_dead_ends(self):
        """Test : générer 5 mazes, tous sans culs-de-sac."""
        for i in range(5):
            generator = MazeGenerator(10, 10, dead_end_ratio=0.0)
            maze_data = generator.generate()
            
            analyzer = MazeAnalyzer(maze_data)
            dead_ends = analyzer.analyze_dead_ends()
            
            assert dead_ends['dead_end_count'] == 0, \
                f"Maze {i+1} a {dead_ends['dead_end_count']} culs-de-sac (attendu 0)"
                
    def test_dead_end_ratio_parameter(self):
        """Test : le paramètre dead_end_ratio doit être respecté."""
        # Avec dead_end_ratio=0.0, aucun cul-de-sac
        generator = MazeGenerator(15, 15, dead_end_ratio=0.0)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        dead_ends = analyzer.analyze_dead_ends()
        
        assert dead_ends['dead_end_count'] == 0


class TestMazeDegreeDistribution:
    """Tests de distribution des degrés (nombre de passages par cellule)."""
    
    def test_degree_distribution_exists(self):
        """Test : la distribution des degrés doit être calculable."""
        generator = MazeGenerator(15, 15)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        distribution = analyzer.analyze_degree_distribution()
        
        assert 'average_degree' in distribution
        assert 'min_degree' in distribution
        assert 'max_degree' in distribution
        assert 'degree_distribution' in distribution
        
    def test_no_degree_1_in_braid_maze(self):
        """Test : un Braid Maze ne devrait pas avoir de cellules de degré 1."""
        generator = MazeGenerator(15, 15, dead_end_ratio=0.0)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        distribution = analyzer.analyze_degree_distribution()
        
        # Degré 1 = cul-de-sac
        degree_1_count = distribution['degree_distribution'].get(1, 0)
        assert degree_1_count == 0, \
            f"Trouvé {degree_1_count} cellules de degré 1 (culs-de-sac)"
            
    def test_average_degree_for_cycles(self):
        """Test : le degré moyen devrait indiquer la présence de cycles."""
        generator = MazeGenerator(15, 15)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        distribution = analyzer.analyze_degree_distribution()
        
        # Pour un Braid Maze, degré moyen devrait être >= 2.0
        # (un labyrinthe parfait a un degré moyen de 2.0)
        assert distribution['average_degree'] >= 2.0, \
            "Le degré moyen devrait être au moins 2.0"
            
    def test_minimum_degree_is_2_in_braid(self):
        """Test : le degré minimum devrait être 2 dans un Braid Maze."""
        generator = MazeGenerator(15, 15, dead_end_ratio=0.0)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        distribution = analyzer.analyze_degree_distribution()
        
        assert distribution['min_degree'] >= 2, \
            f"Le degré minimum est {distribution['min_degree']}, attendu >= 2"


class TestMazeQuality:
    """Tests de qualité globale du labyrinthe."""
    
    def test_pacman_quality_score(self):
        """Test : le score de qualité Pac-Man doit être calculable."""
        generator = MazeGenerator(15, 15)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        quality = analyzer.evaluate_pacman_quality()
        
        assert 'connectivity_score' in quality
        assert 'dead_end_score' in quality
        assert 'cycle_score' in quality
        assert 'overall_score' in quality
        
    def test_quality_score_range(self):
        """Test : les scores doivent être entre 0 et 100."""
        generator = MazeGenerator(15, 15)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        quality = analyzer.evaluate_pacman_quality()
        
        assert 0 <= quality['connectivity_score'] <= 100
        assert 0 <= quality['dead_end_score'] <= 100
        assert 0 <= quality['cycle_score'] <= 100
        assert 0 <= quality['overall_score'] <= 100
        
    def test_high_quality_braid_maze(self):
        """Test : un Braid Maze devrait avoir un bon score."""
        generator = MazeGenerator(15, 15, dead_end_ratio=0.0)
        maze_data = generator.generate()
        
        analyzer = MazeAnalyzer(maze_data)
        quality = analyzer.evaluate_pacman_quality()
        
        # Un Braid Maze devrait avoir un score global >= 80
        assert quality['overall_score'] >= 80.0, \
            f"Score global {quality['overall_score']:.1f}, attendu >= 80"
            
        # Connexité parfaite
        assert quality['connectivity_score'] == 100.0
        
        # Pas de culs-de-sac
        assert quality['dead_end_score'] == 100.0


class TestGhostHouse:
    """Tests de la ghost house centrale."""
    
    def test_ghost_house_is_created(self):
        """Test : une ghost house devrait être créée quand demandée."""
        generator = MazeGenerator(15, 15, ghost_house=True)
        maze_data = generator.generate()
        
        assert maze_data['metadata']['ghost_house'] == True
        
    def test_ghost_house_cells_marked(self):
        """Test : les cellules de la ghost house doivent être marquées."""
        generator = MazeGenerator(15, 15, ghost_house=True)
        maze_data = generator.generate()
        
        # Compter les cellules marquées comme ghost house
        ghost_cells = [cell for cell in maze_data['cells'].values() 
                      if cell.get('is_ghost_house', False)]
        
        # Une ghost house 3x3 = 9 cellules
        assert len(ghost_cells) == 9, \
            f"Attendu 9 cellules de ghost house, trouvé {len(ghost_cells)}"
            
    def test_no_ghost_house_when_disabled(self):
        """Test : pas de ghost house quand l'option est désactivée."""
        generator = MazeGenerator(15, 15, ghost_house=False)
        maze_data = generator.generate()
        
        assert maze_data['metadata']['ghost_house'] == False


class TestMazeConsistency:
    """Tests de cohérence du labyrinthe."""
    
    def test_all_cells_have_coordinates(self):
        """Test : toutes les cellules doivent avoir des coordonnées."""
        generator = MazeGenerator(10, 10)
        maze_data = generator.generate()
        
        for cell_id, cell in maze_data['cells'].items():
            assert 'x' in cell, f"Cellule {cell_id} sans coordonnée x"
            assert 'y' in cell, f"Cellule {cell_id} sans coordonnée y"
            
    def test_all_cells_have_passages(self):
        """Test : toutes les cellules doivent avoir la propriété passages."""
        generator = MazeGenerator(10, 10)
        maze_data = generator.generate()
        
        for cell_id, cell in maze_data['cells'].items():
            assert 'passages' in cell, f"Cellule {cell_id} sans passages"
            assert isinstance(cell['passages'], list)
            
    def test_passages_are_bidirectional(self):
        """Test : les passages doivent être bidirectionnels."""
        generator = MazeGenerator(10, 10)
        maze_data = generator.generate()
        
        cells = maze_data['cells']
        width = maze_data['metadata']['width']
        
        for cell_id, cell in cells.items():
            x, y = cell['x'], cell['y']
            
            # Si passage vers le nord
            if 'N' in cell['passages']:
                if y > 0:
                    north_cell_id = f"{x},{y-1}"
                    north_cell = cells[north_cell_id]
                    assert 'S' in north_cell['passages'], \
                        f"Passage nord de {cell_id} non réciproque"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
