package com.gitcollab.manager.repository;

import com.gitcollab.manager.model.ApprovalRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, UUID> {
    
    @Query("SELECT a FROM ApprovalRequest a ORDER BY a.createdAt DESC")
    List<ApprovalRequest> findRecentApprovalRequests(Pageable pageable);
}
