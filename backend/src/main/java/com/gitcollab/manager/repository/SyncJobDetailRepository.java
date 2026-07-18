package com.gitcollab.manager.repository;

import com.gitcollab.manager.model.SyncJobDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SyncJobDetailRepository extends JpaRepository<SyncJobDetail, UUID> {
}
