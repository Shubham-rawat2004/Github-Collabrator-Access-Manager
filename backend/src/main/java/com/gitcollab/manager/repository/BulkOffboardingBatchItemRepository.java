package com.gitcollab.manager.repository;

import com.gitcollab.manager.model.BulkOffboardingBatchItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BulkOffboardingBatchItemRepository extends JpaRepository<BulkOffboardingBatchItem, UUID> {
}
