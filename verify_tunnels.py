"""Script pour vérifier la présence des tunnels de wrap-around"""

import json

# Charger les données du labyrinthe
with open("maze_output.json", "r", encoding="utf-8") as f:
    maze_data = json.load(f)

print("=" * 60)
print("VÉRIFICATION DES TUNNELS DE WRAP-AROUND HORIZONTAUX")
print("=" * 60)

width = maze_data['metadata']['width']
height = maze_data['metadata']['height']
cells = maze_data['cells']

# Vérifier les tunnels sur la gauche (x=0)
print(f"\n🔴 BORD GAUCHE (colonne x=0) - Passages OUEST (W):")
left_tunnels = []
for y in range(height):
    cell_key = f"0,{y}"
    if cell_key in cells:
        passages = cells[cell_key]['passages']
        if 'W' in passages:
            left_tunnels.append(y)
            print(f"   ✓ Ligne {y}: W-passage (wraparound vers droite)")

print(f"\n🔵 BORD DROIT (colonne x={width-1}) - Passages EST (E):")
right_tunnels = []
for y in range(height):
    cell_key = f"{width-1},{y}"
    if cell_key in cells:
        passages = cells[cell_key]['passages']
        if 'E' in passages:
            right_tunnels.append(y)
            print(f"   ✓ Ligne {y}: E-passage (wraparound vers gauche)")

print(f"\n📊 RÉSUMÉ:")
print(f"   Tunnels sur le bord gauche: {len(left_tunnels)}")
print(f"   Tunnels sur le bord droit: {len(right_tunnels)}")
print(f"   Tunnels appairés: {len(set(left_tunnels) & set(right_tunnels))}")

print(f"\n✓ Métadonnées du labyrinthe:")
print(f"   Type: {maze_data['metadata'].get('warp_tunnel_type', 'N/A')}")
print(f"   Algorithme: {maze_data['metadata']['algorithm']}")
print("=" * 60)
