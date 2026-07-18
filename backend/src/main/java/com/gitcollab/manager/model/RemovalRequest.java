package com.gitcollab.manager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "removal_requests")
public class RemovalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "github_user_id")
    @JsonIgnoreProperties("removalRequests")
    private GithubUser githubUser;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "repository_id")
    @JsonIgnoreProperties("removalRequests")
    private Repository repository;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RemovalRequestStatus status;

    @Column(name = "requested_by")
    private String requestedBy;

    @Column(name = "reason")
    private String reason;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public GithubUser getGithubUser() { return githubUser; }
    public void setGithubUser(GithubUser githubUser) { this.githubUser = githubUser; }

    public Repository getRepository() { return repository; }
    public void setRepository(Repository repository) { this.repository = repository; }

    public RemovalRequestStatus getStatus() { return status; }
    public void setStatus(RemovalRequestStatus status) { this.status = status; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public UUID getGithubUserId() { return githubUser != null ? githubUser.getId() : null; }
    public UUID getRepositoryId() { return repository != null ? repository.getId() : null; }
}

