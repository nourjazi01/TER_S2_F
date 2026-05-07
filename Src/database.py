"""
MongoDB database connection and operations for maze storage.
"""

import os
from datetime import datetime
from pymongo import MongoClient, ReturnDocument
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
        "cells": maze_data.get('cells', {}),
        # Rating aggregates (initialised at zero)
        "rating_sum": 0,
        "rating_count": 0,
        "rating_avg": 0.0
    }

    result = collection.insert_one(document)

    return {
        "maze_id": str(result.inserted_id),
        "name": name,
        "created_at": created_at.isoformat() + "Z"
    }


def rate_maze(maze_id, rating):
    """
    Add a 1-5 star rating to a maze and update its average.

    Args:
        maze_id: MongoDB ObjectId as string
        rating: integer 1..5

    Returns:
        Dict with updated rating_avg and rating_count, or None if not found.

    Raises:
        ValueError: if the rating is not in 1..5
    """
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        raise ValueError("Rating must be an integer between 1 and 5")

    collection = get_mazes_collection()

    try:
        oid = ObjectId(maze_id)
    except Exception:
        return None

    # Atomic increment of sum and count, then recompute average
    result = collection.find_one_and_update(
        {"_id": oid},
        {"$inc": {"rating_sum": rating, "rating_count": 1}},
        return_document=ReturnDocument.AFTER
    )

    if result is None:
        return None

    rating_sum = result.get("rating_sum", 0)
    rating_count = result.get("rating_count", 0)
    rating_avg = (rating_sum / rating_count) if rating_count > 0 else 0.0

    # Persist the average so it can be sorted/displayed without recomputation
    collection.update_one(
        {"_id": oid},
        {"$set": {"rating_avg": rating_avg}}
    )

    return {
        "maze_id": maze_id,
        "rating_avg": round(rating_avg, 2),
        "rating_count": rating_count,
        "last_rating": rating
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

    # Resolve sort field and direction
    if sort == "oldest":
        sort_spec = [("created_at", 1)]
    elif sort == "best":
        # Sort by avg rating desc, then by count desc as tiebreaker
        sort_spec = [("rating_avg", -1), ("rating_count", -1), ("created_at", -1)]
    else:  # "newest" (default)
        sort_spec = [("created_at", -1)]

    cursor = collection.find(
        {},
        {"cells": 0}  # Exclude cells for listing
    ).sort(sort_spec).skip(offset).limit(limit)

    mazes = []
    for doc in cursor:
        doc['_id'] = str(doc['_id'])
        # Convert datetime to ISO string if present
        if 'created_at' in doc and isinstance(doc['created_at'], datetime):
            doc['created_at'] = doc['created_at'].isoformat() + "Z"
        # Backfill rating fields for legacy docs that pre-date the rating feature
        doc.setdefault('rating_avg', 0.0)
        doc.setdefault('rating_count', 0)
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
        # Backfill rating fields for legacy docs that pre-date the rating feature
        doc.setdefault('rating_avg', 0.0)
        doc.setdefault('rating_count', 0)

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
