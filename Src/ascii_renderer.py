"""
Rendu ASCII d'un labyrinthe à partir de sa représentation JSON
"""

import json
from typing import Dict


class ASCIIRenderer:
    """
    Classe pour afficher un labyrinthe en ASCII dans la console.
    
    Format avec caractères Unicode box-drawing :
    - ─ │ pour les murs horizontaux et verticaux
    - ┌ ┐ └ ┘ pour les coins
    - ├ ┤ ┬ ┴ ┼ pour les intersections
    - Espaces pour les passages
    """
    
    def __init__(self, maze_data: Dict):
        """
        Initialise le renderer avec les données du labyrinthe.
        
        Args:
            maze_data: Dictionnaire contenant les données du labyrinthe (format JSON)
        """
        self.maze_data = maze_data
        self.width = maze_data['metadata']['width']
        self.height = maze_data['metadata']['height']
        self.cells = maze_data['cells']
    
    def render(self) -> str:
        """
        Génère la représentation ASCII du labyrinthe avec caractères Unicode box-drawing.
        
        Returns:
            String contenant le labyrinthe en ASCII
        """
        # Calcul des dimensions du rendu
        # Chaque cellule = 4 caractères de large, 2 de haut
        render_width = self.width * 4 + 1
        render_height = self.height * 2 + 1
        
        # Grille pour marquer les murs (True = mur, False = passage)
        h_walls = [[True for _ in range(self.width + 1)] for _ in range(self.height + 1)]
        v_walls = [[True for _ in range(self.width + 1)] for _ in range(self.height + 1)]
        
        # Marquer les passages selon les données du labyrinthe
        for cell_key, cell_data in self.cells.items():
            cx, cy = cell_data['x'], cell_data['y']
            passages = cell_data['passages']
            
            for direction in passages:
                if direction == 'N':  # Passage vers le nord
                    h_walls[cy][cx] = False
                elif direction == 'S':  # Passage vers le sud
                    h_walls[cy + 1][cx] = False
                elif direction == 'E':  # Passage vers l'est
                    v_walls[cy][cx + 1] = False
                elif direction == 'W':  # Passage vers l'ouest
                    v_walls[cy][cx] = False
        
        # Construire le rendu ligne par ligne
        lines = []
        
        for row in range(self.height * 2 + 1):
            line = []
            
            if row % 2 == 0:  # Ligne horizontale (murs horizontaux)
                y = row // 2
                for col in range(self.width + 1):
                    # Déterminer les connexions
                    has_up = y > 0 and v_walls[y - 1][col]
                    has_down = y < self.height and v_walls[y][col]
                    has_left = col > 0 and h_walls[y][col - 1]
                    has_right = col < self.width and h_walls[y][col]
                    
                    # Choisir le caractère d'intersection
                    if has_up and has_down and has_left and has_right:
                        char = '┼'
                    elif has_up and has_down and has_left:
                        char = '┤'
                    elif has_up and has_down and has_right:
                        char = '├'
                    elif has_up and has_left and has_right:
                        char = '┴'
                    elif has_down and has_left and has_right:
                        char = '┬'
                    elif has_up and has_down:
                        char = '│'
                    elif has_left and has_right:
                        char = '─'
                    elif has_up and has_left:
                        char = '┘'
                    elif has_up and has_right:
                        char = '└'
                    elif has_down and has_left:
                        char = '┐'
                    elif has_down and has_right:
                        char = '┌'
                    elif has_up or has_down:
                        char = '│'
                    elif has_left or has_right:
                        char = '─'
                    else:
                        char = ' '
                    
                    line.append(char)
                    
                    # Ajouter le mur horizontal
                    if col < self.width:
                        if h_walls[y][col]:
                            line.append('───')
                        else:
                            line.append('   ')
            
            else:  # Ligne verticale (murs verticaux et espaces)
                y = row // 2
                for col in range(self.width + 1):
                    if v_walls[y][col]:
                        line.append('│')
                    else:
                        line.append(' ')
                    
                    if col < self.width:
                        line.append('   ')
            
            lines.append(''.join(line))
        
        return '\n'.join(lines)
    
    def render_with_stats(self) -> str:
        """
        Génère le rendu ASCII avec des statistiques.
        
        Returns:
            String contenant le labyrinthe et ses statistiques
        """
        ascii_maze = self.render()
        
        # Calculer les statistiques
        total_cells = len(self.cells)
        degrees = [cell['degree'] for cell in self.cells.values()]
        avg_degree = sum(degrees) / total_cells if total_cells > 0 else 0
        dead_ends = sum(1 for d in degrees if d == 1)
        
        stats = f"""
{'=' * 50}
LABYRINTHE TYPE PAC-MAN (Braid Maze)
{'=' * 50}

{ascii_maze}

{'=' * 50}
STATISTIQUES
{'=' * 50}
Dimensions       : {self.width} x {self.height}
Cellules totales : {total_cells}
Degré moyen      : {avg_degree:.2f}
Culs-de-sac      : {dead_ends} (objectif: 0 pour Pac-Man)
Type             : {self.maze_data['metadata']['type']}
Algorithme       : {self.maze_data['metadata']['algorithm']}
{'=' * 50}
"""
        return stats


def render_maze_from_file(json_file: str, show_stats: bool = True) -> str:
    """
    Charge et affiche un labyrinthe depuis un fichier JSON.
    
    Args:
        json_file: Chemin vers le fichier JSON
        show_stats: Si True, affiche les statistiques
    
    Returns:
        Représentation ASCII du labyrinthe
    """
    with open(json_file, 'r', encoding='utf-8') as f:
        maze_data = json.load(f)
    
    renderer = ASCIIRenderer(maze_data)
    
    if show_stats:
        return renderer.render_with_stats()
    else:
        return renderer.render()


if __name__ == "__main__":
    # Test avec un fichier JSON
    import sys
    
    if len(sys.argv) > 1:
        json_file = sys.argv[1]
    else:
        json_file = "maze_output.json"
    
    try:
        ascii_output = render_maze_from_file(json_file)
        print(ascii_output)
    except FileNotFoundError:
        print(f"Erreur : fichier '{json_file}' introuvable.")
        print("Générez d'abord un labyrinthe avec maze_generator.py")
