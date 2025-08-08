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
      self.client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
      self.client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
      self.client.set_key(api_key)


      self.databases = Databases(self.client)
      self.storage = Storage(self.client)


 def create_Recognition_Entry(self, database_id, collection_id, audio_id, speech):
     self.databases.create_document(database_id, collection_id, ID.unique(), {
         'audio': audio_id,
         'speech': speech,
     })


 def get_file(self, bucket_id, file_id):
     file_content = self.storage.get_file_download(bucket_id, file_id)
     return self.storage.get_file(bucket_id, file_id)

 def does_ai_data_exist(self, database_id, collection_id):
     try:
         self.databases.get(database_id)
         self.databases.get_collection(database_id, collection_id)
         return True
     except:
         return False


 def does_bucket_exist(self, bucket_id):
     try:
         self.storage.get_bucket(bucket_id)
         return True
     except:
         return False


 async def setup_ai_database(self, database_id, collection_id):
     try:
         self.databases.get(database_id)
     except:
         self.databases.create(database_id, 'AI Database')


     try:
         self.databases.get_collection(database_id, collection_id)
     except:
         self.databases.create_collection(database_id, collection_id, 'Speech Recognition')


     try:
         self.databases.get_attribute(database_id, collection_id, 'audio')
     except:
         self.databases.create_string_attribute(database_id, collection_id, 'audio', 64, True)


     try:
         self.databases.get_attribute(database_id, collection_id, 'speech')
     except:
         self.databases.create_string_attribute(database_id, collection_id, 'speech', 1024, True)


 async def setup_ai_bucket(self, bucket_id):
     try:
         self.storage.get_bucket(bucket_id)
     except:
         self.storage.create_bucket(bucket_id, 'AI')



