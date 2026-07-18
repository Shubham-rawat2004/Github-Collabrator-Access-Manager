package com.gitcollab.manager.service;

import com.gitcollab.manager.model.ApprovalRequest;
import com.gitcollab.manager.model.ApprovalRequestStatus;
import com.gitcollab.manager.model.AuditLog;
import com.gitcollab.manager.model.BulkOffboardingBatch;
import com.gitcollab.manager.repository.ApprovalRequestRepository;
import com.gitcollab.manager.repository.AuditLogRepository;
import com.gitcollab.manager.repository.BulkOffboardingBatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class GovernanceService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ApprovalRequestRepository approvalRequestRepository;

    @Autowired
    private BulkOffboardingBatchRepository bulkOffboardingBatchRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    @Lazy
    private OffboardingService offboardingService;

    public List<AuditLog> listAuditLogs() {
        return auditLogRepository.findRecentAuditLogs(PageRequest.of(0, 100));
    }

    public List<ApprovalRequest> listApprovalRequests() {
        return approvalRequestRepository.findRecentApprovalRequests(PageRequest.of(0, 100));
    }

    public ApprovalRequest createApprovalRequest(String requestType, String referenceId, String requestedBy) {
        String requester = requestedBy != null ? requestedBy.trim() : "admin";
        
        ApprovalRequest request = new ApprovalRequest();
        request.setRequestType(requestType.trim());
        request.setReferenceId(referenceId != null ? referenceId.trim() : null);
        request.setStatus(ApprovalRequestStatus.PENDING);
        request.setRequestedBy(requester);
        request.setCreatedAt(LocalDateTime.now());
        
        request = approvalRequestRepository.save(request);

        auditLogService.recordAuditEvent(
                "APPROVAL_REQUEST_CREATED",
                "approval_requests",
                request.getId(),
                requester,
                Map.of("requestType", request.getRequestType(), "referenceId", request.getReferenceId() != null ? request.getReferenceId() : "")
        );

        return request;
    }

    public ApprovalRequest updateApprovalRequestStatus(UUID id, ApprovalRequestStatus status, String actedBy) {
        String actor = actedBy != null ? actedBy.trim() : "admin";

        ApprovalRequest request = approvalRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval request not found."));

        request.setStatus(status);
        request.setApprovedBy(actor);
        request.setApprovedAt(LocalDateTime.now());
        request = approvalRequestRepository.save(request);

        if ("BULK_OFFBOARDING".equalsIgnoreCase(request.getRequestType()) && request.getReferenceId() != null) {
            UUID batchId = UUID.fromString(request.getReferenceId());
            Optional<BulkOffboardingBatch> bulkBatchOpt = bulkOffboardingBatchRepository.findById(batchId);

            if (bulkBatchOpt.isPresent()) {
                BulkOffboardingBatch bulkBatch = bulkBatchOpt.get();
                if (status == ApprovalRequestStatus.APPROVED) {
                    bulkBatch.setStatus("APPROVED");
                    bulkBatch.setApprovedAt(LocalDateTime.now());
                    bulkBatch.setRejectionReason(null);
                    bulkOffboardingBatchRepository.save(bulkBatch);

                    // Execute bulk offboarding asynchronously or synchronously
                    // Replicating Next.js, it is run synchronously in the handler
                    try {
                        offboardingService.executeBulkOffboardingBatch(bulkBatch.getId(), actor);
                    } catch (Exception e) {
                        System.err.println("Failed to execute bulk offboarding batch: " + e.getMessage());
                    }
                } else {
                    bulkBatch.setStatus("REJECTED");
                    bulkBatch.setRejectionReason("Rejected via governance workflow");
                    bulkOffboardingBatchRepository.save(bulkBatch);
                }
            }
        }

        auditLogService.recordAuditEvent(
                status == ApprovalRequestStatus.APPROVED ? "APPROVAL_REQUEST_APPROVED" : "APPROVAL_REQUEST_REJECTED",
                "approval_requests",
                request.getId(),
                actor,
                Map.of("requestType", request.getRequestType(), "referenceId", request.getReferenceId() != null ? request.getReferenceId() : "")
        );

        return request;
    }
}
