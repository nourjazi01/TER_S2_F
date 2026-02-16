"""
Générateur de labyrinthes type Pac-Man (Braid Maze)
Algorithme : DFS + suppression des culs-de-sac pour créer des cycles
"""

import random
import json
from typing import List, Tuple, Dict, Set


class MazeGenerator:
    """
    Classe pour générer des labyrinthes sans culs-de-sac (Braid Maze).
    
    Stratégie :
    1. Générer un labyrinthe parfait avec DFS
    2. Identifier tous les dead ends (cellules de degré 1)
    3. Supprimer les dead ends en ouvrant des passages supplémentaires
    4. Résultat : labyrinthe avec cycles, adapté au gameplay Pac-Man
    """
    
    def __init__(self, width: int, height: int):
        """
        Initialise le générateur.
        
        Args:
            width: Largeur du labyrinthe (nombre de cellules)
            height: Hauteur du labyrinthe (nombre de cellules)
        """
        self.width = width
        self.height = height
        # Murs : dict[(x,y), direction] -> bool (True = mur fermé, False = passage)
        # Directions: 'N' (nord), 'S' (sud), 'E' (est), 'W' (ouest)
        self.walls = {}
        self.visited = set()
        
        # Initialiser tous les murs comme fermés
        self._initialize_walls()
    
    def _initialize_walls(self):
        """Initialise tous les murs comme fermés."""
        for y in range(self.height):
            for x in range(self.width):
                # Mur nord (sauf première ligne)
                if y > 0:
                    self.walls[(x, y, 'N')] = True
                # Mur sud (sauf dernière ligne)
                if y < self.height - 1:
                    self.walls[(x, y, 'S')] = True
                # Mur est (sauf dernière colonne)
                if x < self.width - 1:
                    self.walls[(x, y, 'E')] = True
                # Mur ouest (sauf première colonne)
                if x > 0:
                    self.walls[(x, y, 'W')] = True
    
    def _get_neighbors(self, x: int, y: int) -> List[Tuple[int, int, str]]:
        """
        Retourne les voisins d'une cellule avec la direction pour y accéder.
        
        Returns:
            Liste de tuples (x_voisin, y_voisin, direction)
        """
        neighbors = []
        
        if y > 0:  # Nord
            neighbors.append((x, y - 1, 'N'))
        if y < self.height - 1:  # Sud
            neighbors.append((x, y + 1, 'S'))
        if x < self.width - 1:  # Est
            neighbors.append((x + 1, y, 'E'))
        if x > 0:  # Ouest
            neighbors.append((x - 1, y, 'W'))
        
        return neighbors
    
    def _opposite_direction(self, direction: str) -> str:
        """Retourne la direction opposée."""
        opposites = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}
        return opposites[direction]
    
    def _remove_wall(self, x: int, y: int, nx: int, ny: int, direction: str):
        """Supprime le mur entre deux cellules."""
        # Supprimer le mur depuis la cellule actuelle
        self.walls[(x, y, direction)] = False
        # Supprimer le mur depuis la cellule voisine (direction opposée)
        opp_dir = self._opposite_direction(direction)
        self.walls[(nx, ny, opp_dir)] = False
    
    def _generate_perfect_maze_dfs(self, start_x: int = 0, start_y: int = 0):
        """
        Génère un labyrinthe parfait (arbre couvrant) avec DFS.
        Un labyrinthe parfait = 1 seul chemin entre 2 cellules, pas de cycles.
        """
        stack = [(start_x, start_y)]
        self.visited.add((start_x, start_y))
        
        while stack:
            x, y = stack[-1]
            
            # Trouver les voisins non visités
            neighbors = self._get_neighbors(x, y)
            unvisited_neighbors = [
                (nx, ny, direction) 
                for nx, ny, direction in neighbors 
                if (nx, ny) not in self.visited
            ]
            
            if unvisited_neighbors:
                # Choisir un voisin aléatoire
                nx, ny, direction = random.choice(unvisited_neighbors)
                
                # Supprimer le mur entre les deux cellules
                self._remove_wall(x, y, nx, ny, direction)
                
                # Marquer comme visité et ajouter à la pile
                self.visited.add((nx, ny))
                stack.append((nx, ny))
            else:
                # Backtrack si aucun voisin non visité
                stack.pop()
    
    def _get_cell_degree(self, x: int, y: int) -> int:
        """
        Calcule le degré d'une cellule (nombre de passages ouverts).
        
        Returns:
            Degré de la cellule (0-4)
        """
        degree = 0
        
        # Vérifier chaque direction
        if (x, y, 'N') in self.walls and not self.walls[(x, y, 'N')]:
            degree += 1
        if (x, y, 'S') in self.walls and not self.walls[(x, y, 'S')]:
            degree += 1
        if (x, y, 'E') in self.walls and not self.walls[(x, y, 'E')]:
            degree += 1
        if (x, y, 'W') in self.walls and not self.walls[(x, y, 'W')]:
            degree += 1
        
        return degree
    
    def _find_dead_ends(self) -> List[Tuple[int, int]]:
        """
        Identifie toutes les cellules culs-de-sac (degré = 1).
        
        Returns:
            Liste des coordonnées des dead ends
        """
        dead_ends = []
        
        for y in range(self.height):
            for x in range(self.width):
                if self._get_cell_degree(x, y) == 1:
                    dead_ends.append((x, y))
        
        return dead_ends
    
    def _remove_dead_ends(self):
        """
        Supprime tous les culs-de-sac en ouvrant des passages supplémentaires.
        Chaque suppression crée un cycle, transformant le labyrinthe parfait en Braid Maze.
        """
        iteration = 0
        while True:
            dead_ends = self._find_dead_ends()
            
            if not dead_ends:
                break  # Plus de culs-de-sac
            
            iteration += 1
            
            for x, y in dead_ends:
                # Trouver les voisins avec un mur fermé
                neighbors = self._get_neighbors(x, y)
                closed_neighbors = [
                    (nx, ny, direction)
                    for nx, ny, direction in neighbors
                    if (x, y, direction) in self.walls and self.walls[(x, y, direction)]
                ]
                
                if closed_neighbors:
                    # Ouvrir un mur aléatoire pour créer un cycle
                    nx, ny, direction = random.choice(closed_neighbors)
                    self._remove_wall(x, y, nx, ny, direction)
    
    def generate(self) -> Dict:
        """
        Génère un labyrinthe de type Braid Maze.
        
        Returns:
            Dictionnaire représentant le labyrinthe (exportable en JSON)
        """
        # Étape 1 : Générer un labyrinthe parfait
        self._generate_perfect_maze_dfs()
        
        # Étape 2 : Supprimer tous les dead ends
        self._remove_dead_ends()
        
        # Étape 3 : Exporter au format JSON
        return self.to_json()
    
    def to_json(self) -> Dict:
        """
        Exporte le labyrinthe au format JSON.
        
        Returns:
            Dictionnaire avec :
            - metadata : largeur, hauteur, type
            - cells : pour chaque cellule, les directions de passages ouverts
        """
        cells = {}
        
        for y in range(self.height):
            for x in range(self.width):
                cell_key = f"{x},{y}"
                open_passages = []
                
                # Vérifier chaque direction
                for direction in ['N', 'S', 'E', 'W']:
                    if (x, y, direction) in self.walls and not self.walls[(x, y, direction)]:
                        open_passages.append(direction)
                
                cells[cell_key] = {
                    "x": x,
                    "y": y,
                    "passages": open_passages,
                    "degree": len(open_passages)
                }
        
        return {
            "metadata": {
                "width": self.width,
                "height": self.height,
                "type": "braid_maze",
                "algorithm": "DFS + dead-end removal"
            },
            "cells": cells
        }


if __name__ == "__main__":
    # Test de génération
    print("Génération d'un labyrinthe 10x10...")
    generator = MazeGenerator(10, 10)
    maze_data = generator.generate()
    
    # Sauvegarder en JSON
    with open("maze_output.json", "w", encoding="utf-8") as f:
        json.dump(maze_data, f, indent=2, ensure_ascii=False)
    
    print("✓ Labyrinthe généré et sauvegardé dans maze_output.json")
    print(f"  Dimensions: {maze_data['metadata']['width']}x{maze_data['metadata']['height']}")
    print(f"  Type: {maze_data['metadata']['type']}")
    print(f"  Nombre de cellules: {len(maze_data['cells'])}")
