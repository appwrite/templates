# ⚡ Analyze with Perspective API Function

Interact with Google's perspective API to analyze the perceived impact of a comment or a string of text. The API uses machine learning to score the text based on several aspects, such as its potential to be perceived as toxic.

## 🧰 Usage

### `GET`

Displays an HTML form where users can input a string of text to be analyzed.

### `POST`

Returns toxicity score of the provided text, as determined by Google's Perspective API

| Name         | Description                 | Location | Type               | Sample Value                 |
| ------------ | --------------------------- | -------- | ------------------ | ---------------------------- |
| Content-Type | Content type of the request | Header   | `application/json` | N/A                          |
| text         | Text to analyze             | Body     | String             | `Goodbye, have a great day!` |

**Response**

Sample `200` Response:

```json
{
  "ok": true,
  "score": 0.1
}
```

Sample `400` Response:

```json
{
  "ok": false,
  "error": "Missing body with a prompt."
}
```

Sample `500` Response:

```json
{
  "ok": false,
  "error": "Error fetching from perspective API"
}
```

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

### PERSPECTIVE_API_KEY

Google Perspective API key. It authenticates your function, allowing it to interact with the API.

| Question      | Answer                                                                                |
| ------------- | ------------------------------------------------------------------------------------- |
| Required      | Yes                                                                                   |
| Sample Value  | `d1efbd3jaoja4`                                                                       |
| Documentation | [Setup Perspective API](https://developers.google.com/codelabs/setup-perspective-api) |
