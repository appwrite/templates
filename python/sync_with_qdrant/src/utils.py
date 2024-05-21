import os
from appwrite.client import Client
from appwrite.services.databases import Databases

__dirname = os.path.dirname(os.path.abspath(__file__))
static_folder = os.path.join(__dirname, "../static")


def throw_if_missing(obj: dict, keys: list[str]) -> None:
    """
    Throws an error if any of the keys are missing from the object

    Parameters:
        obj (dict): Dictionary to check
        keys (list[str]): List of keys to check

    Raises:
        ValueError: If any keys are missing
    """
    missing = [key for key in keys if key not in obj or not obj[key]]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")


def get_static_file(file_name: str) -> str:
    """
    Returns the contents of a file in the static folder

    Parameters:
        file_name (str): Name of the file to read

    Returns:
        (str): Contents of static/{file_name}
    """
    file_path = os.path.join(static_folder, file_name)
    with open(file_path, "r") as file:
        return file.read()

def get_all_documents():
    client = Client()
    client.set_endpoint(
        os.environ.get("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1")
    )
    client.set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
    client.set_key(os.environ["APPWRITE_API_KEY"])

    databases = Databases(client)

    cursor = None
    cumulative = []

    while True:
        queries = [{"limit": 100}]

        if cursor:
            queries.append({"cursorAfter": cursor})

        response = databases.list_documents(
            os.environ["APPWRITE_DATABASE_ID"],
            os.environ["APPWRITE_COLLECTION_ID"],
            queries,
        )

        documents = response["documents"]

        if len(documents) > 0:
            cursor = documents[-1]["$id"]
        else:
            cursor = None
            break

        cumulative.extend(documents)

    return cumulative
