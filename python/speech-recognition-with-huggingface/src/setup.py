import os
import asyncio
from myappwrite import AppwriteService
from dotenv import load_dotenv


load_dotenv()


async def setup():
   database_id = os.getenv('APPWRITE_DATABASE_ID')
   collection_id = os.getenv('APPWRITE_COLLECTION_ID')
   bucket_id = os.getenv('APPWRITE_BUCKET_ID')
   print('Executing setup script...')


   appwrite = AppwriteService()


   if appwrite.does_ai_data_exist(database_id, collection_id):
       print('Database exists.')
   else:
       await appwrite.setup_ai_database(database_id, collection_id)
       print('Database created.')


   if appwrite.does_bucket_exist(bucket_id):
       print('Bucket exists.')
   else:
       await appwrite.setup_ai_bucket(bucket_id)
       print('Bucket created.')


if __name__ == "__main__":
   asyncio.run(setup())