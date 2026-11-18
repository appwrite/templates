from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.id import ID
from dotenv import load_dotenv
import os

load_dotenv()

class AppwriteService:
    def __init__(self, api_key):
         self.client = Client()
         endpoint = os.getenv('APPWRITE_ENDPOINT')
         project_id = os.getenv('APPWRITE_PROJECT_ID')

         if not endpoint or not project_id:
              raise ValueError("APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID must be set in the environment variables")

         self.client.set_endpoint(endpoint)
         self.client.set_project(project_id)
         self.client.set_key(api_key)

         self.databases = Databases(self.client)
         self.storage = Storage(self.client)

    async def createImageLabels(self, database_id, collection_id, image_id, labels_str):
         await self.databases.create_document(database_id, collection_id, ID.custom(image_id), {
              'image': image_id,
              'labels': labels_str
         })

    def get_file(self, bucket_id, image):
         try:
              file_content = self.storage.get_file_download(bucket_id, image)
              return file_content
         except Exception as e:
              print(f"Error getting file: {e}")
              return None

    async def does_ai_data_exist(self, database_id, collection_id):
         try:
              await self.databases.get(database_id)
              await self.databases.get_collection(database_id, collection_id)
              return True
         except Exception as e:
              print(f"Error checking AI data existence: {e}")
              return False

    async def does_bucket_exist(self, bucket_id):
         try:
              await self.storage.get_bucket(bucket_id)
              return True
         except Exception as e:
              print(f"Error checking bucket existence: {e}")
              return False

    async def setup_ai_database(self, database_id, collection_id):
         try:
              await self.databases.get(database_id)
         except Exception:
              try:
                    await self.databases.create(database_id, 'AI Database')
              except Exception as e:
                    print(f"Error creating database: {e}")

         try:
              await self.databases.get_collection(database_id, collection_id)
         except Exception:
              try:
                    await self.databases.create_collection(database_id, collection_id, 'Image Labels')
              except Exception as e:
                    print(f"Error creating collection: {e}")

    async def setup_ai_bucket(self, bucket_id):
         try:
              await self.storage.get_bucket(bucket_id)
         except Exception:
              try:
                    self.storage.create_bucket(bucket_id, 'AI')
              except Exception as e:
                    print(f"Error creating bucket: {e}")
