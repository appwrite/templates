# 📬 Node.js Email Contact Form Function

Sends an email with the contents of a HTML form.

## 🧰 Usage

### GET /

HTML form for interacting with the function.

### POST /

Submit form data to send an email

**Parameters**

| Name   | Description                       | Location   | Type   | Sample Value                     |
| ------ | --------------------------------- | ---------- | ------ | -------------------------------- |
| \_next | URL for redirect after submission | Form Param | String | `https://mywebapp.org/success`   |
| \*     | Any form values to send in email  | Form Param | String | `Hey, I'd like to get in touch!` |

**Response**

Sample `200` Response:

```text
Location: https://mywebapp.org/success
```

Sample `400` Response:

```text
Location: https://mywebapp.org/referer?error=Invalid+email+address
```

## ⚙️ Configuration

| Setting           | Value           |
| ----------------- | --------------- |
| Runtime           | Node (18.0)     |
| Entrypoint        | `src/main.js`   |
| Build Commands    | `npm install`   |
|                   | `npm run setup` |
| Permissions       | `any`           |
| Timeout (Seconds) | 15              |

## 🔒 Environment Variables

### SMTP_HOST

The address of your SMTP server. Many STMP providers will provide this information in their documentation. Some popular providers include: Mailgun, SendGrid, and Gmail.

| Question     | Answer             |
| ------------ | ------------------ |
| Required     | Yes                |
| Sample Value | `smtp.mailgun.org` |

### SMTP_PORT

The port of your STMP server. Commnly used ports include `25`, `465`, and `587`.

| Question     | Answer |
| ------------ | ------ |
| Required     | Yes    |
| Sample Value | `25`   |

### SMTP_USERNAME

The username for your SMTP server. This is commonly your email address.

| Question     | Answer                  |
| ------------ | ----------------------- |
| Required     | Yes                     |
| Sample Value | `no-reply@mywebapp.org` |

### SMTP_PASSWORD

The password for your SMTP server.

| Question     | Answer                |
| ------------ | --------------------- |
| Required     | Yes                   |
| Sample Value | `5up3r5tr0ngP4ssw0rd` |

### SUBMIT_EMAIL

The email address to send form submissions to.

| Question     | Answer            |
| ------------ | ----------------- |
| Required     | Yes               |
| Sample Value | `me@mywebapp.org` |

### ALLOWED_ORIGINS

An optional comma-separated list of allowed origins for CORS (defaults to `*`). This is an important security measure to prevent malicious users from abusing your function.

| Question      | Answer                                                              |
| ------------- | ------------------------------------------------------------------- |
| Required      | No                                                                  |
| Sample Value  | `https://mywebapp.org,https://mywebapp.com`                         |
| Documentation | [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) |
