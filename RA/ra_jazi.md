# Rapport d'Activité — Nour Jazi

---

## Phase 1 — Génération de labyrinthes

Mise en place du projet et recherche sur les types de labyrinthes adaptés à Pac-Man. Le besoin principal : pas de culs-de-sac, plusieurs cycles, graphe connexe. Après comparaison de plusieurs approches (Wilson, Aldous-Broder, Kruskal), choix du **Braid Maze** (DFS + suppression des dead ends) comme meilleur compromis entre qualité et simplicité d'implémentation.

Implémentation du générateur (`maze_generator.py`). Le labyrinthe est représenté par un dictionnaire de murs `{(x, y, direction): bool}`. La génération passe par un DFS parfait, puis une passe d'élimination des dead ends.

**Résultat sur 12×12 :** connexité 100%, 0 culs-de-sac, score 84.4/100.

**Principale difficulté :** gestion bidirectionnelle des murs (supprimer un mur côté A doit aussi le supprimer côté B) → fonction `_remove_wall()`.

---

## Phase 2 — Web, tests & CI/CD

Mise en place du pipeline CI/CD et des tests automatisés.

**CI/CD (GitHub Actions → Render) :**
- `render.yaml` pour le déploiement automatique
- Workflow qui lance les tests à chaque push et bloque le déploiement en cas d'échec
- Démonstration concrète du blocage avec un commit cassé intentionnel

**Tests (ma partie) :**
- 13 tests fonctionnels (structure, dimensions, paramètres)
- 7 tests E2E sur l'API déployée

**Difficultés rencontrées :**
- Tests E2E en CI : pas de serveur Flask actif dans GitHub Actions → skip conditionnel
- Méthodes de `MazeAnalyzer` renommées entre deux versions → mise à jour des tests en conséquence

---

## Phase 3 — Jeu Pac-Man & IA fantômes

Implémentation des algorithmes de pathfinding pour les fantômes.

**Algorithmes développés :**
- **BFS** — exploration niveau par niveau, chemin optimal garanti, ~40-50 nœuds/appel
- **A\*** — BFS + heuristique Manhattan, même optimalité mais ~2× moins de nœuds explorés

Les deux s'intègrent dans la classe `Pathfinder` avec un pattern Strategy : le choix d'algorithme est une variable globale changeable en live depuis l'UI.

**Optimisations moteur :**
- Normalisation deltaTime (`speed * deltaTime / 16.67`) pour un mouvement stable à tout framerate
- Algorithme appelé uniquement aux intersections (tracking `lastDecisionCell`), pas à chaque frame — réduit les appels de 60/s à ~3-5/s par fantôme
- Système `LEAVING_HOUSE` pour que les fantômes sortent proprement de la ghost house

**Difficultés rencontrées :**
- Fantômes bloqués en sortie de ghost house → ajout du mode `LEAVING_HOUSE` avec pathfinding vers la cellule de sortie
- Bug de demi-tour → logique de filtrage `opposite direction` refaite
- Appels dupliqués à chaque frame au centre de cellule → résolu par `lastDecisionCell`

---

## Phase 4 — IA adversariale & finitions

IA adversariale pour le mode self-play de Pac-Man, et finitions.

**Adversarial search (Pac-Man self-play) :**

Quand le self-play est activé, Pac-Man choisit ses mouvements via une recherche dans l'arbre de jeu plutôt qu'au clavier. Les fantômes forment le nœud MIN (ou CHANCE pour Expectimax), Pac-Man forme le nœud MAX.

Trois modes implémentés :
- **Minimax** — arbre complet, profondeur 3
- **Alpha-Beta** — identique à Minimax mais avec élagage, ~66% de nœuds en moins, résultats vérifiés identiques
- **Expectimax** — les fantômes sont modélisés comme des agents aléatoires plutôt qu'adversariaux

Points techniques notables :
- Les pellets sont simulés avec make/unmake dans l'arbre de recherche, ce qui évite de travailler sur un snapshot statique
- Un FIFO de cellules récemment visitées et une pénalité de demi-tour éliminent les oscillations
- Un test headless Node.js (`tests/sim_pacman_ai.js`) valide les 3 modes sur 7 scénarios différents

**Autres contributions :**
- Troisième type de pellet (bonus fruit) avec placement déterministe par labyrinthe
- Compteur de pas au moment où Pac-Man est attrapé (`caughtAtStep`)
- Refonte UI : deux panneaux de contrôle de hauteur égale, accents arcade, responsive
- Mise à jour README et rapports d'activité
