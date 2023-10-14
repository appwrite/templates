package io.openruntimes.java.src;

import java.lang.*;
import java.io.File;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Map;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.Message;
import java.util.List;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Properties;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;


public class Utils {

    static String INDEX_HTML = "<!doctype html><html lang=\"en\"><head><meta charset=\"UTF-8\" /><meta http-equiv=\"X-UA-Compatible\" content=\"IE\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" /><title>Email Contact Form</title><link rel=\"stylesheet\" href=\"https://unpkg.com/@appwrite.io/pink\" /><link rel=\"stylesheet\" href=\"https://unpkg.com/@appwrite.io/pink-icons\" /></head><body><main class=\"main-content\"><div class=\"top-cover u-padding-block-end-56\"><div class=\"container\"><div class=\"u-flex u-gap-16 u-flex-justify-center u-margin-block-start-16\"><h1 class=\"heading-level-1\">Contact</h1><code class=\"u-un-break-text\"></code></div><p class=\"body-text-1 u-normal u-margin-block-start-16\" style=\"max-width: 50rem\">Fill the form below to send us a message.</p><form class=\"u-flex-vertical u-gap-16 u-margin-block-start-16\" style=\"max-width: 50rem\" method=\"post\"><input type=\"email\" name=\"email\" placeholder=\"Email\" required /><textarea name=\"message\" placeholder=\"Your Message\" required></textarea><button class=\"button\" type=\"submit\">Submit</button></form></div></div></main></body></html>";
    static String SUCCESS_HTML = "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Email Contact Form</title>\n    <link rel=\"stylesheet\" href=\"https://unpkg.com/@appwrite.io/pink\" />\n    <link rel=\"stylesheet\" href=\"https://unpkg.com/@appwrite.io/pink-icons\" />\n  </head>\n  <body>\n    <main class=\"main-content\">\n      <div class=\"top-cover u-padding-block-end-56\">\n        <div class=\"container\">\n          <div\n            class=\"u-flex u-gap-16 u-flex-justify-center u-margin-block-start-16\"\n          >\n            <h1 class=\"heading-level-1\">Success</h1>\n            <code class=\"u-un-break-text\"></code>\n          </div>\n          <p\n            class=\"body-text-1 u-normal u-margin-block-start-8\"\n            style=\"max-width: 50rem\"\n          >\n            Your message has been sent!\n          </p>\n        </div>\n      </div>\n    </main>\n  </body>\n</html>";

    /*
     * Returns the html contents of index and sucess page
     *
     * Parameters:
     *   fileName (String): Name of the file
     *
     * Returns:
     *   (String): Contents of index/success html page
     */
    public static String getHtmlContent(String fileName){
        if(fileName == "index.html"){
            return INDEX_HTML;
        }
        return SUCCESS_HTML;
    }

    /*
     * Throws an error if any of the keys are missing from the object
     *
     * Parameters:
     *   obj (Map<String, String>): Object to check
     *   keys (List<String>): List of keys to check
     *
     * Throws:
     *   IllegalArgumentException: If any keys are missing
     */
    public static void throwIfMissing(Map<String, String> obj, List<String> keys) {
        for (String key : keys) {
            if (!obj.containsKey(key) || obj.get(key) == null || obj.get(key).isEmpty()) {
                throw new IllegalArgumentException("Missing required fields: " + key);
            }
        }
    }


    /*
     * Sends an email using the SMTP credentials in the environment
     *
     * Parameters:
     *   options (Map<String, String>): Email options
     *
     * Throws:
     *   MessagingException: If there is an issue with sending the email
     */
    public static void sendEmail(Map<String, String> options) throws MessagingException {
        Properties properties = new Properties();
        properties.put("mail.smtp.host", System.getenv("SMTP_HOST"));
        properties.put("mail.smtp.port", System.getenv("SMTP_PORT") != null ? System.getenv("SMTP_PORT") : "587");
        properties.put("mail.smtp.auth", "true");
        if(System.getenv("SMTP_HOST").equals("smtp.gmail.com")){
            properties.put("mail.smtp.starttls.enable", "true");
            properties.put("mail.smtp.EnableSSL.enable","true");
            properties.put("mail.smtp.user", System.getenv("SMTP_USERNAME"));
            properties.put("mail.smtp.password", System.getenv("SMTP_PASSWORD"));
        }

        Session session = Session.getDefaultInstance(properties);
        MimeMessage message = new MimeMessage(session);

        message.setFrom(new InternetAddress(options.get("from")));
        message.addRecipient(Message.RecipientType.TO, new InternetAddress(options.get("to")));
        message.setSubject(options.get("subject"));
        message.setText(options.get("text"));

        Transport transport = session.getTransport("smtp");
        transport.connect(
                System.getenv("SMTP_HOST"),
                System.getenv("SMTP_USERNAME"),
                System.getenv("SMTP_PASSWORD")
        );

        transport.sendMessage(message, message.getAllRecipients());
        transport.close();
    }

    /*
     * Builds a string message body from a form submission
     *
     * Parameters:
     *   form (Map<String, String>): Form submission
     *
     * Returns:
     *   (String): Message body
     */
    public static String templateFormMessage(Map<String, String> form) throws UnsupportedEncodingException {
        StringBuilder messageBody = new StringBuilder("You've received a new message:\n");

        for (Map.Entry<String, String> entry : form.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            if (!key.equals("_next")) {
                value = java.net.URLDecoder.decode(value, "UTF-8");
                messageBody.append(key).append(": ").append(value).append("\n");
            }
        }

        return messageBody.toString();
    }

    public static String joinURL(String base, String path) {
        try {
            URI baseURI = new URI(base);
            URI resultURI = baseURI.resolve(path);

            return resultURI.toString();
        } catch (URISyntaxException e) {
            e.printStackTrace();
            return null;
        }
    }


}