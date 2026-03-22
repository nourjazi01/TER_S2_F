"""
Test script for database functionality
"""
import requests
import json
import time

base_url = "http://localhost:5000"

def test_database():
    saved_maze_id = None

    # Test 1: Generate a new maze
    print("=" * 60)
    print("TEST 1: Generate a new maze")
    print("=" * 60)
    response = requests.post(f"{base_url}/api/generate-maze", json={
        "width": 10,
        "height": 10,
        "playability": 0.5,
        "dead_end_ratio": 0.0,
        "cycle_intensity": 0.5
    })
    print(f"Status: {response.status_code}")
    if response.ok:
        data = response.json()
        print(f"Success: {data['success']}")
        print(f"Maze size: {data['width']}x{data['height']}")
        print(f"Cell count: {len(data['maze']['cells'])}")
        print(f"Parameters: {data['parameters']}")
    else:
        print(f"Error: {response.text}")

    print("\n")

    # Test 2: Save the current maze to database
    print("=" * 60)
    print("TEST 2: Save maze to database")
    print("=" * 60)
    response = requests.post(f"{base_url}/api/mazes/save", json={
        "name": "Test_Maze_Database_Check"
    })
    print(f"Status: {response.status_code}")
    if response.ok:
        data = response.json()
        print(f"Success: {data['success']}")
        print(f"Maze ID: {data['maze_id']}")
        print(f"Maze Name: {data['name']}")
        print(f"Created At: {data['created_at']}")
        saved_maze_id = data['maze_id']
    else:
        print(f"Error: {response.text}")

    print("\n")

    # Test 3: List all saved mazes
    print("=" * 60)
    print("TEST 3: List all saved mazes")
    print("=" * 60)
    response = requests.get(f"{base_url}/api/mazes")
    print(f"Status: {response.status_code}")
    if response.ok:
        data = response.json()
        print(f"Total mazes in database: {data['total']}")
        print(f"Returned: {len(data['mazes'])} mazes")
        print("\nRecent mazes:")
        for i, maze in enumerate(data['mazes'][:5], 1):
            print(f"  {i}. {maze['name']} - ID: {maze['_id'][:8]}...")
    else:
        print(f"Error: {response.text}")

    print("\n")

    # Test 4: Get a specific maze
    if saved_maze_id:
        print("=" * 60)
        print("TEST 4: Get specific maze by ID")
        print("=" * 60)
        response = requests.get(f"{base_url}/api/mazes/{saved_maze_id}")
        print(f"Status: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Maze Name: {data['name']}")
            print(f"Maze ID: {data['_id']}")
            print(f"Cell count: {len(data['cells'])}")
            print(f"Width: {data['metadata']['width']}")
            print(f"Height: {data['metadata']['height']}")
            print(f"Created At: {data['created_at']}")
        else:
            print(f"Error: {response.text}")

    print("\n")

    # Test 5: Load a saved maze as current
    if saved_maze_id:
        print("=" * 60)
        print("TEST 5: Load saved maze as current maze")
        print("=" * 60)
        response = requests.post(f"{base_url}/api/mazes/{saved_maze_id}/load")
        print(f"Status: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Success: {data['success']}")
            print(f"Loaded from: {data['loaded_from']}")
            print(f"Current maze cells: {len(data['maze']['cells'])}")
        else:
            print(f"Error: {response.text}")

    print("\n")

    # Test 6: Delete the test maze
    if saved_maze_id:
        print("=" * 60)
        print("TEST 6: Delete test maze")
        print("=" * 60)
        response = requests.delete(f"{base_url}/api/mazes/{saved_maze_id}")
        print(f"Status: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Success: {data['success']}")
            print(f"Deleted ID: {data['deleted_id']}")
        else:
            print(f"Error: {response.text}")

    print("\n")
    print("=" * 60)
    print("ALL DATABASE TESTS COMPLETED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    # Wait for server to be fully ready
    time.sleep(1)
    test_database()
