package com.gitcollab.manager.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;

@Service
public class SessionManager {

    @Value("${SESSION_SECRET:replace-with-a-long-random-string}")
    private String sessionSecret;

    @Autowired
    private ObjectMapper objectMapper;

    private String base64UrlEncode(byte[] input) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(input);
    }

    private byte[] base64UrlDecode(String input) {
        return Base64.getUrlDecoder().decode(input);
    }

    private String sign(String payload) throws Exception {
        Mac sha256HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(sessionSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256HMAC.init(secretKey);
        byte[] hash = sha256HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        return base64UrlEncode(hash);
    }

    public String createSessionToken(String username, String role) {
        try {
            Map<String, String> sessionMap = Map.of("username", username, "role", role);
            String jsonStr = objectMapper.writeValueAsString(sessionMap);
            String payload = base64UrlEncode(jsonStr.getBytes(StandardCharsets.UTF_8));
            String signature = sign(payload);
            return payload + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate session token", e);
        }
    }

    public Map<String, Object> verifySessionToken(String token) {
        if (token == null || !token.contains(".")) {
            return null;
        }

        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            return null;
        }

        String payload = parts[0];
        String signature = parts[1];

        try {
            String expectedSignature = sign(payload);
            byte[] sigBytes = signature.getBytes(StandardCharsets.UTF_8);
            byte[] expectedSigBytes = expectedSignature.getBytes(StandardCharsets.UTF_8);

            if (!MessageDigest.isEqual(sigBytes, expectedSigBytes)) {
                return null;
            }

            byte[] decodedPayload = base64UrlDecode(payload);
            String jsonStr = new String(decodedPayload, StandardCharsets.UTF_8);
            return objectMapper.readValue(jsonStr, Map.class);
        } catch (Exception e) {
            return null;
        }
    }
}
