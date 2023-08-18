import os, re

__dirname = os.path.dirname(os.path.abspath(__file__))
static_folder = os.path.join(__dirname, "../static")


def get_static_file(file_name):
    file_path = os.path.join(static_folder, file_name)
    with open(file_path, "r") as file:
        return file.read()


def throw_if_missing(obj, keys):
    missing = [key for key in keys if key not in obj or not obj[key]]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")


def interpolate(template, values):
    def replace_match(match):
        key = match.group(1)
        return values.get(key, "")

    return re.sub(r"{{([^}]+)}}", replace_match, template)
