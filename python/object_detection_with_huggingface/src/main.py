import os
from huggingface_hub import InferenceClient
from utils import throw_if_missing
from myappwrite import AppwriteService
from dotenv import load_dotenv

load_dotenv()

async def process_object_detection(req, res, log, error):
    log("Starting process_object_detection...")

    # Ensure required environment variables are set
    throw_if_missing(os.environ, ["HUGGINGFACE_ACCESS_TOKEN"])
    log("Hugging Face access token loaded")

    # Retrieve environment variables or use defaults
    database_id = os.getenv("APPWRITE_DATABASE_ID")
    collection_id = os.getenv("APPWRITE_COLLECTION_ID")
    bucket_id = os.getenv("APPWRITE_BUCKET_ID")
    log(f"Using database: {database_id}, collection: {collection_id}, bucket: {bucket_id}")

    # Post method is required for my test case
    if req.method != "POST":
        log(f"Invalid request method: {req.method}")
        return res.json({"ok": False, "error": "Method not allowed"}, status=405)

    # This is needed to define file_id or else failure for file retrieval from request
    image = req.body_json.get("$id") or req.body_json.get("image")
    if not image:
        log("Missing fileId in request")
        return res.json({"ok": False, "error": "Bad request, fileId is required"}, status=400)

    # Validate bucketId
    if req.body_json.get("bucketId") and req.body_json["bucketId"] != bucket_id:
        error("Invalid bucketId")
        log(f"Invalid bucketId: {req.body_json.get('bucketId')}")
        return res.json({"ok": False, "error": "Bad request, invalid bucketId"}, status=400)

    # Initialize Appwrite service
    appwrite = AppwriteService(req.headers.get('x-appwrite-key'))
    log(f"Appwrite service initialized with key: {req.headers.get('x-appwrite-key')}")

    # This is for retrieving the file I uploaded to Appwrite storage bucket
    try:
        file_content = appwrite.get_file(bucket_id, image)
        log(f"File {image} retrieved successfully")
    except Exception as e:
        if getattr(e, "code", None) == 404:
            error("File not found")
            log(f"File {image} not found in bucket {bucket_id}")
            return res.json({"ok": False, "error": "File not found"}, status=404)
        error(f"Failed to retrieve file: {e}")
        return res.json({"ok": False, "error": "Bad request, failed to retrieve file"}, status=400)

    # Initializing Hugging Face Inference Client
    hf = InferenceClient(model='facebook/detr-resnet-50', token=os.getenv('HUGGINGFACE_ACCESS_TOKEN'))
    log("Hugging Face Inference Client initialized")

    # Using object detection using Hugging Face Inference Client
    try:
        result = hf.object_detection(file_content)
        log(f"Object detection result: {result}")
    except Exception as e:
        error(f"Failed to detect objects: {e}")
        return res.json({"ok": False, "error": "Failed to detect objects"}, status=500)

    # Transform the result to match the desired format
    transformed_result = [
        {
            "score": obj['score'],
            "label": obj['label'],
            "box": {
                "xmin": obj['box']['xmin'],
                "ymin": obj['box']['ymin'],
                "xmax": obj['box']['xmax'],
                "ymax": obj['box']['ymax']
            }
        }
        for obj in result
    ]
    print(transformed_result)
    # Convert result to a string to store in Appwrite collection
    labels_str = str(transformed_result)[:1024]

    # Generate a valid documentId
    document_id = image[:36]  # Ensure the documentId is at most 36 characters

    # This is for creating image labels entry in Appwrite collection from database. The labels will show the coordinates for a bounding box
    try:
        print("Creating image labels...")
        appwrite.createImageLabels(database_id, collection_id, document_id, {
            "image": image, 
            "labels": labels_str 
        })
        log(f"Image labels created for file: {image}")
    except Exception as e:
        error(f"Failed to create image labels: {e}")
        return res.json({"ok": False, "error": "Failed to create image labels"}, status=500)

    # Return the detection as a response
    log(f"Image {image} processed successfully")
    return res.json({"ok": True, "result": transformed_result})

import asyncio
import json

class MockRequest:
    def __init__(self, method, body_json, headers):
        self.method = method
        self.body_json = body_json
        self.headers = headers

class MockResponse:
    def json(self, data, status=200):
        data = json.dumps(data, indent=4)
        print(f"Response: {status}, Data: {data}")
        return data

req = MockRequest(
    "POST",
    {"image": "675f66e2002d01e5b0be", "bucketId": "object_detection"},
    {"x-appwrite-key": "standard_1e1324ec93d686c0b5a89693dfedc6f62e72885eccdcb97216513f09b57f727b98be0f9bacffb06d132339133d145eb02403baf304169ecfcc67a438296279fe0736d4a1bdd6f64ab5a9718dbdf0f66afd42af15bbb89ec9d5e44bb6688cedbe86340552a630a124583ca7ca7b20338a79f6061494b75686d3be83f39091cdce"}
)
res = MockResponse()

log = print
error = print

asyncio.run(process_object_detection(req, res, log, error))
