import os

__dirname = os.path.dirname(os.path.abspath(__file__))
static_folder = os.path.join(__dirname, "../static")


def get_static_file(file_name):
    """
    Returns the contents of a file in the static folder
    :param file_name: Name of the file to read
    :return: Contents of static/{file_name}
    """
    file_path = os.path.join(static_folder, file_name)
    with open(file_path, "r") as file:
        return file.read()


def throw_if_missing(obj, keys):
    """
    Throws an error if any of the keys are missing from the object
    :param obj: Object to validate
    :param keys: List of keys to check
    :raises ValueError: If any keys are missing
    """
    missing = [key for key in keys if key not in obj or not obj[key]]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")
