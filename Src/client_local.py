"""
Client local pour communiquer avec l'API et afficher le labyrinthe
Conserve la visualisation graphique en local
"""

import requests
import json
from ascii_renderer import ASCIIRenderer
from maze_analyzer import MazeAnalyzer


class MazeAPIClient:
    """Client pour communiquer avec l'API du générateur."""
    
    def __init__(self, base_url="http://localhost:5000"):
        """
        Initialise le client API.
        
        Args:
            base_url: URL de base de l'API
        """
        self.base_url = base_url.rstrip('/')
    
    def generate_maze(self, width=15, height=15):
        """
        Demande la génération d'un labyrinthe via l'API.
        
        Args:
            width: Largeur du labyrinthe
            height: Hauteur du labyrinthe
        
        Returns:
            Dictionnaire contenant le labyrinthe et l'analyse
        """
        url = f"{self.base_url}/generate"
        payload = {"width": width, "height": height}
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erreur de connexion à l'API: {e}")
            return None
    
    def check_health(self):
        """Vérifie que l'API est accessible."""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            return response.status_code == 200
        except:
            return False


def main():
    """Programme principal du client."""
    
    print("="*60)
    print("CLIENT LOCAL - GÉNÉRATEUR DE LABYRINTHES PAC-MAN")
    print("="*60)
    
    # Configuration de l'API
    print("\nConfiguration de l'API:")
    print("1. Local (http://localhost:5000)")
    print("2. Cloud (Render)")
    choice = input("Choix [1]: ").strip() or "1"
    
    if choice == "1":
        api_url = "http://localhost:5000"
    else:
        api_url = input("URL de l'API cloud: ").strip()
    
    # Créer le client
    client = MazeAPIClient(api_url)
    
    # Vérifier la connexion
    print(f"\nVérification de la connexion à {api_url}...")
    if not client.check_health():
        print("❌ Impossible de se connecter à l'API")
        print("Assurez-vous que le serveur est lancé:")
        print("  Local: python api_server.py")
        return
    
    print("✓ Connexion établie")
    
    # Demander les paramètres
    print("\n" + "="*60)
    print("PARAMÈTRES DU LABYRINTHE")
    print("="*60)
    
    try:
        width = int(input("Largeur [15]: ").strip() or "15")
        height = int(input("Hauteur [15]: ").strip() or "15")
    except ValueError:
        print("Valeurs invalides, utilisation des valeurs par défaut (15x15)")
        width, height = 15, 15
    
    # Générer le labyrinthe
    print(f"\n🎲 Génération d'un labyrinthe {width}x{height} via l'API...")
    
    result = client.generate_maze(width, height)
    
    if not result or not result.get('success'):
        print("❌ Erreur lors de la génération")
        if result:
            print(f"Erreur: {result.get('error', 'Inconnue')}")
        return
    
    maze_data = result['maze']
    analysis = result['analysis']
    
    print("✓ Labyrinthe généré avec succès")
    
    # Afficher les statistiques
    print("\n" + "="*60)
    print("ANALYSE")
    print("="*60)
    print(f"Connexité     : {'✓ OUI' if analysis['connectivity'] else '✗ NON'}")
    print(f"Culs-de-sac   : {analysis['dead_ends']}")
    print(f"Score qualité : {analysis['score']:.1f}/100")
    
    # Afficher le labyrinthe en ASCII
    print("\n" + "="*60)
    print("RENDU ASCII")
    print("="*60 + "\n")
    
    renderer = ASCIIRenderer(maze_data)
    print(renderer.render())
    
    # Sauvegarder ?
    print("\n" + "="*60)
    save = input("Sauvegarder le labyrinthe ? [O/n]: ").strip().lower()
    
    if save != 'n':
        filename = input("Nom du fichier [generated_maze.json]: ").strip() or "generated_maze.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(maze_data, f, indent=2, ensure_ascii=False)
        print(f"✓ Sauvegardé dans {filename}")
    
    print("\n" + "="*60)
    print("Session terminée")
    print("="*60)


if __name__ == "__main__":
    main()
