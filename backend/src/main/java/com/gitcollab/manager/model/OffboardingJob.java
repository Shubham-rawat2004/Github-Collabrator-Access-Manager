package com.gitcollab.manager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "offboarding_jobs")
public class OffboardingJob {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id")
    @JsonIgnoreProperties("offboardingJobs")
    private Employee employee;

    @Column(name = "status")
    private String status;

    @Column(name = "repositories_total", nullable = false)
    private int repositoriesTotal = 0;

    @Column(name = "repositories_processed", nullable = false)
    private int repositoriesProcessed = 0;

    @Column(name = "repositories_failed", nullable = false)
    private int repositoriesFailed = 0;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "offboardingJob", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("offboardingJob")
    private List<OffboardingJobItem> items = new ArrayList<>();

    @OneToOne(mappedBy = "offboardingJob", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private BulkOffboardingBatchItem bulkOffboardingBatchItem;


    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getRepositoriesTotal() { return repositoriesTotal; }
    public void setRepositoriesTotal(int repositoriesTotal) { this.repositoriesTotal = repositoriesTotal; }

    public int getRepositoriesProcessed() { return repositoriesProcessed; }
    public void setRepositoriesProcessed(int repositoriesProcessed) { this.repositoriesProcessed = repositoriesProcessed; }

    public int getRepositoriesFailed() { return repositoriesFailed; }
    public void setRepositoriesFailed(int repositoriesFailed) { this.repositoriesFailed = repositoriesFailed; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public List<OffboardingJobItem> getItems() { return items; }
    public void setItems(List<OffboardingJobItem> items) { this.items = items; }

    public BulkOffboardingBatchItem getBulkOffboardingBatchItem() { return bulkOffboardingBatchItem; }
    public void setBulkOffboardingBatchItem(BulkOffboardingBatchItem bulkOffboardingBatchItem) { this.bulkOffboardingBatchItem = bulkOffboardingBatchItem; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public UUID getEmployeeId() { return employee != null ? employee.getId() : null; }
}

