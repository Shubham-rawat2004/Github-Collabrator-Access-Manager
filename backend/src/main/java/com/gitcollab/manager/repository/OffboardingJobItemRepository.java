package com.gitcollab.manager.repository;

import com.gitcollab.manager.model.OffboardingJobItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface OffboardingJobItemRepository extends JpaRepository<OffboardingJobItem, UUID> {
}
