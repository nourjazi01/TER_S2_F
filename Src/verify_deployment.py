"""
Script de vérification rapide avant déploiement
"""

import sys
import os

# Ajouter le dossier parent au path pour les imports
sys.path.insert(0, os.path.dirname(__file__))

def test_imports():
    """Vérifie que tous les imports fonctionnent."""
    print("🔍 Vérification des imports...")
    
    try:
        from maze_generator import MazeGenerator
        print("  ✓ maze_generator")
    except ImportError as e:
        print(f"  ✗ maze_generator: {e}")
        return False
    
    try:
        from maze_analyzer import MazeAnalyzer
        print("  ✓ maze_analyzer")
    except ImportError as e:
        print(f"  ✗ maze_analyzer: {e}")
        return False
    
    try:
        from ascii_renderer import ASCIIRenderer
        print("  ✓ ascii_renderer")
    except ImportError as e:
        print(f"  ✗ ascii_renderer: {e}")
        return False
    
    return True


def test_generation():
    """Teste la génération d'un labyrinthe."""
    print("\n🎲 Test de génération...")
    
    try:
        from maze_generator import MazeGenerator
        from maze_analyzer import MazeAnalyzer
        
        gen = MazeGenerator(10, 10)
        maze = gen.generate()
        
        print(f"  ✓ Labyrinthe {maze['metadata']['width']}x{maze['metadata']['height']} généré")
        print(f"  ✓ {len(maze['cells'])} cellules")
        
        analyzer = MazeAnalyzer(maze)
        analysis = analyzer.full_analysis()
        
        print(f"  ✓ Connexité: {analysis['connectivity']['is_connected']}")
        print(f"  ✓ Dead ends: {analysis['dead_ends']['dead_end_count']}")
        print(f"  ✓ Score: {analysis['pacman_quality']['overall_score']:.1f}/100")
        
        return True
    except Exception as e:
        print(f"  ✗ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api():
    """Teste que l'API peut démarrer."""
    print("\n🌐 Test de l'API...")
    
    try:
        from api_server import app
        print("  ✓ Flask app créée")
        
        # Test config
        with app.test_client() as client:
            # Test health
            response = client.get('/health')
            assert response.status_code == 200
            print("  ✓ /health OK")
            
            # Test home
            response = client.get('/')
            assert response.status_code == 200
            print("  ✓ / OK")
            
            # Test generate
            response = client.post('/generate', json={"width": 10, "height": 10})
            assert response.status_code == 200
            data = response.json
            assert data['success'] is True
            print("  ✓ /generate OK")
        
        return True
    except Exception as e:
        print(f"  ✗ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("="*60)
    print("VÉRIFICATION PRÉ-DÉPLOIEMENT - JOUR 3")
    print("="*60)
    
    results = []
    
    # Test 1: Imports
    results.append(("Imports", test_imports()))
    
    # Test 2: Génération
    results.append(("Génération", test_generation()))
    
    # Test 3: API
    results.append(("API", test_api()))
    
    # Résumé
    print("\n" + "="*60)
    print("RÉSUMÉ")
    print("="*60)
    
    for name, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{name:20s} : {status}")
    
    all_pass = all(r[1] for r in results)
    
    print("\n" + "="*60)
    if all_pass:
        print("🎉 TOUS LES TESTS PASSENT - PRÊT POUR DÉPLOIEMENT")
    else:
        print("❌ CERTAINS TESTS ÉCHOUENT - CORRIGER AVANT DÉPLOIEMENT")
    print("="*60)
    
    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())
