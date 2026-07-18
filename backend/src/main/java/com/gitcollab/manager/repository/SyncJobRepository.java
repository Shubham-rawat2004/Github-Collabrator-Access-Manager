package com.gitcollab.manager.repository;

import com.gitcollab.manager.model.SyncJob;
import com.gitcollab.manager.model.SyncJobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SyncJobRepository extends JpaRepository<SyncJob, UUID> {
    
    Optional<SyncJob> findFirstByStatus(SyncJobStatus status);

    List<SyncJob> findTop20ByOrderByCreatedAtDesc();
}
