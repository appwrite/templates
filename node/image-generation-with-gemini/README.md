# ⚡ Image Generation with Gemini (Node)

Generate images using Google's Gemini API, save them locally, and automatically upload them to an Appwrite Storage bucket.

## 🧰 Usage

### CLI

- Generate and upload to Appwrite Storage

```powershell
node src/main.js "A cat running inside a stadium" 
```



### Bucket setup helper (optional)

Ensures the bucket exists (creates it if missing):

```powershell
node src/setup.js
```
Or the upload function in utils.js does this itself.

Images are written to `./output` as `gemini-image-<n>.png`.

## ⚙️ Configuration

| Setting           | Value                        |
| ----------------- | ---------------------------- |
| Runtime           | Node (>=18)                  |
| Entrypoint        | `src/main.js`                |
| Output folder     | `output/`                    |
| Upload provider   | Appwrite Storage             |
| Bucket (default)  | `Generated_Images`           |

> Note: If you plan to run this as an Appwrite Function, set Entrypoint to `src/main.js` and ensure the environment variables below are configured in Appwrite as well.

## 🔒 Environment Variables

Set these in a local `.env` file (or inject in your platform):

| Variable                          | Required | Sample Value                                 | Notes                                                            |
| --------------------------------- | -------- | -------------------------------------------- | ---------------------------------------------------------------- |
| `GEMINI_API_KEY`                  | Yes      | `AIza...`                                     | Google Gemini API key                                            |
| `GEMINI_MODEL`                    | No       | `gemini-2.0-flash-preview-image-generation`  | Defaults to the value shown                                      |

| `APPWRITE_FUNCTION_API_ENDPOINT`  | Yes\*    | `https://cloud.appwrite.io/v1`                | Appwrite endpoint                                                |
| `APPWRITE_FUNCTION_PROJECT_ID`    | Yes*     | `YOUR_PROJECT_ID`                             | Appwrite project ID                                              |
| `APPWRITE_FUNCTION_API_KEY`       | Yes*     | `YOUR_API_KEY`                                | Appwrite API key with Storage permissions                        |
| `APPWRITE_BUCKET_ID`              | No       | `Generated_Images`                            | Bucket ID used/created                                           |

\* Required only when uploading to Appwrite.

Example `.env` (placeholder values):

```dotenv
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.0-flash-preview-image-generation


# Appwrite creds (needed when uploading)
APPWRITE_FUNCTION_API_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_FUNCTION_PROJECT_ID=YOUR_PROJECT_ID
APPWRITE_FUNCTION_API_KEY=YOUR_API_KEY
APPWRITE_BUCKET_ID=Generated_Images
```


## ✅ Expected output

On success, you'll see logs like:

```
Image saved as D:\...\output\gemini-image-10.png
✓ Image created at: D:\...\output\gemini-image-10.png
📤 Uploading to Appwrite...
✓ Image uploaded to Appwrite with file ID: <FILE_ID>
✓ Upload complete! File ID: <FILE_ID>
```

## 🧯 Troubleshooting

- "Cannot read properties of undefined (reading 'size')"
  - Run `npm install` to ensure dependencies are present
  - Use Node 18+ (the SDK relies on `fetch`, `File`, etc.)

- 401 / 403 errors when uploading
  - Check `APPWRITE_FUNCTION_API_KEY` and `APPWRITE_FUNCTION_PROJECT_ID`
  - Ensure the API key has Storage permissions


## 📦 Install

```powershell
npm install
```

Optionally, format code:

```powershell
npm run format
```

