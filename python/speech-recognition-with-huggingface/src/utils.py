def throw_if_missing(obj, keys):
    """
    Throws an error if any of the keys are missing from the object.

    :param obj: Dictionary-like object
    :param keys: List of required keys
    :raises ValueError: If any keys are missing
    """
    missing = [key for key in keys if not obj.get(key)]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")
