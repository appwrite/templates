import os
from appwrite.client import Client
from appwrite.services.databases import Databases

# This is your Appwrite function
# It's executed each time we get a request
def get_database():
    # Initialize the Appwrite client
    client = Client()
    client.set_endpoint(os.environ["APPWRITE_ENDPOINT"])
    client.set_project(os.environ["APPWRITE_PROJECT"])
    client.set_key(os.environ["APPWRITE_API_KEY"])

    # Initialize the database service
    return Databases(client)