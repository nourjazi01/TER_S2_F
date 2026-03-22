"""
Application Flask pour visualiser les labyrinthes avec graphismes style Pac-Man
"""

from flask import Flask, render_template, jsonify, request
import sys
import os
import json

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Ajouter le répertoire Src au chemin Python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'Src'))

from maze_generator import MazeGenerator
from database import save_maze, list_mazes, get_maze as db_get_maze, delete_maze

# Configure Flask with static folder in Src directory
app = Flask(__name__, static_folder='Src/static', static_url_path='/static')

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


# ============= Maze Storage API Endpoints =============

@app.route('/api/mazes/save', methods=['POST'])
def save_current_maze():
    """Save the current maze to database."""
    global current_maze

    if current_maze is None:
        return jsonify({'error': 'Aucun labyrinthe à sauvegarder'}), 400

    data = request.get_json() or {}
    custom_name = data.get('name')

    try:
        result = save_maze(current_maze, custom_name)
        return jsonify({
            'success': True,
            **result
        }), 201
    except ValueError as e:
        # MONGODB_URI not set
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/mazes', methods=['GET'])
def get_saved_mazes():
    """List all saved mazes."""
    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)
    sort = request.args.get('sort', 'newest')

    # Validate parameters
    limit = min(limit, 100)  # Max 100 per request

    try:
        result = list_mazes(limit, offset, sort)
        return jsonify(result)
    except ValueError as e:
        # MONGODB_URI not set
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/mazes/<maze_id>', methods=['GET'])
def get_saved_maze(maze_id):
    """Get a specific saved maze."""
    try:
        maze = db_get_maze(maze_id)

        if maze is None:
            return jsonify({'error': 'Labyrinthe non trouvé'}), 404

        return jsonify(maze)
    except ValueError as e:
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/mazes/<maze_id>', methods=['DELETE'])
def delete_saved_maze(maze_id):
    """Delete a saved maze."""
    try:
        if delete_maze(maze_id):
            return jsonify({
                'success': True,
                'deleted_id': maze_id
            })
        else:
            return jsonify({'error': 'Labyrinthe non trouvé'}), 404
    except ValueError as e:
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/mazes/<maze_id>/load', methods=['POST'])
def load_saved_maze(maze_id):
    """Load a saved maze as the current maze."""
    global current_maze

    try:
        maze = db_get_maze(maze_id)

        if maze is None:
            return jsonify({'error': 'Labyrinthe non trouvé'}), 404

        # Set as current maze (remove MongoDB-specific fields)
        current_maze = {
            'metadata': maze['metadata'],
            'cells': maze['cells']
        }

        return jsonify({
            'success': True,
            'maze': current_maze,
            'loaded_from': maze['name']
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Générer un labyrinthe par défaut au démarrage
    generator = MazeGenerator(15, 15)
    current_maze = generator.generate()
    
    # Lancer l'app en mode développement
    # Port depuis variable d'environnement ou 5000 par défaut
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
