package com.gitcollab.manager.service;

import com.gitcollab.manager.model.Repository;
import com.gitcollab.manager.model.RepositoryAccess;
import com.gitcollab.manager.model.SyncJob;
import com.gitcollab.manager.repository.GithubUserRepository;
import com.gitcollab.manager.repository.RepositoryAccessRepository;
import com.gitcollab.manager.repository.RepositoryRepository;
import com.gitcollab.manager.repository.SyncJobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class RepositoryService {

    @Autowired
    private RepositoryRepository repositoryRepository;

    @Autowired
    private GithubUserRepository githubUserRepository;

    @Autowired
    private RepositoryAccessRepository repositoryAccessRepository;

    @Autowired
    private SyncJobRepository syncJobRepository;

    public List<Repository> listRepositories(String search, String visibility) {
        String s = search != null ? search.trim() : "";
        String v = visibility != null ? visibility.trim().toLowerCase() : "all";
        return repositoryRepository.searchRepositories(s, v);
    }

    public Map<String, Object> getRepositoryMetrics() {
        long repositoriesCount = repositoryRepository.count();
        long collaboratorsCount = githubUserRepository.count();
        long accessRowsCount = repositoryAccessRepository.count();
        long syncJobsCount = syncJobRepository.count();
        
        List<SyncJob> syncJobs = syncJobRepository.findTop20ByOrderByCreatedAtDesc();
        SyncJob lastSyncJob = syncJobs.isEmpty() ? null : syncJobs.get(0);

        return Map.of(
                "repositories", repositoriesCount,
                "collaborators", collaboratorsCount,
                "accessRows", accessRowsCount,
                "syncJobs", syncJobsCount,
                "lastSyncJob", lastSyncJob != null ? lastSyncJob : Map.of()
        );
    }

    public List<RepositoryAccess> listRepositoryAccess(UUID repositoryId) {
        return repositoryAccessRepository.findByRepository_IdOrderByGithubUser_GithubUsernameAsc(repositoryId);
    }

    public Optional<Repository> getRepositoryById(UUID id) {
        return repositoryRepository.findById(id);
    }

    public Optional<Repository> getRepositoryByIdentifier(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return Optional.empty();
        }

        String idStr = identifier.trim();
        Long numericId = null;
        if (idStr.matches("^\\d+$")) {
            try {
                numericId = Long.parseLong(idStr);
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }

        if (numericId != null) {
            Optional<Repository> byGithubId = repositoryRepository.findByGithubRepoId(numericId);
            if (byGithubId.isPresent()) {
                return byGithubId;
            }
        }

        try {
            UUID uuid = UUID.fromString(idStr);
            return repositoryRepository.findById(uuid);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
