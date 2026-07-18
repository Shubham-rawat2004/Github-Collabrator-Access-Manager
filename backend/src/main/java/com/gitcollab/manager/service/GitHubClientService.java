package com.gitcollab.manager.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GitHubClientService {

    private final String baseUrl = "https://api.github.com";

    @Value("${GITHUB_PAT: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}")
    private String token;

    @Autowired
    private ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private HttpRequest.Builder buildBaseRequest(String path) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalStateException("GITHUB_PAT is required to sync data from GitHub.");
        }

        return HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer " + token.trim())
                .header("X-GitHub-Api-Version", "2022-11-28")
                .header("User-Agent", "git-collabration");
    }

    private <T> T requestJson(String path, String method, String requestBody, TypeReference<T> typeRef, int retryCount) throws Exception {
        HttpRequest.Builder requestBuilder = buildBaseRequest(path);
        
        if (method.equals("POST") || method.equals("PATCH") || method.equals("PUT")) {
            requestBuilder.header("Content-Type", "application/json");
            requestBuilder.method(method, HttpRequest.BodyPublishers.ofString(requestBody != null ? requestBody : ""));
        } else if (method.equals("DELETE")) {
            requestBuilder.DELETE();
        } else {
            requestBuilder.GET();
        }

        HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());

        // Handle rate limiting
        if (response.statusCode() == 403 && retryCount > 0) {
            String rateRemaining = response.headers().firstValue("x-ratelimit-remaining").orElse("1");
            if ("0".equals(rateRemaining)) {
                String rateReset = response.headers().firstValue("x-ratelimit-reset").orElse("0");
                long resetAt = Long.parseLong(rateReset) * 1000;
                long delay = Math.max(resetAt - System.currentTimeMillis(), 1000);
                System.out.println("GitHub API rate limit hit. Waiting for " + delay + "ms before retrying...");
                Thread.sleep(delay);
                return requestJson(path, method, requestBody, typeRef, retryCount - 1);
            }
        }

        if (response.statusCode() >= 400) {
            throw new RuntimeException("GitHub API request failed (" + response.statusCode() + "): " + response.body());
        }

        if (typeRef == null) {
            return null; // For endpoints returning no content (like 204 DELETE)
        }

        return objectMapper.readValue(response.body(), typeRef);
    }

    public List<Map<String, Object>> getRepositories() throws Exception {
        List<Map<String, Object>> repositories = new ArrayList<>();
        int page = 1;

        while (true) {
            List<Map<String, Object>> data = requestJson(
                    "/user/repos?per_page=100&page=" + page + "&sort=updated&direction=desc",
                    "GET", null, new TypeReference<List<Map<String, Object>>>() {}, 1
            );

            if (data == null || data.isEmpty()) {
                break;
            }

            repositories.addAll(data);

            if (data.size() < 100) {
                break;
            }

            page += 1;
        }

        return repositories;
    }

    public List<Map<String, Object>> getCollaborators(String owner, String repo) throws Exception {
        List<Map<String, Object>> collaborators = new ArrayList<>();
        int page = 1;

        while (true) {
            List<Map<String, Object>> data = requestJson(
                    "/repos/" + owner + "/" + repo + "/collaborators?per_page=100&page=" + page,
                    "GET", null, new TypeReference<List<Map<String, Object>>>() {}, 1
            );

            if (data == null || data.isEmpty()) {
                break;
            }

            collaborators.addAll(data);

            if (data.size() < 100) {
                break;
            }

            page += 1;
        }

        return collaborators;
    }

    public String getCollaboratorPermission(String owner, String repo, String username) throws Exception {
        Map<String, Object> data = requestJson(
                "/repos/" + owner + "/" + repo + "/collaborators/" + username + "/permission",
                "GET", null, new TypeReference<Map<String, Object>>() {}, 1
        );

        if (data != null && data.containsKey("permission")) {
            return String.valueOf(data.get("permission"));
        }
        return "none";
    }

    public Map<String, Object> getRepository(String owner, String repo) throws Exception {
        return requestJson(
                "/repos/" + owner + "/" + repo,
                "GET", null, new TypeReference<Map<String, Object>>() {}, 1
        );
    }

    public Map<String, Object> getAuthenticatedUser() throws Exception {
        return requestJson(
                "/user",
                "GET", null, new TypeReference<Map<String, Object>>() {}, 1
        );
    }

    public void removeCollaborator(String owner, String repo, String username) throws Exception {
        // DELETE request returns 204 No Content
        requestJson(
                "/repos/" + owner + "/" + repo + "/collaborators/" + username,
                "DELETE", null, null, 1
        );
    }
}
