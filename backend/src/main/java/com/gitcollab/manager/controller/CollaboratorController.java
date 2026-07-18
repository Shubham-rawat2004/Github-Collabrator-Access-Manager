package com.gitcollab.manager.controller;

import com.gitcollab.manager.model.GithubUser;
import com.gitcollab.manager.service.CollaboratorService;
import com.gitcollab.manager.service.OffboardingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/collaborators")
public class CollaboratorController {

    @Autowired
    private CollaboratorService collaboratorService;

    @Autowired
    private OffboardingService offboardingService;

    @GetMapping
    public ResponseEntity<Map<String, List<GithubUser>>> getCollaborators(@RequestParam(value = "q", defaultValue = "") String q) {
        List<GithubUser> collaborators = collaboratorService.listCollaborators(q);
        return ResponseEntity.ok(Map.of("collaborators", collaborators));
    }

    @PostMapping("/remove-all")
    public ResponseEntity<Map<String, Object>> removeAllRepos(@RequestBody Map<String, String> body) {
        String githubUserIdStr = body.get("githubUserId");
        String executedBy = body.get("executedBy");

        if (githubUserIdStr == null || githubUserIdStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "githubUserId is required"));
        }

        try {
            UUID githubUserId = UUID.fromString(githubUserIdStr);
            Map<String, Object> result = offboardingService.removeCollaboratorFromAllRepos(githubUserId, executedBy);
            return ResponseEntity.ok(Map.of("result", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
