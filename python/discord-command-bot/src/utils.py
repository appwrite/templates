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
