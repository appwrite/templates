# Analyze with Perspective API Function

This function allows you to interact with Google's Perspective API to analyze the perceived impact of a comment or a string of text. The API uses machine learning to score the text based on several aspects, such as its potential to be perceived as toxic.

## Environment Variables

To ensure the function operates as intended, ensure the following variable is set:

- **PERSPECTIVE_API_KEY**: This is your Google Perspective API key. It allows your function to interact with Google's Perspective API.

## Usage

This function supports two types of requests:

1. **Displaying the Input Form**

   - **Request Type:** GET
   - **Response:** 
     - On success, the function will respond with an HTML form where users can input a string of text to be analyzed.
   
2. **Analyzing a String of Text**

   - **Request Type:** POST
   - **Content Type:** text/plain
   - **Body:** 
     - The text to be analyzed
   - **Response:** 
     - On success, the function will respond with the toxicity score of the provided text, as determined by Google's Perspective API.
     - Example: `0.85`, which represents an 85% chance of the text being perceived as toxic. 

The application serves an HTML page which contains a form where the user can input text and submit it to the server for analysis. The submitted text is sent to the Perspective API, which returns a toxicity score (a number between 0 and 1, with 1 being the most toxic). This score is then displayed to the user.

The POST request is made from the client-side JavaScript using the fetch API. The body of the request is the text to be analyzed. The request's content type is 'text/plain'. The server function reads this text, sends it to the Perspective API, and returns the toxicity score to the client.

In the case of an error or unexpected status from the Perspective API, the server function returns a 500 status with the message 'Error analyzing text.'.

Please note that you need to get an API key from Google's Perspective API to use this function.

## HTML Interface

The function has a basic page where users can type in text for analysis. The page uses AlpineJS for client-side interactivity. When a user types text and clicks the "Analyze" button, the text is sent to the server and analyzed. The analysis score, which represents the text's toxicity level, is then shown on the page.

