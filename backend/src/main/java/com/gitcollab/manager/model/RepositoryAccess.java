package com.gitcollab.manager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "repository_access",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"repository_id", "github_user_id"})
    },
    indexes = {
        @Index(name = "idx_repository_access_user", columnList = "github_user_id"),
        @Index(name = "idx_repository_access_repo", columnList = "repository_id")
    }
)
public class RepositoryAccess {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "repository_id", nullable = false)
    @JsonIgnoreProperties("repositoryAccess")
    private Repository repository;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "github_user_id", nullable = false)
    @JsonIgnoreProperties("repositoryAccess")
    private GithubUser githubUser;

    @Column(name = "permission")
    private String permission;

    @Column(name = "source", nullable = false)
    private String source = "direct";

    @Column(name = "synced_at")
    private LocalDateTime syncedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Repository getRepository() { return repository; }
    public void setRepository(Repository repository) { this.repository = repository; }

    public GithubUser getGithubUser() { return githubUser; }
    public void setGithubUser(GithubUser githubUser) { this.githubUser = githubUser; }

    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public LocalDateTime getSyncedAt() { return syncedAt; }
    public void setSyncedAt(LocalDateTime syncedAt) { this.syncedAt = syncedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public UUID getRepositoryId() { return repository != null ? repository.getId() : null; }
    public UUID getGithubUserId() { return githubUser != null ? githubUser.getId() : null; }
}

