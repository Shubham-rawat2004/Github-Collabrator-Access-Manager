package com.gitcollab.manager.repository;

import com.gitcollab.manager.model.OffboardingJob;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface OffboardingJobRepository extends JpaRepository<OffboardingJob, UUID> {
    
    @Query("SELECT j FROM OffboardingJob j ORDER BY j.createdAt DESC")
    List<OffboardingJob> findRecentOffboardingJobs(Pageable pageable);
}
