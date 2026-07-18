package com.gitcollab.manager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sync_jobs")
public class SyncJob {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SyncJobStatus status;

    @Column(name = "initiated_by")
    private String initiatedBy;

    @Column(name = "repositories_scanned", nullable = false)
    private int repositoriesScanned = 0;

    @Column(name = "collaborators_found", nullable = false)
    private int collaboratorsFound = 0;

    @Column(name = "error_count", nullable = false)
    private int errorCount = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @OneToMany(mappedBy = "syncJob", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("syncJob")
    private List<SyncJobDetail> details = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public SyncJobStatus getStatus() { return status; }
    public void setStatus(SyncJobStatus status) { this.status = status; }

    public String getInitiatedBy() { return initiatedBy; }
    public void setInitiatedBy(String initiatedBy) { this.initiatedBy = initiatedBy; }

    public int getRepositoriesScanned() { return repositoriesScanned; }
    public void setRepositoriesScanned(int repositoriesScanned) { this.repositoriesScanned = repositoriesScanned; }

    public int getCollaboratorsFound() { return collaboratorsFound; }
    public void setCollaboratorsFound(int collaboratorsFound) { this.collaboratorsFound = collaboratorsFound; }

    public int getErrorCount() { return errorCount; }
    public void setErrorCount(int errorCount) { this.errorCount = errorCount; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public List<SyncJobDetail> getDetails() { return details; }
    public void setDetails(List<SyncJobDetail> details) { this.details = details; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
