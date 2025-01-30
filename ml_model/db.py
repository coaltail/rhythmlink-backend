import pymysql
import pandas as pd
import os
import json

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "port": int(os.getenv("DB_PORT")),
}


def fetch_groups():
    """Fetch groups and their genres from the database and convert genres to lists."""
    connection = pymysql.connect(**DB_CONFIG)
    query = "SELECT id, name, genres, mainImageUrl FROM `groups`"
    groups_df = pd.read_sql(query, connection)
    connection.close()

    # Convert JSON-encoded genre strings into actual lists
    groups_df["genres"] = groups_df["genres"].apply(
        lambda x: json.loads(x) if isinstance(x, str) else []
    )

    return groups_df


def fetch_user_preferences(user_id):
    """Fetch user preferences based on user ID."""
    connection = pymysql.connect(**DB_CONFIG)
    query = f"SELECT genresOfInterest FROM users WHERE id = {user_id}"
    cursor = connection.cursor()
    cursor.execute(query)
    result = cursor.fetchone()
    connection.close()
    return result[0] if result else None
