package com.gitcollab.manager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "offboarding_job_items")
public class OffboardingJobItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "offboarding_job_id")
    @JsonIgnoreProperties("items")
    private OffboardingJob offboardingJob;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "repository_id")
    @JsonIgnoreProperties("offboardingJobItems")
    private Repository repository;

    @Column(name = "status")
    private String status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public OffboardingJob getOffboardingJob() { return offboardingJob; }
    public void setOffboardingJob(OffboardingJob offboardingJob) { this.offboardingJob = offboardingJob; }

    public Repository getRepository() { return repository; }
    public void setRepository(Repository repository) { this.repository = repository; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public UUID getOffboardingJobId() { return offboardingJob != null ? offboardingJob.getId() : null; }
    public UUID getRepositoryId() { return repository != null ? repository.getId() : null; }
}

