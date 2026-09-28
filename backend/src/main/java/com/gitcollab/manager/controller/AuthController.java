package com.gitcollab.manager.controller;


import com.gitcollab.manager.service.SessionManager;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${ADMIN_USERNAME:admin}")
    private String adminUsername;

    @Value("${ADMIN_PASSWORD:change-me}")
    private String adminPassword;

    @Autowired
    private SessionManager sessionManager;

    @PostMapping("/login")
    public ResponseEntity<Void> login(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam(value = "from", defaultValue = "/") String from,
            HttpServletResponse response) {

        if (username == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        if (!username.equals(adminUsername) || !password.equals(adminPassword)) {
            String redirectUrl = "/login?error=invalid";
            if (from != null && from.startsWith("/")) {
                redirectUrl += "&from=" + URLEncoder.encode(from, StandardCharsets.UTF_8);
            }
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(redirectUrl))
                    .build();
        }

        String sessionToken = sessionManager.createSessionToken(username, "ADMIN");

        Cookie sessionCookie = new Cookie("gcam_session", sessionToken);
        sessionCookie.setHttpOnly(true);
        sessionCookie.setPath("/");
        sessionCookie.setMaxAge(24 * 60 * 60); // 1 day
        // In dev, SECURE is false. In production, SECURE should be true.
        sessionCookie.setSecure(false);
        response.addCookie(sessionCookie);

        // Delete gcam_sync_done cookie
        Cookie syncDoneCookie = new Cookie("gcam_sync_done", "");
        syncDoneCookie.setPath("/");
        syncDoneCookie.setMaxAge(0);
        response.addCookie(syncDoneCookie);

        String targetUrl = (from != null && from.startsWith("/")) ? from : "/";
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(targetUrl))
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie sessionCookie = new Cookie("gcam_session", "");
        sessionCookie.setHttpOnly(true);
        sessionCookie.setPath("/");
        sessionCookie.setMaxAge(0);
        response.addCookie(sessionCookie);

        Cookie syncDoneCookie = new Cookie("gcam_sync_done", "");
        syncDoneCookie.setPath("/");
        syncDoneCookie.setMaxAge(0);
        response.addCookie(syncDoneCookie);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("/login"))
                .build();
    }
}
