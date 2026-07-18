package com.gitcollab.manager.repository;

import com.gitcollab.manager.model.RemovalRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface RemovalRequestRepository extends JpaRepository<RemovalRequest, UUID> {
    
    @Query("SELECT r FROM RemovalRequest r ORDER BY r.createdAt DESC")
    List<RemovalRequest> findRecentRemovalRequests(Pageable pageable);
}
