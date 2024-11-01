package io.openruntimes.java.src;

import io.openruntimes.java.RuntimeContext;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;


public class Cors {

    /**
     * Returns true if the origin is allowed to make requests to this endpoint
     *
     * Parameters:
     *   context: Context object
     *
     * Returns:
     *   (boolean): True if the origin is allowed, False otherwise
     */
    public static boolean isOriginPermitted(RuntimeContext context) {
        String allowedOrigins = System.getenv("ALLOWED_ORIGINS");
        if (allowedOrigins == null || allowedOrigins.equals("*")) {
            return true;
        }

        List<String> allowedOriginsList = Arrays.asList(allowedOrigins.split(","));
        String originHeader = context.getReq().getHeaders().get("origin");
        return originHeader != null && allowedOriginsList.contains(originHeader);
    }

    /**
     * Returns the CORS headers for the request
     *
     * Parameters:
     *   context: Context object
     *
     * Returns:
     *   (Map<String, String>): CORS headers
     */
    public static Map<String, String> getCorsHeaders(RuntimeContext context) {
        if (!context.getReq().getHeaders().containsKey("origin")) {
            return new HashMap<>();
        }

        String allowedOrigins = System.getenv("ALLOWED_ORIGINS");
        if (allowedOrigins == null || allowedOrigins.equals("*")) {
            return new HashMap<>(Map.of("Access-Control-Allow-Origin", "*"));
        }

        String originHeader = context.getReq().getHeaders().get("origin");
        return new HashMap<>(Map.of("Access-Control-Allow-Origin", originHeader));
    }
}