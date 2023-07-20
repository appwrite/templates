# WhatsApp Reply Function

This function allows you to reply to a WhatsApp message through the [Vonage Messages API](https://developer.vonage.com/en/messaging/sms/overview). When a POST request is sent to this function with the necessary information, it sends a reply to the sender using the content of their original message.

## Environment Variables

For the function to operate correctly, the following variables must be set:

- **VONAGE_API_KEY**: This is your Vonage project's API key. You can obtain this key from the Vonage dashboard under the "Getting Started" section. This key is used to authorize your application's requests to Vonage's APIs.

- **VONAGE_API_SECRET**: This is the secret for your Vonage project's API key. You can obtain this secret from the same section in the Vonage dashboard where you got the API key. The API secret is used together with the API key to form the Basic Auth string for your requests.

- **VONAGE_API_SIGNATURE_SECRET**: This is the signature secret for your Vonage project's API key. You can generate this secret in the "Settings" section of your Vonage dashboard, under "API Settings". This secret is used to verify the JWT token in the incoming request to ensure it's from an authorized source.

## Usage

This function supports two types of requests:

1. **Displaying a Landing Page**

   - **Request Type:** GET
   - **Response:** 
     - On success, the function will respond with a landing page in HTML format.

2. **Replying to a WhatsApp Message**

   - **Request Type:** POST
   - **Headers:**
     - `Authorization`: Bearer token using the `VONAGE_API_SIGNATURE_SECRET`
   - **Body:** 
     - `from`: Sender's phone number
     - `text`: (Optional) Text of the sender's message
   - **Response:** 
     - On success, the function will send a WhatsApp message to the sender's number, including the text "Hi there! You sent me: [text]" where [text] is replaced with the content of the sender's message, and respond with a status message of "OK".
     - If the `from` field is missing in the request, an error message "Payload invalid." is returned.
     - If the JWT token in the `Authorization` header is invalid or missing, an error message "Invalid signature." is returned.