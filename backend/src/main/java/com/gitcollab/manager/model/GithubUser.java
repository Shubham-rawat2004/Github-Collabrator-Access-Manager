package com.gitcollab.manager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "github_users", indexes = {
    @Index(name = "idx_github_username", columnList = "github_username")
})
public class GithubUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "github_id")
    private Long githubId;

    @Column(name = "github_username", nullable = false, unique = true)
    private String githubUsername;

    @Column(name = "github_profile_url")
    private String githubProfileUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id")
    @JsonIgnoreProperties("githubUsers")
    private Employee employee;

    @OneToMany(mappedBy = "githubUser", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("githubUser")
    private List<RepositoryAccess> repositoryAccess = new ArrayList<>();

    @OneToMany(mappedBy = "githubUser", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<RemovalRequest> removalRequests = new ArrayList<>();



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

    public Long getGithubId() { return githubId; }
    public void setGithubId(Long githubId) { this.githubId = githubId; }

    public String getGithubUsername() { return githubUsername; }
    public void setGithubUsername(String githubUsername) { this.githubUsername = githubUsername; }

    public String getGithubProfileUrl() { return githubProfileUrl; }
    public void setGithubProfileUrl(String githubProfileUrl) { this.githubProfileUrl = githubProfileUrl; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public List<RepositoryAccess> getRepositoryAccess() { return repositoryAccess; }
    public void setRepositoryAccess(List<RepositoryAccess> repositoryAccess) { this.repositoryAccess = repositoryAccess; }

    public List<RemovalRequest> getRemovalRequests() { return removalRequests; }
    public void setRemovalRequests(List<RemovalRequest> removalRequests) { this.removalRequests = removalRequests; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public UUID getEmployeeId() { return employee != null ? employee.getId() : null; }
}

