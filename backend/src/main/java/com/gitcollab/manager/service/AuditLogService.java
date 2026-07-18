package com.gitcollab.manager.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gitcollab.manager.model.AuditLog;
import com.gitcollab.manager.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.UUID;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public AuditLog recordAuditEvent(String actionType, String entityType, UUID entityId, String performedBy, Map<String, Object> details) {
        AuditLog log = new AuditLog();
        log.setActionType(actionType);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setPerformedBy(performedBy != null ? performedBy : "admin");
        
        try {
            log.setDetails(objectMapper.writeValueAsString(details != null ? details : Map.of()));
        } catch (Exception e) {
            log.setDetails("{}");
        }
        
        return auditLogRepository.save(log);
    }
}
