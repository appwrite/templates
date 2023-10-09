import com.vonage.client.VonageClient;
import com.vonage.client.VonageClientException;
import com.vonage.client.messages.Message;
import com.vonage.client.messages.MessageResponse;
import io.github.cdimascio.dotenv.Dotenv;

public class WhatsAppWithVonageFunction {

    private static final Dotenv ENV = Dotenv.configure().load();

    private static final VonageClient VONAGE_CLIENT = new VonageClient(ENV.get("VONAGE_API_KEY"));

    public static MessageResponse sendMessage(String recipient, String message) throws VonageClientException {
        Message messageObject = new Message();
        messageObject.setTo(recipient);
        messageObject.setText(message);

        return VONAGE_CLIENT.getMessagesClient().sendMessage(messageObject);
    }

    public static void main(String[] args) throws VonageClientException {
        String recipient = ENV.get("WHATSAPP_RECIPIENT");
        String message = ENV.get("WHATSAPP_MESSAGE");

        MessageResponse response = sendMessage(recipient, message);

        if (response.getStatus() == 200) {
            System.out.println("Message sent successfully!");
        } else {
            System.err.println("Failed to send message: " + response.getErrorMessage());
        }
    }
}
