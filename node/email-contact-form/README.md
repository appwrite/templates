# Email Contact Form Function

## Overview

This function facilitates email submission from HTML forms using Appwrite. It validates form data, sends an email through an SMTP server, and handles redirection of the user based on the success or failure of the submission.

## Usage

### HTML Form

To use this function, set the `action` attribute of your HTML form to your function URL, and include a hidden input with the name `_next` and the path of the redirect to on successful form submission (e.g. `/success`).

```html
<form action="{{YOUR_FUNCTION_URL}}" method="post">
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Your Message" required></textarea>
  <input type="hidden" name="_next" value="{{YOUR_SUCCESS_PATH}}" />
  <button type="submit">Submit</button>
</form>
```

## Environment Variables

This function depends on the following environment variables:

- **SMTP_HOST** - SMTP server host
- **SMTP_PORT** - SMTP server port
- **SMTP_USERNAME** - SMTP server username
- **SMTP_PASSWORD** - SMTP server password
- **SUBMIT_EMAIL** - The email address to send form submissions
- **ALLOWED_ORIGINS** - An optional comma-separated list of allowed origins for CORS (defaults to `*`)

## Request

### Form Data

- **_next_** - The URL to redirect to on successful form submission
- **email** - The sender's email address

- _Additional form data will be included in the email body_

## Response

### Success Redirect

On successful form submission, the function will redirect users to the URL provided in the `_next` form data.

### Error Redirect

In the case of errors such as invalid request methods, missing form data, or SMTP configuration issues, the function will redirect users back to the form URL with an appended error code for more precise error handling. Error codes include `invalid-request`, `missing-form-fields`, and generic `server-error`.
