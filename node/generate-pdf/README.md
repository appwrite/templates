# Generate PDF

This function demonstrates using functions to generate a PDF document. The function generates random order information and converts it into a structured PDF invoice. 

## Usage

This function doesn't expect any parameters and only supports one type of request:

1. **Generating a PDF Invoice**
   - **Request Type:** GET
   - **Response:** 
     - On success, the function will respond with a binary stream of the generated PDF document. The `Content-Type` of the response will be set as `application/pdf`.
