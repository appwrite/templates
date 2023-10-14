package io.openruntimes.java.src;

import io.openruntimes.java.RuntimeContext;
import io.openruntimes.java.RuntimeOutput;
import java.util.Map;
import java.util.List;
import java.util.HashMap;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Collections;
import java.net.URI;
import java.net.URISyntaxException;
import java.lang.*;
import io.appwrite.Client;
import jakarta.mail.MessagingException;


public class Main {

    public RuntimeOutput main(RuntimeContext context) throws Exception {

        List<String> requiredEnvVariables = Arrays.asList(
                "SUBMIT_EMAIL",
                "SMTP_HOST",
                "SMTP_USERNAME",
                "SMTP_PASSWORD"
        );

        Utils.throwIfMissing(System.getenv(), requiredEnvVariables);
        if (System.getenv("ALLOWED_ORIGINS").equals("*")) {
            context.log("WARNING: Allowing requests from any origin - this is a security risk!");
        }

        if (context.getReq().getMethod().equals("GET")) {
            return context.getRes().send(
                    Utils.getHtmlContent("index.html"),
                    200,
                    Map.of("content-type", "text/html")
            );
        }


        if(!context.getReq().getHeaders().get("content-type").equals("application/x-www-form-urlencoded")){
            context.error("Incorrect content type");
            String referer = context.getReq().getHeaders().get("referer");
            String errorCode = ErrorCode.INVALID_REQUEST;
            return context.getRes().redirect(
                    String.format("%s?code=%s", referer, errorCode)
            );
        }

        if(!Cors.isOriginPermitted(context)){
            context.error("Origin not permitted");
            String referer = context.getReq().getHeaders().get("referer");
            String errorCode = ErrorCode.INVALID_REQUEST;
            return context.getRes().redirect(
                    String.format("%s?code=%s", referer, errorCode)
            );
        }

        Map<String, List<String>> formData = new HashMap<>();
        String body = (String) context.getReq().getBody();
        String[] params = body.split("&");
        for (String param : params) {
            String[] keyValue = param.split("=");
            String key = keyValue[0];
            String value = keyValue[1];
            if (!formData.containsKey(key)) {
                formData.put(key, new ArrayList<>());
            }
            formData.get(key).add(value);
        }

        Map<String, String> form = new HashMap<>();
        for (Map.Entry<String, List<String>> entry : formData.entrySet()) {
            form.put(entry.getKey(), entry.getValue().get(0));
        }

        try {
            Utils.throwIfMissing(form, Collections.singletonList("email"));
        } catch (IllegalArgumentException ex) {
            String referer = context.getReq().getHeaders().get("referer");
            String errorCode = ErrorCode.MISSING_FORM_FIELDS;
            return context.getRes().redirect(
                    String.format("%s?code=%s", referer, errorCode),
                    301,
                    Cors.getCorsHeaders(context)
            );
        }


        try {
            Map<String, String> emailOptions = new HashMap<>();
            emailOptions.put("from", System.getenv("SMTP_USERNAME"));
            emailOptions.put("to", System.getenv("SUBMIT_EMAIL"));
            emailOptions.put("subject", "New Contact Form Submission");
            emailOptions.put("text", Utils.templateFormMessage(form));
            Utils.sendEmail(emailOptions);
        } catch (MessagingException ex) {
            context.log("MessagingException: " + ex.getMessage());
            String referer = context.getReq().getHeaders().get("referer");
            String errorCode = ErrorCode.SERVER_ERROR;
            return context.getRes().redirect(
                    String.format("%s?code=%s", referer, errorCode),
                    301,
                    Cors.getCorsHeaders(context)
            );
        } catch (Exception ex) {
            context.log("Exception: " + ex.getMessage());
            String referer = context.getReq().getHeaders().get("referer");
            String errorCode = ErrorCode.SERVER_ERROR;
            return context.getRes().redirect(
                    String.format("%s?code=%s", referer, errorCode),
                    301,
                    Cors.getCorsHeaders(context)
            );
        }

        if (form.get("_next") == null || form.get("_next").isEmpty()) {
            return context.getRes().send(
                    Utils.getHtmlContent("success.html"),
                    200,
                    Map.of("content-type", "text/html; charset=utf-8")
            );
        }

        return context.getRes().redirect(
                Utils.joinURL(context.getReq().getHeaders().get("referer"), form.get("_next").substring(0,1)),
                301,
                Cors.getCorsHeaders(context)
        );
    }
}