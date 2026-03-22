"""
MongoDB database connection and operations for maze storage.
"""

import os
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson.objectid import ObjectId

# Global client (lazy initialization)
_client = None
_db = None


def get_database():
    """
    Get MongoDB database connection.
    Uses lazy initialization and connection pooling.
    """
    global _client, _db

    if _db is not None:
        return _db

    mongo_uri = os.environ.get('MONGODB_URI')
    if not mongo_uri:
        raise ValueError("MONGODB_URI environment variable not set")

    _client = MongoClient(mongo_uri)

    # Test connection
    try:
        _client.admin.command('ping')
    except ConnectionFailure:
        raise ConnectionError("Failed to connect to MongoDB")

    # Database name from URI or default
    db_name = os.environ.get('MONGODB_DB', 'pacman_maze')
    _db = _client[db_name]

    return _db


def get_mazes_collection():
    """Get the mazes collection."""
    return get_database()['mazes']


def generate_maze_name():
    """
    Generate auto-incrementing maze name.
    Format: Maze_YYYY_NNN (e.g., Maze_2024_001)
    """
    collection = get_mazes_collection()
    year = datetime.now().year

    # Find highest counter for current year
    pattern = f"Maze_{year}_"
    latest = collection.find_one(
        {"name": {"$regex": f"^{pattern}"}},
        sort=[("name", -1)]
    )

    if latest:
        # Extract counter from name like "Maze_2024_042"
        try:
            counter = int(latest['name'].split('_')[-1]) + 1
        except (ValueError, IndexError):
            counter = 1
    else:
        counter = 1

    return f"Maze_{year}_{counter:03d}"


def save_maze(maze_data, custom_name=None):
    """
    Save a maze to the database.

    Args:
        maze_data: Dict with 'metadata' and 'cells' keys
        custom_name: Optional custom name (auto-generated if None)

    Returns:
        Dict with maze_id, name, created_at
    """
    collection = get_mazes_collection()

    name = custom_name or generate_maze_name()
    created_at = datetime.utcnow()

    document = {
        "name": name,
        "created_at": created_at,
        "metadata": maze_data.get('metadata', {}),
        "cells": maze_data.get('cells', {})
    }

    result = collection.insert_one(document)

    return {
        "maze_id": str(result.inserted_id),
        "name": name,
        "created_at": created_at.isoformat() + "Z"
    }


def list_mazes(limit=20, offset=0, sort="newest"):
    """
    List saved mazes with pagination.
    Returns metadata only (no cells) for efficiency.

    Args:
        limit: Maximum number of mazes to return
        offset: Number of mazes to skip
        sort: Sort order - "newest" or "oldest"

    Returns:
        Dict with mazes list, total count, limit, and offset
    """
    collection = get_mazes_collection()

    sort_order = -1 if sort == "newest" else 1

    cursor = collection.find(
        {},
        {"cells": 0}  # Exclude cells for listing
    ).sort("created_at", sort_order).skip(offset).limit(limit)

    mazes = []
    for doc in cursor:
        doc['_id'] = str(doc['_id'])
        # Convert datetime to ISO string if present
        if 'created_at' in doc and isinstance(doc['created_at'], datetime):
            doc['created_at'] = doc['created_at'].isoformat() + "Z"
        mazes.append(doc)

    total = collection.count_documents({})

    return {
        "mazes": mazes,
        "total": total,
        "limit": limit,
        "offset": offset
    }


def get_maze(maze_id):
    """
    Get a specific maze by ID.
    Returns full document including cells.

    Args:
        maze_id: MongoDB ObjectId as string

    Returns:
        Maze document dict or None if not found
    """
    collection = get_mazes_collection()

    try:
        oid = ObjectId(maze_id)
    except Exception:
        return None

    doc = collection.find_one({"_id": oid})

    if doc:
        doc['_id'] = str(doc['_id'])
        # Convert datetime to ISO string if present
        if 'created_at' in doc and isinstance(doc['created_at'], datetime):
            doc['created_at'] = doc['created_at'].isoformat() + "Z"

    return doc


def delete_maze(maze_id):
    """
    Delete a maze by ID.

    Args:
        maze_id: MongoDB ObjectId as string

    Returns:
        True if deleted, False if not found
    """
    collection = get_mazes_collection()

    try:
        oid = ObjectId(maze_id)
    except Exception:
        return False

    result = collection.delete_one({"_id": oid})
    return result.deleted_count > 0
