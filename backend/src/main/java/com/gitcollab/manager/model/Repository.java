package com.gitcollab.manager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "repositories", indexes = {
    @Index(name = "idx_repository_name", columnList = "name")
})
public class Repository {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "github_repo_id", unique = true)
    private Long githubRepoId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "live_url")
    private String liveUrl;

    @Column(name = "visibility")
    private String visibility;

    @Column(name = "default_branch")
    private String defaultBranch;

    @Column(name = "archived", nullable = false)
    private boolean archived = false;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @OneToMany(mappedBy = "repository", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("repository")
    private List<RepositoryAccess> repositoryAccess = new ArrayList<>();

    @OneToMany(mappedBy = "repository", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<SyncJobDetail> syncJobDetails = new ArrayList<>();

    @OneToMany(mappedBy = "repository", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<RemovalRequest> removalRequests = new ArrayList<>();

    @OneToMany(mappedBy = "repository", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<OffboardingJobItem> offboardingJobItems = new ArrayList<>();



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

    public Long getGithubRepoId() { return githubRepoId; }
    public void setGithubRepoId(Long githubRepoId) { this.githubRepoId = githubRepoId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLiveUrl() { return liveUrl; }
    public void setLiveUrl(String liveUrl) { this.liveUrl = liveUrl; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public String getDefaultBranch() { return defaultBranch; }
    public void setDefaultBranch(String defaultBranch) { this.defaultBranch = defaultBranch; }

    public boolean getArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean active) { isActive = active; }

    public LocalDateTime getLastSyncedAt() { return lastSyncedAt; }
    public void setLastSyncedAt(LocalDateTime lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; }

    public List<RepositoryAccess> getRepositoryAccess() { return repositoryAccess; }
    public void setRepositoryAccess(List<RepositoryAccess> repositoryAccess) { this.repositoryAccess = repositoryAccess; }

    public List<SyncJobDetail> getSyncJobDetails() { return syncJobDetails; }
    public void setSyncJobDetails(List<SyncJobDetail> syncJobDetails) { this.syncJobDetails = syncJobDetails; }

    public List<RemovalRequest> getRemovalRequests() { return removalRequests; }
    public void setRemovalRequests(List<RemovalRequest> removalRequests) { this.removalRequests = removalRequests; }

    public List<OffboardingJobItem> getOffboardingJobItems() { return offboardingJobItems; }
    public void setOffboardingJobItems(List<OffboardingJobItem> offboardingJobItems) { this.offboardingJobItems = offboardingJobItems; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
