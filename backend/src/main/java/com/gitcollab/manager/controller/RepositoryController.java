package com.gitcollab.manager.controller;

import com.gitcollab.manager.model.GithubUser;
import com.gitcollab.manager.model.Repository;
import com.gitcollab.manager.model.RepositoryAccess;
import com.gitcollab.manager.repository.GithubUserRepository;
import com.gitcollab.manager.repository.RepositoryRepository;
import com.gitcollab.manager.service.GitHubClientService;
import com.gitcollab.manager.service.OffboardingService;
import com.gitcollab.manager.service.RepositoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/repositories")
public class RepositoryController {

    @Autowired
    private RepositoryService repositoryService;

    @Autowired
    private RepositoryRepository repositoryRepository;

    @Autowired
    private GithubUserRepository githubUserRepository;

    @Autowired
    private GitHubClientService gitHubClient;

    @Autowired
    private OffboardingService offboardingService;

    @GetMapping
    public ResponseEntity<Map<String, List<Repository>>> getRepositories(
            @RequestParam(value = "q", defaultValue = "") String q,
            @RequestParam(value = "visibility", defaultValue = "all") String visibility) {
        
        List<Repository> repositories = repositoryService.listRepositories(q, visibility);
        return ResponseEntity.ok(Map.of("repositories", repositories));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(repositoryService.getRepositoryMetrics());
    }

    @GetMapping("/{id}/access")
    public ResponseEntity<List<RepositoryAccess>> getRepositoryAccess(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(repositoryService.listRepositoryAccess(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Repository> getRepositoryByIdentifier(@PathVariable("id") String id) {
        return repositoryService.getRepositoryByIdentifier(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, String> getOwnerAndRepo(String fullName) {
        String[] parts = fullName.split("/");
        if (parts.length < 2) {
            throw new RuntimeException("Invalid repository full name: " + fullName);
        }
        return Map.of("owner", parts[0], "repo", parts[1]);
    }

    @PostMapping("/remove-collaborators")
    public ResponseEntity<Map<String, Object>> removeCollaborators(@RequestBody Map<String, Object> body) {
        String repositoryIdStr = (String) body.get("repositoryId");
        List<String> githubUserIdsStr = (List<String>) body.get("githubUserIds");
        String executedBy = (String) body.get("executedBy");

        if (repositoryIdStr == null || repositoryIdStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "repositoryId is required"));
        }

        if (githubUserIdsStr == null || githubUserIdsStr.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "githubUserIds array is required and must not be empty"));
        }

        try {
            UUID repositoryId = UUID.fromString(repositoryIdStr);
            List<UUID> githubUserIds = githubUserIdsStr.stream()
                    .map(UUID::fromString)
                    .collect(Collectors.toList());

            Repository repository = repositoryRepository.findById(repositoryId)
                    .orElseThrow(() -> new RuntimeException("Repository not found."));

            // Verify admin permission from GitHub API
            Map<String, String> nameParts = getOwnerAndRepo(repository.getFullName());
            boolean hasAdminPermission = false;
            String adminUsername = null;
            try {
                Map<String, Object> repoDetails = gitHubClient.getRepository(nameParts.get("owner"), nameParts.get("repo"));
                Map<String, Object> permissions = (Map<String, Object>) repoDetails.get("permissions");
                hasAdminPermission = permissions != null && Boolean.TRUE.equals(permissions.get("admin"));

                Map<String, Object> authenticatedUser = gitHubClient.getAuthenticatedUser();
                adminUsername = String.valueOf(authenticatedUser.get("login"));
            } catch (Exception e) {
                System.err.println("Failed to verify repository permissions with GitHub: " + e.getMessage());
            }

            if (!hasAdminPermission) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You don't have permission to remove collaborators from this repository."));
            }

            // Check if admin is trying to remove themselves
            if (adminUsername != null) {
                final String adminUserFinal = adminUsername;
                List<GithubUser> matchingAdmin = githubUserRepository.findAllById(githubUserIds).stream()
                        .filter(u -> u.getGithubUsername().equalsIgnoreCase(adminUserFinal))
                        .collect(Collectors.toList());

                if (!matchingAdmin.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "You cannot remove yourself as an administrator."));
                }
            }

            Map<String, Object> result = offboardingService.removeCollaboratorsFromRepository(repositoryId, githubUserIds, executedBy);
            return ResponseEntity.ok(Map.of("result", result));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
