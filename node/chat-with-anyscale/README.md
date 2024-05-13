# 🤖 Node.js Chat with Anyscale Function

Ask question, and let Anyscale's models answer.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Query the model for a completion.

**Parameters**

| Name         | Description                          | Location | Type               | Sample Value                  |
| ------------ | ------------------------------------ | -------- | ------------------ | ----------------------------- |
| Content-Type | The content type of the request body | Header   | `application/json` | N/A                           |
| prompt       | Text to prompt the model             | Body     | String             | `Write a haiku about Mondays` |

Sample `200` Response:

Response from the model.

```json
{
    "ok": true,
    "completion": "Monday's heavy weight, Dawning with a sigh of grey, Hopeful hearts await."
}
```

Sample `400` Response:

Response when the request body is missing.

```json
{
  "ok": false,
  "error": "Missing required field: prompt"
}
```

Sample `500` Response:

Response when the model fails to respond.

```json
{
  "ok": false,
  "error": "Failed to query model."
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

### ANYSCALE_API_KEY

A unique key used to authenticate with the Anyscale API. You can find your API Keys [here](https://console.anyscale.com/v2/api-keys).

| Question      | Answer                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| Required      | Yes                                                                         |
| Sample Value  | `68...999`                                                              |
| Documentation | [Anyscale AI Docs](https://docs.endpoints.anyscale.com) |

### ANYSCALE_MAX_TOKENS

The maximum number of tokens that the Anyscale responses should contain.

| Question      | Answer                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Required      | No                                                                                                            |
| Sample Value  | `512`                                                                                                         |
| Documentation | [OpenAI: What are tokens?](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them) |

