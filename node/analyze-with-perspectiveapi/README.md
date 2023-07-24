# ⚡ Analyze with Perspective API Function

Interact with Google's perspective API to analyze the perceived impact of a comment or a string of text. The API uses machine learning to score the text based on several aspects, such as its potential to be perceived as toxic.

## 🧰 Usage

### `GET`

Displays an HTML form where users can input a string of text to be analyzed.

**Response**

Sample `200` Response:

```text
The HTML form
```

### `POST`

Returns toxicity score of the provided text, as determined by Google's Perspective API

| Name  | Description     | Location    | Type   | Sample Value                 |
|-------|-----------------|-------------|--------|------------------------------|
| text  | Text to analyze | Body String | String | `Goodbye, have a great day!` |


**Response**

Sample `200` Response:

```text
0.25
```

Sample `500` Response:

```text
Error analyzing text.
```

## ⚙️ Configuration

| Setting           | Value            |
|-------------------|------------------|
| Runtime           | Node (18.0)      |
| Entrypoint        | `src/main.js`    |
| Build Commands    | `npm install`    |
| Permissions       | `any`            |
| Timeout (Seconds) | 15               |

## 🔒 Environment Variables

### PERSPECTIVE_API_KEY

Google Perspective API key. It authenticates your function, allowing it to interact with the API.

| Question       | Answer                 |
|----------------|------------------------|
| Required       | Yes                    |
| Sample Value   | `d1efbd3jaoja4`        |
| Documentation  | [Setup Perspective API](https://developers.google.com/codelabs/setup-perspective-api) |
