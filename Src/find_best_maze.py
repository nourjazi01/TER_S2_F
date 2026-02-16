"""
Script pour générer plusieurs labyrinthes et sélectionner le meilleur
Sauvegarde dans le répertoire Gallery
"""

import json
import os
from maze_generator import MazeGenerator
from ascii_renderer import ASCIIRenderer
from maze_analyzer import MazeAnalyzer


def generate_and_score(width, height):
    """Génère un labyrinthe et retourne son score."""
    generator = MazeGenerator(width, height)
    maze_data = generator.generate()
    
    analyzer = MazeAnalyzer(maze_data)
    analysis = analyzer.full_analysis()
    score = analysis['pacman_quality']['overall_score']
    
    return maze_data, score, analysis


def main():
    """Génère plusieurs labyrinthes et garde le meilleur."""
    
    print("\n" + "="*60)
    print("RECHERCHE DU MEILLEUR LABYRINTHE")
    print("="*60 + "\n")
    
    # Paramètres
    width, height = 15, 15
    num_attempts = 10
    
    best_maze = None
    best_score = 0
    best_analysis = None
    all_scores = []
    
    print(f"Génération de {num_attempts} labyrinthes {width}x{height}...\n")
    
    for i in range(num_attempts):
        maze_data, score, analysis = generate_and_score(width, height)
        all_scores.append(score)
        
        print(f"  Labyrinthe {i+1}/{num_attempts} : Score = {score:.1f}/100 ", end="")
        
        if score > best_score:
            best_score = score
            best_maze = maze_data
            best_analysis = analysis
            print("⭐ NOUVEAU MEILLEUR")
        else:
            print()
    
    # Statistiques
    print(f"\n{'='*60}")
    print("RÉSULTATS")
    print("="*60)
    print(f"Score moyen      : {sum(all_scores)/len(all_scores):.1f}/100")
    print(f"Score minimum    : {min(all_scores):.1f}/100")
    print(f"Score maximum    : {max(all_scores):.1f}/100")
    print(f"Meilleur score   : {best_score:.1f}/100")
    print("="*60 + "\n")
    
    # Sauvegarder le meilleur
    gallery_dir = os.path.join("..", "Gallery")
    os.makedirs(gallery_dir, exist_ok=True)
    
    # JSON
    json_path = os.path.join(gallery_dir, "best_maze.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(best_maze, f, indent=2, ensure_ascii=False)
    print(f"✓ Meilleur labyrinthe sauvegardé : {json_path}")
    
    # ASCII
    renderer = ASCIIRenderer(best_maze)
    ascii_output = renderer.render_with_stats()
    
    ascii_path = os.path.join(gallery_dir, "best_ascii.txt")
    with open(ascii_path, "w", encoding="utf-8") as f:
        f.write(ascii_output)
    print(f"✓ Rendu ASCII sauvegardé : {ascii_path}")
    
    # Affichage
    print("\n" + "="*60)
    print("MEILLEUR LABYRINTHE")
    print("="*60 + "\n")
    print(renderer.render())
    
    print("\n" + "="*60)
    print("ANALYSE DÉTAILLÉE")
    print("="*60)
    
    analyzer = MazeAnalyzer(best_maze)
    analyzer.print_analysis_report()
    
    print("\n💡 TIP : Prenez une capture d'écran du rendu ASCII")
    print("         et sauvegardez-la comme 'best_ascii.png' dans Gallery/")
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    main()
