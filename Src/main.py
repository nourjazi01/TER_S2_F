"""
Script principal pour générer, afficher et analyser des labyrinthes
Utilisation : python main.py [largeur] [hauteur]
"""

import sys
import json
from maze_generator import MazeGenerator
from ascii_renderer import ASCIIRenderer
from maze_analyzer import MazeAnalyzer


def main():
    """Fonction principale du programme."""
    
    # Paramètres par défaut
    width = 15
    height = 15
    
    # Lecture des arguments de ligne de commande
    if len(sys.argv) > 2:
        try:
            width = int(sys.argv[1])
            height = int(sys.argv[2])
        except ValueError:
            print("Erreur : largeur et hauteur doivent être des entiers")
            sys.exit(1)
    
    print(f"\n{'='*60}")
    print(f"GÉNÉRATEUR DE LABYRINTHES TYPE PAC-MAN")
    print(f"{'='*60}\n")
    
    # Génération du labyrinthe
    print(f"📐 Génération d'un labyrinthe {width}x{height}...")
    generator = MazeGenerator(width, height)
    maze_data = generator.generate()
    print("✓ Labyrinthe généré (algorithme: Braid Maze)")
    
    # Sauvegarde JSON
    json_file = "maze_output.json"
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(maze_data, f, indent=2, ensure_ascii=False)
    print(f"✓ Sauvegardé dans {json_file}")
    
    # Affichage ASCII
    print("\n🎨 Rendu ASCII du labyrinthe :")
    print("-" * 60)
    renderer = ASCIIRenderer(maze_data)
    ascii_output = renderer.render()
    print(ascii_output)
    print("-" * 60)
    
    # Analyse du labyrinthe
    print("\n🔍 Analyse du labyrinthe...\n")
    analyzer = MazeAnalyzer(maze_data)
    analyzer.print_analysis_report()
    
    # Sauvegarde du rendu ASCII (pour Gallery)
    ascii_file = "maze_ascii.txt"
    with open(ascii_file, "w", encoding="utf-8") as f:
        f.write(renderer.render_with_stats())
    print(f"✓ Rendu ASCII complet sauvegardé dans {ascii_file}")
    
    print("\n" + "="*60)
    print("Programme terminé avec succès !")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
