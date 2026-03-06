"""
Application Flask pour visualiser les labyrinthes avec graphismes style Pac-Man
"""

from flask import Flask, render_template, jsonify, request
import sys
import os
import json

# Ajouter le répertoire Src au chemin Python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'Src'))

from maze_generator import MazeGenerator

app = Flask(__name__)

# Variable globale pour stocker les données du labyrinthe actuel
current_maze = None


@app.route('/')
def index():
    """Affiche la page principale avec le labyrinthe."""
    return render_template('index.html')


@app.route('/api/generate-maze', methods=['POST'])
def generate_maze():
    """
    Génère un nouveau labyrinthe avec paramètres de jouabilité.
    
    Paramètres JSON:
        - width (int): largeur (5-50)
        - height (int): hauteur (5-50)
        - playability (float): 0.0 (facile) à 1.0 (difficile)
        - dead_end_ratio (float): 0.0 (aucun) à 1.0 (tous)
        - cycle_intensity (float): 0.0 (peu) à 1.0 (beaucoup)
    """
    global current_maze
    
    data = request.get_json()
    width = data.get('width', 15)
    height = data.get('height', 15)
    playability = data.get('playability', 0.5)
    dead_end_ratio = data.get('dead_end_ratio', 0.0)
    cycle_intensity = data.get('cycle_intensity', 0.5)
    
    # Valider les dimensions
    if width < 5 or height < 5 or width > 50 or height > 50:
        return jsonify({'error': 'Dimensions invalides (5-50)'}), 400
    
    try:
        # Générer le labyrinthe avec les paramètres
        generator = MazeGenerator(
            width, 
            height,
            playability=playability,
            dead_end_ratio=dead_end_ratio,
            cycle_intensity=cycle_intensity
        )
        current_maze = generator.generate()
        
        return jsonify({
            'success': True,
            'maze': current_maze,
            'width': width,
            'height': height,
            'parameters': {
                'playability': playability,
                'dead_end_ratio': dead_end_ratio,
                'cycle_intensity': cycle_intensity
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/maze', methods=['GET'])
def get_maze():
    """Retourne les données du labyrinthe actuel."""
    global current_maze
    
    if current_maze is None:
        # Générer un labyrinthe par défaut
        generator = MazeGenerator(15, 15)
        current_maze = generator.generate()
    
    return jsonify(current_maze)


@app.route('/api/maze-info', methods=['GET'])
def get_maze_info():
    """Retourne les informations du labyrinthe actuel."""
    global current_maze
    
    if current_maze is None:
        return jsonify({'error': 'Aucun labyrinthe généré'}), 404
    
    metadata = current_maze.get('metadata', {})
    return jsonify({
        'width': metadata.get('width'),
        'height': metadata.get('height'),
        'type': metadata.get('type'),
        'has_warp_tunnels': metadata.get('has_warp_tunnels'),
        'cell_count': len(current_maze.get('cells', {}))
    })


if __name__ == '__main__':
    # Générer un labyrinthe par défaut au démarrage
    generator = MazeGenerator(15, 15)
    current_maze = generator.generate()
    
    # Lancer l'app en mode développement
    # Port depuis variable d'environnement ou 5000 par défaut
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
