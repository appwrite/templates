"""
Utility functions for storage cleaner.
Includes functions for calculating expiry dates and validating required fields.
"""

import os
from datetime import datetime, timedelta, timezone

def get_expiry_date():
    """
    Returns a date subtracted by the retention period from the current date.
    The retention period is fetched from the RETENTION_PERIOD_DAYS environment variable.
    Defaults to 30 days if the environment variable is not set or invalid.
    
    :return: The calculated expiry date in ISO 8601 format.
    """
    try:
        retention_period = int(os.getenv("RETENTION_PERIOD_DAYS", "30"))
    except ValueError:
        retention_period = 30

    expiry_date = datetime.now(timezone.utc) - timedelta(days=retention_period)
    return expiry_date.isoformat() + "Z"


def throw_if_missing(obj, keys):
    """
    Throws an error if any of the keys are missing from the dictionary or None/0.
    
    :param obj: Dictionary to check
    :param keys: List of required keys
    :raises ValueError: If required keys are missing
    """
    missing = []
    for key in keys:
        # Disallow 0 retention to prevent immediate deletion of objects, which can cause data loss.
        if key not in obj or obj[key] is None or obj[key] == 0:
            missing.append(key)

    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")
