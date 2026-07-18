package com.gitcollab.manager.service;

import com.gitcollab.manager.model.GithubUser;
import com.gitcollab.manager.model.RemovalRequest;
import com.gitcollab.manager.model.RemovalRequestStatus;
import com.gitcollab.manager.repository.GithubUserRepository;
import com.gitcollab.manager.repository.RepositoryAccessRepository;
import com.gitcollab.manager.repository.RemovalRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class OffboardingTransactionService {

    @Autowired
    private RepositoryAccessRepository repositoryAccessRepository;

    @Autowired
    private GithubUserRepository githubUserRepository;

    @Autowired
    private RemovalRequestRepository removalRequestRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteAccessAndDetachUser(UUID repositoryId, UUID githubUserId, UUID removalRequestId, LocalDateTime executedAt) {
        // Delete RepositoryAccess
        repositoryAccessRepository.deleteByRepositoryIdAndGithubUserId(repositoryId, githubUserId);
        repositoryAccessRepository.flush();

        // Detach GitHub User if no repository accesses are left
        long remainingAccessCount = repositoryAccessRepository.countByGithubUser_Id(githubUserId);
        if (remainingAccessCount == 0) {
            GithubUser user = githubUserRepository.findById(githubUserId).orElse(null);
            if (user != null) {
                user.setEmployee(null);
                user.setUpdatedAt(LocalDateTime.now());
                githubUserRepository.saveAndFlush(user);
            }
        }

        // Update RemovalRequest
        if (removalRequestId != null) {
            RemovalRequest request = removalRequestRepository.findById(removalRequestId).orElse(null);
            if (request != null) {
                request.setStatus(RemovalRequestStatus.EXECUTED);
                request.setExecutedAt(executedAt);
                removalRequestRepository.saveAndFlush(request);
            }
        }
    }
}
