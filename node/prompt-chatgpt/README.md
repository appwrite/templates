# ⚡ OpenAI ChatGPT Function

Query the OpenAI GPT-3.5-turbo model for chat completions.

## 🧰 Usage

### `GET`

HTML form for interacting with the model.

### `POST`

Query the model for a completion.

**Parameters**

| Name | Description              | Location | Type   | Sample Value                  |
| ---- | ------------------------ | -------- | ------ | ----------------------------- |
| N/A  | Text to prompt the model | Body     | String | `Write a haiku about Mondays` |

Sample `200` Response:

Response from the model.

```text
Monday's heavy weight,
Dawning with a sigh of grey,
Hopeful hearts await.
```

Sample `400` Response:

Response when the request body is missing.

```
Missing body with a prompt.
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

### OPENAI_API_KEY

A unique key used to authenticate with the OpenAI API. Please note that this is a paid service and you will be charged for each request made to the API. For more information, see the [OpenAI pricing page](https://openai.com/pricing/).

| Question      | Answer                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| Required      | Yes                                                                         |
| Sample Value  | `d1efb...aec35`                                                             |
| Documentation | [OpenAI Docs](https://platform.openai.com/docs/quickstart/add-your-api-key) |

### OPENAI_MAX_TOKENS

The maximum number of tokens that the OpenAI response should contain. Be aware that OpenAI models read and write a maximum number of tokens per API call, which varies depending on the model. For GPT-3.5-turbo, the limit is 4096 tokens.

| Question      | Answer                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Required      | No                                                                                                            |
| Sample Value  | `512`                                                                                                         |
| Documentation | [OpenAI: What are tokens?](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them) |
