import os
import asyncio
from huggingface_hub import HfApi
from appwrite.service import Service
from utils import throw_if_missing
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Check if the variable is accessible
print("HUGGINGFACE_ACCESS_TOKEN:", os.getenv("HUGGINGFACE_ACCESS_TOKEN"))

async def process_audio(req, res, log, error):
    """
    Processes an audio file, performs speech-to-text using Hugging Face, and stores results in Appwrite.

    :param req: Request object
    :param res: Response object
    :param log: Logger function
    :param error: Error logging function
    """
    log("Starting process_audio...")

    # Ensure required environment variables are set
    throw_if_missing(os.environ, ["HUGGINGFACE_ACCESS_TOKEN"])
    log("Hugging Face access token loaded")

    # Retrieve environment variables or use defaults
    database_id = os.getenv("APPWRITE_DATABASE_ID", "ai")
    collection_id = os.getenv("APPWRITE_COLLECTION_ID", "speech_recognition")
    bucket_id = os.getenv("APPWRITE_BUCKET_ID", "speech_recognition")
    log(f"Using database: {database_id}, collection: {collection_id}, bucket: {bucket_id}")

    # Check that the request method is POST
    if req.method != "POST":
        log(f"Invalid request method: {req.method}")
        return res.json({"ok": False, "error": "Method not allowed"}, status=405)

    # Retrieve fileId from request
    file_id = req.body_json.get("$id") or req.body_json.get("fileId")
    if not file_id:
        error("Missing fileId")
        log("Missing fileId in request")
        return res.json({"ok": False, "error": "Bad request, fileId is required"}, status=400)

    # Validate bucketId
    if req.body_json.get("bucketId") and req.body_json["bucketId"] != bucket_id:
        error("Invalid bucketId")
        log(f"Invalid bucketId: {req.body_json.get('bucketId')}")
        return res.json({"ok": False, "error": "Bad request, invalid bucketId"}, status=400)

    # Initialize Appwrite service
    appwrite = Service(req.headers.get("x-appwrite-key"))
    log(f"Appwrite service initialized with key: {req.headers.get('x-appwrite-key')}")

    # Retrieve the file from Appwrite
    try:
        file = await appwrite.get_file(bucket_id, file_id)
        log(f"File {file_id} retrieved successfully")
    except Exception as err:
        if getattr(err, "code", None) == 404:
            error("File not found")
            log(f"File {file_id} not found in bucket {bucket_id}")
            return res.json({"ok": False, "error": "File not found"}, status=404)
        error(f"Failed to retrieve file: {err}")
        log(f"Failed to retrieve file: {err}")
        return res.json({"ok": False, "error": "Bad request, failed to retrieve file"}, status=400)

    # Initialize Hugging Face API
    hf = HfApi(os.getenv("HUGGINGFACE_ACCESS_TOKEN"))
    log("Hugging Face API initialized")

    # Perform speech-to-text using Hugging Face
    try:
        result = hf.speech_to_text(file, model="openai/whisper-large-v3")
        log(f"Speech-to-text result: {result.text}")
    except Exception as err:
        error(f"Hugging Face error: {err}")
        log(f"Hugging Face error: {err}")
        return res.json({"ok": False, "error": "Failed to process audio"}, status=500)

    # Create a recognition entry in Appwrite database
    try:
        await appwrite.create_recognition_entry(
            database_id, collection_id, file_id, result.text
        )
        log(f"Recognition entry created for {file_id}")
    except Exception as err:
        error(f"Appwrite error: {err}")
        log(f"Appwrite error: {err}")
        return res.json({"ok": False, "error": "Failed to create recognition entry in database"}, status=500)

    # Return the recognized text as a response
    log(f"Returning recognized text for {file_id}")
    return res.json({"text": result.text})

# Running the asynchronous setup function
if __name__ == "__main__":
    async def run():
        # Simulate request and response objects for testing
        class MockRequest:
            def __init__(self, method, body_json, headers):
                self.method = method
                self.body_json = body_json
                self.headers = headers
        
        class MockResponse:
            def json(self, data, status=200):
                print(f"Response: {status}, Data: {data}")
                return data
        
        # Example request and response simulation
        req = MockRequest(
            "POST", 
            {"fileId": "example-file-id", "bucketId": "speech_recognition"},
            {"x-appwrite-key": "your-appwrite-api-key"}
        )
        res = MockResponse()

        log = print  # Replace with your actual logging function
        error = print  # Replace with your actual error logging function

        await process_audio(req, res, log, error)
    
    asyncio.run(run())
