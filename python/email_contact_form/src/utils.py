import os

from smtplib import SMTP
from email import message

__dirname = os.path.dirname(os.path.abspath(__file__))
static_folder = os.path.join(__dirname, "../static")


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


def throw_if_missing(obj: object, keys: list[str]) -> None:
    """
    Throws an error if any of the keys are missing from the object

    Parameters:
        obj (object): Object to check
        keys (list[str]): List of keys to check

    Raises:
        ValueError: If any keys are missing
    """
    missing = [key for key in keys if key not in obj or not obj[key]]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")


def template_form_message(form):
    return "You've received a new message:\n" + "\n".join(
        [f"{key}: {value}" for key, value in form.items()]
    )


def send_email(options):
    transport = SMTP(
        host=os.environ["SMTP_HOST"],
        port=os.environ.get("SMTP_PORT", 587),
        username=os.environ["SMTP_USERNAME"],
        password=os.environ["SMTP_PASSWORD"],
    )

    message = message.EmailMessage()
    message.set_content(options["text"])
    message["Subject"] = options["subject"]
    message["From"] = options["from"]
    message["To"] = options["to"]

    transport.send_message(message)
