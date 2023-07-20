# Censor with Redact Function

This function allows you to redact sensitive information from a provided text string. It uses the Redact API by Pangea to censor the text. You can use this function to ensure any text you process does not unintentionally reveal sensitive or personally identifiable information.

## Environment Variables

To ensure the function operates as intended, ensure the following variables are set:

- **PANGEA_REDACT_TOKEN**: This is your access token for the Pangea Redact API.

## Usage

This function supports two types of requests:

1. **GET Request**

   - **Request Type:** GET
   - **Response:** 
     - On success, the function will respond with an HTML page that can be used to enter text and see the redacted result. The HTML file is located in the 'static' folder, and it's named 'index.html'.

2. **Redact Text**

   - **Request Type:** POST
   - **Body:** 
     - The plain text string that you want to redact.
   - **Response:** 
     - On success, the function will respond with the text string with sensitive information redacted.

## Front-End Implementation

The function includes a simple front-end HTML page as an example of how you could use the function from a web page. The front-end sends a POST request to the function when the 'Censor' button is clicked, and the result is displayed on the page.

The HTML file (index.html) is located in the 'static' directory. It uses Alpine.js for interactivity and the @appwrite.io/pink CSS framework for styling. The page includes an input field where the user can type a message, a 'Censor' button to submit the message for redaction, and an area to display the redacted message.

## Error Handling

If the required environment variable `PANGEA_REDACT_TOKEN` is not set, the function will throw an error. Similarly, if a POST request is made without any body content, the function will return an HTTP 400 error with the message "Missing body with a prompt.".