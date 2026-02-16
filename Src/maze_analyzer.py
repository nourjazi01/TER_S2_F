"""
Module d'analyse et de qualification des labyrinthes
Tests pour évaluer la qualité des mazes générés
"""

import json
from typing import Dict, Set, Tuple, List
from collections import deque


class MazeAnalyzer:
    """
    Classe pour analyser et qualifier un labyrinthe.
    
    Tests implémentés :
    - Connexité : vérifier que toutes les cellules sont accessibles
    - Proportion de la composante connexe principale
    - Présence de culs-de-sac (dead ends)
    - Distribution des degrés des cellules
    - Qualité "Pac-Man" (zéro dead end, cycles présents)
    """
    
    def __init__(self, maze_data: Dict):
        """
        Initialise l'analyseur avec les données du labyrinthe.
        
        Args:
            maze_data: Dictionnaire contenant les données du labyrinthe
        """
        self.maze_data = maze_data
        self.width = maze_data['metadata']['width']
        self.height = maze_data['metadata']['height']
        self.cells = maze_data['cells']
    
    def _get_neighbors_from_passages(self, x: int, y: int) -> List[Tuple[int, int]]:
        """
        Retourne les voisins accessibles depuis une cellule.
        
        Args:
            x, y: Coordonnées de la cellule
        
        Returns:
            Liste des coordonnées des voisins accessibles
        """
        cell_key = f"{x},{y}"
        if cell_key not in self.cells:
            return []
        
        passages = self.cells[cell_key]['passages']
        neighbors = []
        
        for direction in passages:
            if direction == 'N' and y > 0:
                neighbors.append((x, y - 1))
            elif direction == 'S' and y < self.height - 1:
                neighbors.append((x, y + 1))
            elif direction == 'E' and x < self.width - 1:
                neighbors.append((x + 1, y))
            elif direction == 'W' and x > 0:
                neighbors.append((x - 1, y))
        
        return neighbors
    
    def check_connectivity(self) -> Dict:
        """
        Vérifie la connexité du labyrinthe via BFS.
        
        Returns:
            Dictionnaire avec :
            - is_connected: bool
            - reachable_cells: nombre de cellules accessibles
            - total_cells: nombre total de cellules
            - connectivity_ratio: proportion de cellules accessibles
        """
        if not self.cells:
            return {
                "is_connected": False,
                "reachable_cells": 0,
                "total_cells": 0,
                "connectivity_ratio": 0.0
            }
        
        # BFS depuis la cellule (0, 0)
        start = (0, 0)
        visited = {start}
        queue = deque([start])
        
        while queue:
            x, y = queue.popleft()
            neighbors = self._get_neighbors_from_passages(x, y)
            
            for nx, ny in neighbors:
                if (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
        
        total_cells = len(self.cells)
        reachable_cells = len(visited)
        
        return {
            "is_connected": reachable_cells == total_cells,
            "reachable_cells": reachable_cells,
            "total_cells": total_cells,
            "connectivity_ratio": reachable_cells / total_cells if total_cells > 0 else 0.0
        }
    
    def analyze_dead_ends(self) -> Dict:
        """
        Analyse les culs-de-sac (cellules de degré 1).
        
        Returns:
            Dictionnaire avec :
            - dead_end_count: nombre de culs-de-sac
            - dead_end_positions: liste des positions
            - dead_end_ratio: proportion de culs-de-sac
        """
        dead_ends = []
        
        for cell_key, cell_data in self.cells.items():
            if cell_data['degree'] == 1:
                dead_ends.append((cell_data['x'], cell_data['y']))
        
        total_cells = len(self.cells)
        
        return {
            "dead_end_count": len(dead_ends),
            "dead_end_positions": dead_ends,
            "dead_end_ratio": len(dead_ends) / total_cells if total_cells > 0 else 0.0
        }
    
    def analyze_degree_distribution(self) -> Dict:
        """
        Analyse la distribution des degrés des cellules.
        
        Returns:
            Dictionnaire avec :
            - degree_distribution: {degré: nombre de cellules}
            - average_degree: degré moyen
            - min_degree: degré minimum
            - max_degree: degré maximum
        """
        degrees = [cell['degree'] for cell in self.cells.values()]
        
        if not degrees:
            return {
                "degree_distribution": {},
                "average_degree": 0.0,
                "min_degree": 0,
                "max_degree": 0
            }
        
        # Distribution
        distribution = {}
        for degree in degrees:
            distribution[degree] = distribution.get(degree, 0) + 1
        
        return {
            "degree_distribution": distribution,
            "average_degree": sum(degrees) / len(degrees),
            "min_degree": min(degrees),
            "max_degree": max(degrees)
        }
    
    def evaluate_pacman_quality(self) -> Dict:
        """
        Évalue la qualité du labyrinthe pour un gameplay type Pac-Man.
        
        Critères :
        - Connexité complète (score: 0 ou 100)
        - Absence de culs-de-sac (score: 0-100)
        - Présence de cycles (score basé sur le degré moyen)
        
        Returns:
            Dictionnaire avec :
            - connectivity_score: score de connexité (0-100)
            - dead_end_score: score absence de culs-de-sac (0-100)
            - cycle_score: score présence de cycles (0-100)
            - overall_score: score global (0-100)
            - is_pacman_ready: True si score >= 90
        """
        connectivity = self.check_connectivity()
        dead_ends = self.analyze_dead_ends()
        degree_dist = self.analyze_degree_distribution()
        
        # Score de connexité : 100 si complètement connexe, 0 sinon
        connectivity_score = 100.0 if connectivity['is_connected'] else 0.0
        
        # Score d'absence de culs-de-sac : 100 si aucun, décroît linéairement
        dead_end_score = max(0, 100.0 * (1 - dead_ends['dead_end_ratio'] * 2))
        
        # Score de cycles : basé sur le degré moyen (optimal autour de 2.5-3)
        # Degré 2 = pas assez de cycles, degré 4 = trop de passages
        avg_degree = degree_dist['average_degree']
        if avg_degree < 2:
            cycle_score = 0.0
        elif 2 <= avg_degree <= 3:
            cycle_score = (avg_degree - 2) * 100  # 0-100 pour 2-3
        else:
            cycle_score = max(0, 100 - (avg_degree - 3) * 25)  # Décroît si > 3
        
        # Score global
        overall_score = (connectivity_score * 0.4 + 
                        dead_end_score * 0.4 + 
                        cycle_score * 0.2)
        
        return {
            "connectivity_score": connectivity_score,
            "dead_end_score": dead_end_score,
            "cycle_score": cycle_score,
            "overall_score": overall_score,
            "is_pacman_ready": overall_score >= 90,
            "details": {
                "is_connected": connectivity['is_connected'],
                "dead_end_count": dead_ends['dead_end_count'],
                "average_degree": avg_degree
            }
        }
    
    def full_analysis(self) -> Dict:
        """
        Effectue une analyse complète du labyrinthe.
        
        Returns:
            Dictionnaire avec tous les résultats d'analyse
        """
        return {
            "connectivity": self.check_connectivity(),
            "dead_ends": self.analyze_dead_ends(),
            "degree_distribution": self.analyze_degree_distribution(),
            "pacman_quality": self.evaluate_pacman_quality()
        }
    
    def print_analysis_report(self):
        """Affiche un rapport d'analyse complet dans la console."""
        analysis = self.full_analysis()
        
        print("\n" + "=" * 60)
        print("RAPPORT D'ANALYSE DU LABYRINTHE")
        print("=" * 60)
        
        # Métadonnées
        print(f"\n📏 DIMENSIONS : {self.width} x {self.height}")
        print(f"   Type : {self.maze_data['metadata']['type']}")
        print(f"   Algorithme : {self.maze_data['metadata']['algorithm']}")
        
        # Connexité
        conn = analysis['connectivity']
        print(f"\n🔗 CONNEXITÉ")
        print(f"   Connexe : {'✓ OUI' if conn['is_connected'] else '✗ NON'}")
        print(f"   Cellules accessibles : {conn['reachable_cells']}/{conn['total_cells']}")
        print(f"   Ratio : {conn['connectivity_ratio']*100:.1f}%")
        
        # Culs-de-sac
        de = analysis['dead_ends']
        print(f"\n🚫 CULS-DE-SAC (Dead Ends)")
        print(f"   Nombre : {de['dead_end_count']}")
        print(f"   Ratio : {de['dead_end_ratio']*100:.1f}%")
        print(f"   Statut : {'✓ AUCUN (objectif Pac-Man atteint)' if de['dead_end_count'] == 0 else '⚠ PRÉSENTS'}")
        
        # Distribution des degrés
        dd = analysis['degree_distribution']
        print(f"\n📊 DISTRIBUTION DES DEGRÉS")
        print(f"   Degré moyen : {dd['average_degree']:.2f}")
        print(f"   Min : {dd['min_degree']}, Max : {dd['max_degree']}")
        print(f"   Distribution :")
        for degree, count in sorted(dd['degree_distribution'].items()):
            percentage = count / len(self.cells) * 100
            print(f"      Degré {degree} : {count} cellules ({percentage:.1f}%)")
        
        # Qualité Pac-Man
        pq = analysis['pacman_quality']
        print(f"\n🎮 QUALITÉ PAC-MAN")
        print(f"   Score connexité : {pq['connectivity_score']:.1f}/100")
        print(f"   Score anti-culs-de-sac : {pq['dead_end_score']:.1f}/100")
        print(f"   Score cycles : {pq['cycle_score']:.1f}/100")
        print(f"   SCORE GLOBAL : {pq['overall_score']:.1f}/100")
        print(f"   Status : {'✓ PRÊT POUR PAC-MAN' if pq['is_pacman_ready'] else '⚠ NÉCESSITE AMÉLIORATIONS'}")
        
        print("\n" + "=" * 60 + "\n")


def analyze_maze_from_file(json_file: str) -> Dict:
    """
    Charge et analyse un labyrinthe depuis un fichier JSON.
    
    Args:
        json_file: Chemin vers le fichier JSON
    
    Returns:
        Dictionnaire contenant l'analyse complète
    """
    with open(json_file, 'r', encoding='utf-8') as f:
        maze_data = json.load(f)
    
    analyzer = MazeAnalyzer(maze_data)
    return analyzer.full_analysis()


if __name__ == "__main__":
    # Test avec un fichier JSON
    import sys
    
    if len(sys.argv) > 1:
        json_file = sys.argv[1]
    else:
        json_file = "maze_output.json"
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            maze_data = json.load(f)
        
        analyzer = MazeAnalyzer(maze_data)
        analyzer.print_analysis_report()
        
    except FileNotFoundError:
        print(f"Erreur : fichier '{json_file}' introuvable.")
        print("Générez d'abord un labyrinthe avec maze_generator.py")
