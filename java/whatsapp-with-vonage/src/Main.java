package io.openruntimes.java.src;

import io.openruntimes.java.RuntimeContext;
import io.openruntimes.java.RuntimeOutput;

import java.util.Map;
import java.util.HashMap;

import com.google.gson.Gson;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpRequest;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;

import java.io.IOException;

import java.util.Base64;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.gson.io.GsonDeserializer;

import javax.crypto.SecretKey;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;

import java.util.Map;
import java.util.HashMap;

public class Main {

    public RuntimeOutput main(RuntimeContext context) throws Exception {
        String reqVariables[] = {
            "VONAGE_API_KEY",
            "VONAGE_API_SECRET",
            "VONAGE_API_SIGNATURE_SECRET",
            "VONAGE_WHATSAPP_NUMBER"
        };
        Utils.throw_if_missing(System.getenv(), reqVariables);

        if (context.getReq().getMethod().equals("GET")) {
            return context.getRes().send("Got GET Request");
        }

        Gson gson = new Gson();
        Map<String, Object> responseMap = new HashMap<String, Object>();
        responseMap.put("ok", true); 

        Map<String, Object> body;
        if(context.getReq().getBody() instanceof Map){
            body  = (Map<String, Object>)context.getReq().getBody();
        }else{
            responseMap.put("ok", false); 
            responseMap.put("error", "Invalid Body.");
            return context.getRes().json(responseMap, 400);
        }
        Map<String, String> headers = context.getReq().getHeaders();

        try {
            String token = (headers.get("authorization") != null && !headers.get("authorization").isEmpty()) ? headers.get("authorization").split(" ")[1] : "";
			SecretKey key = Keys.hmacShaKeyFor(System.getenv("VONAGE_API_SIGNATURE_SECRET").getBytes());
			Jws<Claims> decoded = Jwts.parser().json(new GsonDeserializer(gson)).setSigningKey(key).build().parseClaimsJws(token);

            try{
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hashBytes = digest.digest(context.getReq().getBodyRaw().getBytes(StandardCharsets.UTF_8));
                StringBuilder hexStringBuilder = new StringBuilder();
                for (byte b : hashBytes) {
                    hexStringBuilder.append(String.format("%02x", b));
                }

                if(!decoded.getBody().get("payload_hash").equals(hexStringBuilder.toString())){
                    responseMap.put("ok", false);
                    responseMap.put("error", "Payload hash mismatch.");
                    return context.getRes().json(responseMap, 401);
                }
            }catch(NoSuchAlgorithmException e){
                responseMap.put("ok", false);
                responseMap.put("error", "Payload hash mismatch.");
                return context.getRes().json(responseMap, 401);
            }
		}catch (JwtException e) {
			responseMap.put("ok", false);
            responseMap.put("error", "Invalid Token");
            return context.getRes().json(responseMap, 401);
		}
        try{
            String reqHeader[] = {"from", "text"};
            Utils.throw_if_missing(body, reqHeader);
        }catch(Exception e){
            responseMap.put("ok", false); 
            responseMap.put("error", e.getMessage());
            return context.getRes().json(responseMap, 400);
        }
        
        try{
			Map<String, String> data = new HashMap<String, String>();
			data.put("from", System.getenv("VONAGE_WHATSAPP_NUMBER"));
			data.put("to", System.getenv("TO_NUMBER"));
			data.put("message_type", "text");
			data.put("text", "Hi there! You sent me: "+body.get("text"));
			data.put("channel", "whatsapp");
	
			String basicAuth= System.getenv("VONAGE_API_KEY") + ":" + System.getenv("VONAGE_API_SECRET");
			String basicAuthToken = "Basic " + Base64.getEncoder().encodeToString(basicAuth.getBytes());
			
			HttpRequest request = HttpRequest.newBuilder()
				.uri(new URI("https://messages-sandbox.nexmo.com/v1/messages"))
				.header("Content-Type", "application/json")
				.header("Accept", "application/json")
				.header("Authorization", basicAuthToken)
				.POST(HttpRequest.BodyPublishers.ofString(gson.toJson(data)))
				.build();

			HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
			
		}catch(URISyntaxException | IOException | InterruptedException e){
			responseMap.put("ok", false); 
            responseMap.put("error", e.getMessage());
            return context.getRes().json(responseMap, 400);
		}
        return context.getRes().json(responseMap);
    }
}
