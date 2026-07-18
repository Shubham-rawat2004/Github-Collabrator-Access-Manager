package com.gitcollab.manager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "employees", indexes = {
    @Index(name = "idx_employee_name", columnList = "full_name")
})
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "department")
    private String department;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "employee", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("employee")
    private List<GithubUser> githubUsers = new ArrayList<>();

    @OneToMany(mappedBy = "employee", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<OffboardingJob> offboardingJobs = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<BulkOffboardingBatchItem> bulkOffboardingBatchItems = new ArrayList<>();



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

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean active) { isActive = active; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<GithubUser> getGithubUsers() { return githubUsers; }
    public void setGithubUsers(List<GithubUser> githubUsers) { this.githubUsers = githubUsers; }

    public List<OffboardingJob> getOffboardingJobs() { return offboardingJobs; }
    public void setOffboardingJobs(List<OffboardingJob> offboardingJobs) { this.offboardingJobs = offboardingJobs; }

    public List<BulkOffboardingBatchItem> getBulkOffboardingBatchItems() { return bulkOffboardingBatchItems; }
    public void setBulkOffboardingBatchItems(List<BulkOffboardingBatchItem> bulkOffboardingBatchItems) { this.bulkOffboardingBatchItems = bulkOffboardingBatchItems; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
