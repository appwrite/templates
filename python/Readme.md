# URL shortner


To make a URL shortener with Python using Appwrite functions, you will need to:

<br>
     
**1.Install the Appwrite Python SDK:**
 
`pip install appwrite`  <br>

<br>

**2.Create a new Appwrite project and get your API key:**

  ``` from appwrite import Client
    client = Client(
    "YOUR_API_ENDPOINT",
    "YOUR_API_KEY")
  ```

<br>

**3.Create a Collection in Appwrite to store the shortened URLs:**
```
db = client.database()
db.createCollection("links")
```
<br>

**4.Implement the following functions to shorten and expand URLs:**
```
def shorten_url(long_url):
    """Shortens a long URL."""

    # Generate a random short URL.
    short_url = ''.join(random.choice(string.ascii_lowercase) for i in range(6))

    # Check if the short URL already exists.
    link = db.collection("links").get(short_url)
    if link:
        # Generate a new short URL.
        short_url = shorten_url(long_url)

    # Create a new link record in the database.
    link = db.collection("links").create({
        "longUrl": long_url,
        "shortUrl": short_url
    })

    return short_url

def expand_url(short_url):
    """Expands a short URL."""

    link = db.collection("links").get(short_url)
    if link:
        return link["longUrl"]
    else:
        return None

```

<br>

**5.Use the following code to shorten and expand URLs:**
```
# Shorten a URL.
short_url = shorten_url("https://example.com")

# Expand a URL.
long_url = expand_url("short_url")
```

<br>

You can use these functions to build a simple URL shortener web app or API.

<br>

> There is a example file named      
  <b>   exampleURLshortner.py </b>

<br>

> To use it, please read       
<b>  instructionsforexample.md </b> 











