import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from functools import lru_cache

# This is your Appwrite function
# It's executed each time we get a request
@lru_cache(maxsize=1)
def get_database():
    # Validate environment variables
    required_vars = ["APPWRITE_ENDPOINT", "APPWRITE_PROJECT", "APPWRITE_API_KEY"]
    missing_vars = [var for var in required_vars if var not in os.environ]
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

    # Initialize the Appwrite client
    client = Client()
    client.set_endpoint(os.environ["APPWRITE_ENDPOINT"])
    client.set_project(os.environ["APPWRITE_PROJECT"])
    client.set_key(os.environ["APPWRITE_API_KEY"])

    # Initialize the database service
    return Databases(client)