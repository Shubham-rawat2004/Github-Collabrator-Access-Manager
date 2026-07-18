package com.gitcollab.manager.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bulk_offboarding_batch_items")
public class BulkOffboardingBatchItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bulk_offboarding_batch_id", nullable = false)
    @JsonIgnoreProperties("items")
    private BulkOffboardingBatch bulkOffboardingBatch;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties("bulkOffboardingBatchItems")
    private Employee employee;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "offboarding_job_id")
    @JsonIgnoreProperties("bulkOffboardingBatchItem")
    private OffboardingJob offboardingJob;

    @Column(name = "status", nullable = false)
    private String status = "PENDING";

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

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

    public BulkOffboardingBatch getBulkOffboardingBatch() { return bulkOffboardingBatch; }
    public void setBulkOffboardingBatch(BulkOffboardingBatch bulkOffboardingBatch) { this.bulkOffboardingBatch = bulkOffboardingBatch; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public OffboardingJob getOffboardingJob() { return offboardingJob; }
    public void setOffboardingJob(OffboardingJob offboardingJob) { this.offboardingJob = offboardingJob; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public UUID getEmployeeId() { return employee != null ? employee.getId() : null; }
    public UUID getBulkOffboardingBatchId() { return bulkOffboardingBatch != null ? bulkOffboardingBatch.getId() : null; }
    public UUID getOffboardingJobId() { return offboardingJob != null ? offboardingJob.getId() : null; }
}

