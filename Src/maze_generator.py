"""
Générateur de labyrinthes type Pac-Man (Braid Maze)
Algorithme : Hybrid Prim-DFS + suppression des culs-de-sac pour créer des cycles
"""

import random
import json
from typing import List, Tuple, Dict, Set


class MazeGenerator:
    """
    Classe pour générer des labyrinthes sans culs-de-sac (Braid Maze).
    
    Stratégie :
    1. Générer un labyrinthe avec algorithme hybride (corridors plus courts)
    2. Créer une ghost house centrale
    3. Identifier tous les dead ends (cellules de degré 1)
    4. Supprimer les dead ends en ouvrant des passages supplémentaires
    5. Résultat : labyrinthe avec cycles, adapté au gameplay Pac-Man
    """
    
    def __init__(self, width: int, height: int, ghost_house: bool = True):
        """
        Initialise le générateur.
        
        Args:
            width: Largeur du labyrinthe (nombre de cellules)
            height: Hauteur du labyrinthe (nombre de cellules)
            ghost_house: Si True, crée une zone centrale "ghost house"
        """
        self.width = width
        self.height = height
        self.ghost_house = ghost_house
        # Murs : dict[(x,y), direction] -> bool (True = mur fermé, False = passage)
        # Directions: 'N' (nord), 'S' (sud), 'E' (est), 'W' (ouest)
        self.walls = {}
        self.visited = set()
        
        # Définir la zone de la ghost house (zone centrale)
        if self.ghost_house:
            self.ghost_house_zone = self._calculate_ghost_house_zone()
        else:
            self.ghost_house_zone = set()
        
        # Initialiser tous les murs comme fermés
        self._initialize_walls()
    
    def _calculate_ghost_house_zone(self) -> Set[Tuple[int, int]]:
        """
        Calcule la zone centrale pour la ghost house (environ 3x3 cellules).
        
        Returns:
            Set de coordonnées (x, y) formant la ghost house
        """
        center_x = self.width // 2
        center_y = self.height // 2
        
        # Créer une zone 3x3 au centre
        ghost_zone = set()
        for dy in range(-1, 2):
            for dx in range(-1, 2):
                x, y = center_x + dx, center_y + dy
                if 0 <= x < self.width and 0 <= y < self.height:
                    ghost_zone.add((x, y))
        
        return ghost_zone
    
    def _is_ghost_house(self, x: int, y: int) -> bool:
        """Vérifie si une cellule fait partie de la ghost house."""
        return (x, y) in self.ghost_house_zone
    
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
        Génère un labyrinthe avec algorithme hybride (Prim-like DFS).
        Crée des corridors plus courts en alternant entre DFS et sélection aléatoire.
        Évite la ghost house si elle existe.
        """
        # Marquer toutes les cellules de la ghost house comme visitées
        for gx, gy in self.ghost_house_zone:
            self.visited.add((gx, gy))
        
        stack = [(start_x, start_y)]
        self.visited.add((start_x, start_y))
        
        while stack:
            # Hybride : 70% du temps on utilise le dernier élément (DFS)
            # 30% du temps on prend un élément aléatoire (crée plus de branches)
            if random.random() < 0.7 and len(stack) > 0:
                x, y = stack[-1]
            else:
                if not stack:
                    break
                idx = random.randint(0, len(stack) - 1)
                x, y = stack[idx]
            
            # Trouver les voisins non visités (hors ghost house)
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
                # Retirer cet élément de la pile
                stack.remove((x, y))
    
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
        Exclut la ghost house.
        
        Returns:
            Liste des coordonnées des dead ends
        """
        dead_ends = []
        
        for y in range(self.height):
            for x in range(self.width):
                # Ignorer la ghost house
                if self._is_ghost_house(x, y):
                    continue
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
    
    def _create_ghost_house(self):
        """
        Crée une zone centrale vide (ghost house) comme dans Pac-Man.
        Ouvre tous les murs internes et crée une entrée/sortie.
        """
        if not self.ghost_house_zone:
            return
        
        # Ouvrir tous les murs internes de la ghost house
        for x, y in self.ghost_house_zone:
            for direction in ['N', 'S', 'E', 'W']:
                if direction == 'N' and (x, y - 1) in self.ghost_house_zone:
                    if (x, y, 'N') in self.walls:
                        self.walls[(x, y, 'N')] = False
                    if (x, y - 1, 'S') in self.walls:
                        self.walls[(x, y - 1, 'S')] = False
                elif direction == 'S' and (x, y + 1) in self.ghost_house_zone:
                    if (x, y, 'S') in self.walls:
                        self.walls[(x, y, 'S')] = False
                    if (x, y + 1, 'N') in self.walls:
                        self.walls[(x, y + 1, 'N')] = False
                elif direction == 'E' and (x + 1, y) in self.ghost_house_zone:
                    if (x, y, 'E') in self.walls:
                        self.walls[(x, y, 'E')] = False
                    if (x + 1, y, 'W') in self.walls:
                        self.walls[(x + 1, y, 'W')] = False
                elif direction == 'W' and (x - 1, y) in self.ghost_house_zone:
                    if (x, y, 'W') in self.walls:
                        self.walls[(x, y, 'W')] = False
                    if (x - 1, y, 'E') in self.walls:
                        self.walls[(x - 1, y, 'E')] = False
        
        # Créer une entrée au sommet de la ghost house
        center_x = self.width // 2
        top_y = min(y for x, y in self.ghost_house_zone if x == center_x)
        
        if top_y > 0:
            self._remove_wall(center_x, top_y, center_x, top_y - 1, 'N')
    
    def generate(self) -> Dict:
        """
        Génère un labyrinthe de type Braid Maze avec ghost house optionnelle.
        
        Returns:
            Dictionnaire représentant le labyrinthe (exportable en JSON)
        """
        # Étape 1 : Générer un labyrinthe parfait (en évitant la ghost house)
        self._generate_perfect_maze_dfs()
        
        # Étape 2 : Créer la ghost house si activée
        if self.ghost_house:
            self._create_ghost_house()
        
        # Étape 3 : Supprimer tous les dead ends
        self._remove_dead_ends()
        
        # Étape 4 : Exporter au format JSON
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
                    "degree": len(open_passages),
                    "is_ghost_house": self._is_ghost_house(x, y)
                }
        
        return {
            "metadata": {
                "width": self.width,
                "height": self.height,
                "type": "braid_maze",
                "algorithm": "Hybrid Prim-DFS + dead-end removal",
                "ghost_house": self.ghost_house,
                "ghost_house_cells": len(self.ghost_house_zone)
            },
            "cells": cells
        }


if __name__ == "__main__":
    # Test de génération
    print("Génération d'un labyrinthe 15x15 avec ghost house...")
    generator = MazeGenerator(15, 15)
    maze_data = generator.generate()
    
    # Sauvegarder en JSON
    with open("maze_output.json", "w", encoding="utf-8") as f:
        json.dump(maze_data, f, indent=2, ensure_ascii=False)
    
    print("✓ Labyrinthe généré et sauvegardé dans maze_output.json")
    print(f"  Dimensions: {maze_data['metadata']['width']}x{maze_data['metadata']['height']}")
    print(f"  Type: {maze_data['metadata']['type']}")
    print(f"  Ghost House: {maze_data['metadata']['ghost_house']}")
    print(f"  Nombre de cellules: {len(maze_data['cells'])}")
