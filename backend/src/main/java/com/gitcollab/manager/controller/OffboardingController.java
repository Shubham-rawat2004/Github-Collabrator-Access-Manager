package com.gitcollab.manager.controller;

import com.gitcollab.manager.model.BulkOffboardingBatch;
import com.gitcollab.manager.model.OffboardingJob;
import com.gitcollab.manager.model.RemovalRequest;
import com.gitcollab.manager.service.OffboardingService;
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
public class OffboardingController {

    @Autowired
    private OffboardingService offboardingService;

    @GetMapping("/api/offboarding/bulk")
    public ResponseEntity<Map<String, List<BulkOffboardingBatch>>> getBulkBatches() {
        return ResponseEntity.ok(Map.of("bulkBatches", offboardingService.listBulkOffboardingBatches()));
    }

    @PostMapping("/api/offboarding/bulk")
    public ResponseEntity<Map<String, Object>> createBulkOffboarding(@RequestBody Map<String, Object> body) {
        try {
            List<String> empIdsStr = (List<String>) body.get("employeeIds");
            List<UUID> employeeIds = empIdsStr == null ? List.of() : empIdsStr.stream()
                    .map(UUID::fromString)
                    .collect(Collectors.toList());

            String requestedBy = (String) body.get("requestedBy");
            String reason = (String) body.get("reason");

            BulkOffboardingBatch batch = offboardingService.createBulkOffboardingBatch(employeeIds, requestedBy, reason);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("bulkBatch", batch));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/offboarding/jobs")
    public ResponseEntity<Map<String, List<OffboardingJob>>> getOffboardingJobs() {
        return ResponseEntity.ok(Map.of("offboardingJobs", offboardingService.listOffboardingJobs()));
    }

    @PostMapping("/api/offboarding/jobs")
    public ResponseEntity<Map<String, Object>> createOffboardingJob(@RequestBody Map<String, String> body) {
        String employeeIdStr = body.get("employeeId");
        String requestedBy = body.get("requestedBy");
        String reason = body.get("reason");

        if (employeeIdStr == null || employeeIdStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "employeeId is required"));
        }

        try {
            UUID employeeId = UUID.fromString(employeeIdStr);
            OffboardingJob job = offboardingService.createOffboardingJob(employeeId, requestedBy, reason);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("offboardingJob", job));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/offboarding/jobs/{id}/execute")
    public ResponseEntity<Map<String, Object>> executeOffboardingJob(
            @PathVariable("id") UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String executedBy = body != null ? body.get("executedBy") : "admin";
        try {
            OffboardingJob job = offboardingService.executeOffboardingJob(id, executedBy);
            return ResponseEntity.ok(Map.of("offboardingJob", job));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/offboarding/remove")
    public ResponseEntity<Map<String, Object>> removeEmployeeAccess(@RequestBody Map<String, String> body) {
        String employeeIdStr = body.get("employeeId");
        String executedBy = body.get("executedBy");

        if (employeeIdStr == null || employeeIdStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "employeeId is required"));
        }

        try {
            UUID employeeId = UUID.fromString(employeeIdStr);
            Map<String, Object> result = offboardingService.removeEmployeeAccess(employeeId, executedBy);
            return ResponseEntity.ok(Map.of("result", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/removal-requests")
    public ResponseEntity<Map<String, List<RemovalRequest>>> getRemovalRequests() {
        return ResponseEntity.ok(Map.of("removalRequests", offboardingService.listRemovalRequests()));
    }

    @PostMapping("/api/removal-requests")
    public ResponseEntity<Map<String, Object>> createRemovalRequest(@RequestBody Map<String, String> body) {
        String githubUserIdStr = body.get("githubUserId");
        String repositoryIdStr = body.get("repositoryId");
        String requestedBy = body.get("requestedBy");
        String reason = body.get("reason");

        if (githubUserIdStr == null || repositoryIdStr == null || githubUserIdStr.trim().isEmpty() || repositoryIdStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "githubUserId and repositoryId are required"));
        }

        try {
            UUID githubUserId = UUID.fromString(githubUserIdStr);
            UUID repositoryId = UUID.fromString(repositoryIdStr);
            RemovalRequest request = offboardingService.createRemovalRequest(githubUserId, repositoryId, requestedBy, reason);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("removalRequest", request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/removal-requests/{id}/execute")
    public ResponseEntity<Map<String, Object>> executeRemovalRequest(
            @PathVariable("id") UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String executedBy = body != null ? body.get("executedBy") : "admin";
        try {
            RemovalRequest request = offboardingService.executeRemovalRequest(id, executedBy);
            return ResponseEntity.ok(Map.of("removalRequest", request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
