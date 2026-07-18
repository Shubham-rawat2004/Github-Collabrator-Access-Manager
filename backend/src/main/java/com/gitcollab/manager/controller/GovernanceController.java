package com.gitcollab.manager.controller;

import com.gitcollab.manager.model.ApprovalRequest;
import com.gitcollab.manager.model.ApprovalRequestStatus;
import com.gitcollab.manager.model.AuditLog;
import com.gitcollab.manager.service.GovernanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/governance")
public class GovernanceController {

    @Autowired
    private GovernanceService governanceService;

    @Autowired
    private com.gitcollab.manager.service.AuditLogService auditLogService;

    @GetMapping("/audit-logs")
    public ResponseEntity<Map<String, List<AuditLog>>> getAuditLogs() {
        List<AuditLog> logs = governanceService.listAuditLogs();
        return ResponseEntity.ok(Map.of("auditLogs", logs));
    }

    @PostMapping("/audit-logs")
    public ResponseEntity<AuditLog> recordAuditLog(@RequestBody Map<String, Object> body) {
        String actionType = String.valueOf(body.get("actionType"));
        String entityType = String.valueOf(body.get("entityType"));
        String entityIdStr = (String) body.get("entityId");
        UUID entityId = (entityIdStr != null && !entityIdStr.trim().isEmpty()) ? UUID.fromString(entityIdStr) : null;
        String performedBy = (String) body.get("performedBy");
        Map<String, Object> details = (Map<String, Object>) body.get("details");

        AuditLog log = auditLogService.recordAuditEvent(actionType, entityType, entityId, performedBy, details);
        return ResponseEntity.status(HttpStatus.CREATED).body(log);
    }


    @GetMapping("/approvals")
    public ResponseEntity<Map<String, List<ApprovalRequest>>> getApprovalRequests() {
        List<ApprovalRequest> requests = governanceService.listApprovalRequests();
        return ResponseEntity.ok(Map.of("approvalRequests", requests));
    }

    @PostMapping("/approvals")
    public ResponseEntity<Map<String, Object>> createApproval(@RequestBody Map<String, String> body) {
        String requestType = body.get("requestType");
        String referenceId = body.get("referenceId");
        String requestedBy = body.get("requestedBy");

        if (requestType == null || requestType.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "requestType is required"));
        }

        try {
            ApprovalRequest request = governanceService.createApprovalRequest(requestType, referenceId, requestedBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("approvalRequest", request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/approvals/{id}")
    public ResponseEntity<Map<String, Object>> updateApprovalStatus(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, String> body) {

        String statusStr = body.get("status");
        String actedBy = body.get("actedBy");

        if (statusStr == null || (!statusStr.equals("APPROVED") && !statusStr.equals("REJECTED"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "status must be APPROVED or REJECTED"));
        }

        try {
            ApprovalRequestStatus status = ApprovalRequestStatus.valueOf(statusStr);
            ApprovalRequest approval = governanceService.updateApprovalRequestStatus(id, status, actedBy);
            return ResponseEntity.ok(Map.of("approvalRequest", approval));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
