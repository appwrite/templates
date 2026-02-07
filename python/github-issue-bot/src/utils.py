"""
Utility functions for GitHub issue bot.
Includes function for validating required fields.
"""

import os


def throw_if_missing(obj, keys):
    """
    Throws an error if any of the keys are missing from the dictionary or None/0.
    
    :param obj: Dictionary to check
    :param keys: List of required keys
    :raises ValueError: If required keys are missing
    """
    missing = []
    for key in keys:
        if key not in obj or obj[key] is None or obj[key] == 0:
            missing.append(key)

    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")
