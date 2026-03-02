"""
API HTTP Flask pour le générateur de labyrinthes
Expose le générateur comme web service REST
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from maze_generator import MazeGenerator
from maze_analyzer import MazeAnalyzer
import logging

app = Flask(__name__)
CORS(app)  # Permettre les requêtes cross-origin

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route('/', methods=['GET'])
def home():
    """Page d'accueil de l'API."""
    return jsonify({
        "service": "Pac-Man Maze Generator API",
        "version": "1.0",
        "endpoints": {
            "/generate": "POST - Génère un labyrinthe",
            "/analyze": "POST - Analyse un labyrinthe",
            "/health": "GET - Vérifie l'état du service"
        }
    })


@app.route('/health', methods=['GET'])
def health():
    """Endpoint de santé pour vérifier que le service fonctionne."""
    return jsonify({
        "status": "healthy",
        "service": "maze-generator"
    }), 200


@app.route('/generate', methods=['POST'])
def generate_maze():
    """
    Génère un labyrinthe avec les paramètres fournis.
    
    Body JSON attendu:
    {
        "width": int (défaut: 15),
        "height": int (défaut: 15)
    }
    
    Retourne:
    {
        "success": true,
        "maze": {...},
        "analysis": {...}
    }
    """
    try:
        # Récupérer les paramètres
        data = request.get_json() or {}
        width = data.get('width', 15)
        height = data.get('height', 15)
        
        # Validation des paramètres
        if not isinstance(width, int) or not isinstance(height, int):
            return jsonify({
                "success": False,
                "error": "width et height doivent être des entiers"
            }), 400
        
        if width < 3 or width > 100 or height < 3 or height > 100:
            return jsonify({
                "success": False,
                "error": "width et height doivent être entre 3 et 100"
            }), 400
        
        # Générer le labyrinthe
        logger.info(f"Génération d'un labyrinthe {width}x{height}")
        generator = MazeGenerator(width, height)
        maze_data = generator.generate()
        
        # Analyser le labyrinthe
        analyzer = MazeAnalyzer(maze_data)
        analysis = analyzer.full_analysis()
        
        # Retourner le résultat
        return jsonify({
            "success": True,
            "maze": maze_data,
            "analysis": {
                "connectivity": analysis['connectivity']['is_connected'],
                "dead_ends": analysis['dead_ends']['dead_end_count'],
                "score": analysis['pacman_quality']['overall_score']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/analyze', methods=['POST'])
def analyze_maze():
    """
    Analyse un labyrinthe fourni.
    
    Body JSON attendu:
    {
        "maze": {...}  // Format JSON du labyrinthe
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'maze' not in data:
            return jsonify({
                "success": False,
                "error": "Le champ 'maze' est requis"
            }), 400
        
        maze_data = data['maze']
        
        # Analyser
        analyzer = MazeAnalyzer(maze_data)
        analysis = analyzer.full_analysis()
        
        return jsonify({
            "success": True,
            "analysis": analysis
        }), 200
        
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    # En développement
    app.run(host='0.0.0.0', port=5000, debug=True)
