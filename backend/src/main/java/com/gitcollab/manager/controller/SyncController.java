package com.gitcollab.manager.controller;

import com.gitcollab.manager.model.SyncJob;
import com.gitcollab.manager.service.SyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sync")
public class SyncController {

    @Autowired
    private SyncService syncService;

    @GetMapping
    public ResponseEntity<List<SyncJob>> getSyncJobs() {
        return ResponseEntity.ok(syncService.getSyncJobs());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> runSync(@RequestBody(required = false) Map<String, String> body) {
        String initiatedBy = (body != null) ? body.get("initiatedBy") : "admin";
        try {
            Map<String, Object> result = syncService.runSync(initiatedBy);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
