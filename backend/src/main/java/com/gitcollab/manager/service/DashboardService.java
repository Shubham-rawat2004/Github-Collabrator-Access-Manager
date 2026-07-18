package com.gitcollab.manager.service;

import com.gitcollab.manager.model.SyncJob;
import com.gitcollab.manager.repository.GithubUserRepository;
import com.gitcollab.manager.repository.RepositoryRepository;
import com.gitcollab.manager.repository.SyncJobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private RepositoryRepository repositoryRepository;

    @Autowired
    private GithubUserRepository githubUserRepository;

    @Autowired
    private SyncJobRepository syncJobRepository;

    public Map<String, Object> getDashboardOverview() {
        try {
            long repositories = repositoryRepository.count();
            long collaborators = githubUserRepository.countCollaboratorsWithAccess();
            long mappedUsers = githubUserRepository.countMappedUsersWithAccess();
            long syncJobs = syncJobRepository.count();
            
            List<SyncJob> jobs = syncJobRepository.findTop20ByOrderByCreatedAtDesc();
            SyncJob lastSyncJob = jobs.isEmpty() ? null : jobs.get(0);

            Map<String, Object> overview = new HashMap<>();
            overview.put("repositories", repositories);
            overview.put("collaborators", collaborators);
            overview.put("mappedUsers", mappedUsers);
            overview.put("syncJobs", syncJobs);
            overview.put("lastSyncJob", lastSyncJob);
            overview.put("databaseReady", true);
            overview.put("databaseNotice", null);
            
            return overview;
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("repositories", 0);
            fallback.put("collaborators", 0);
            fallback.put("mappedUsers", 0);
            fallback.put("syncJobs", 0);
            fallback.put("lastSyncJob", null);
            fallback.put("databaseReady", false);
            fallback.put("databaseNotice", "Database unavailable. Start PostgreSQL at localhost:5433 to load live dashboard data.");
            return fallback;
        }
    }
}
