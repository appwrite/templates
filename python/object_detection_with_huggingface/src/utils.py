def throw_if_missing(obj, keys):
   missing = []
   for key in keys:
       if key not in obj or not obj[key]:
           missing.append(key)
   if missing:
       raise ValueError(f"Missing required fields: {', '.join(missing)}")
