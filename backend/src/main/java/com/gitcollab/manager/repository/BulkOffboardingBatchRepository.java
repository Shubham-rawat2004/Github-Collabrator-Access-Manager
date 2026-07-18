package com.gitcollab.manager.repository;

import com.gitcollab.manager.model.BulkOffboardingBatch;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BulkOffboardingBatchRepository extends JpaRepository<BulkOffboardingBatch, UUID> {
    
    @Query("SELECT b FROM BulkOffboardingBatch b ORDER BY b.createdAt DESC")
    List<BulkOffboardingBatch> findRecentBulkOffboardingBatches(Pageable pageable);

    Optional<BulkOffboardingBatch> findByApprovalRequest_Id(UUID approvalRequestId);

}
