package com.gitcollab.manager.service;

import com.gitcollab.manager.model.*;
import com.gitcollab.manager.repository.RepositoryRepository;
import com.gitcollab.manager.repository.SyncJobDetailRepository;
import com.gitcollab.manager.repository.SyncJobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SyncService {

    @Autowired
    private SyncJobRepository syncJobRepository;

    @Autowired
    private SyncJobDetailRepository syncJobDetailRepository;

    @Autowired
    private RepositoryRepository repositoryRepository;

    @Autowired
    private GitHubClientService gitHubClient;

    @Autowired
    private SyncTransactionService syncTransactionService;

    @Autowired
    private AuditLogService auditLogService;

    public List<SyncJob> getSyncJobs() {
        return syncJobRepository.findTop20ByOrderByCreatedAtDesc();
    }

    public Map<String, Object> runSync(String initiatedBy) {
        String user = (initiatedBy != null && !initiatedBy.trim().isEmpty()) ? initiatedBy.trim() : "admin";

        // Check if there is already a running sync
        Optional<SyncJob> runningJob = syncJobRepository.findFirstByStatus(SyncJobStatus.RUNNING);
        if (runningJob.isPresent()) {
            throw new RuntimeException("A sync is already in progress.");
        }

        // Initialize sync job
        SyncJob syncJob = new SyncJob();
        syncJob.setInitiatedBy(user);
        syncJob.setStartedAt(LocalDateTime.now());
        syncJob.setStatus(SyncJobStatus.RUNNING);
        syncJob = syncJobRepository.save(syncJob);

        auditLogService.recordAuditEvent(
                "SYNC_STARTED",
                "sync_jobs",
                syncJob.getId(),
                user,
                Map.of()
        );

        int repositoriesScanned = 0;
        int collaboratorsFound = 0;
        int errorCount = 0;
        boolean hasPartialFailure = false;
        
        List<Map<String, Object>> fetchedRepos = List.of();
        try {
            fetchedRepos = gitHubClient.getRepositories();
        } catch (Exception e) {
            hasPartialFailure = true;
            errorCount++;
            syncJob.setStatus(SyncJobStatus.FAILED);
            syncJob.setCompletedAt(LocalDateTime.now());
            syncJob.setErrorCount(errorCount);
            syncJob.setErrorMessage("GitHub repository fetching failed: " + e.getMessage());
            syncJobRepository.save(syncJob);

            auditLogService.recordAuditEvent(
                    "SYNC_FAILED",
                    "sync_jobs",
                    syncJob.getId(),
                    user,
                    Map.of("error", e.getMessage(), "status", "FAILED")
            );

            return Map.of(
                    "success", false,
                    "repositoriesProcessed", 0,
                    "collaboratorsProcessed", 0,
                    "errors", 1,
                    "status", "FAILED"
            );
        }

        Set<Long> seenGithubRepoIds = new HashSet<>();

        for (Map<String, Object> repo : fetchedRepos) {
            repositoriesScanned++;
            Long githubRepoId = ((Number) repo.get("id")).longValue();
            seenGithubRepoIds.add(githubRepoId);

            String name = String.valueOf(repo.get("name"));
            Map<String, Object> ownerMap = (Map<String, Object>) repo.get("owner");
            String ownerLogin = String.valueOf(ownerMap.get("login"));

            try {
                // Fetch collaborators
                List<Map<String, Object>> collaborators = gitHubClient.getCollaborators(ownerLogin, name);
                collaboratorsFound += collaborators.size();

                List<Map<String, Object>> collaboratorSnapshots = new ArrayList<>();
                for (Map<String, Object> collaborator : collaborators) {
                    String username = String.valueOf(collaborator.get("login"));
                    String permission = gitHubClient.getCollaboratorPermission(ownerLogin, name, username);
                    collaboratorSnapshots.add(Map.of(
                            "collaborator", collaborator,
                            "permission", permission
                    ));
                }

                // Call the transaction service to handle database upserts in isolated transactions
                syncTransactionService.syncRepositoryData(syncJob, repo, collaboratorSnapshots);

            } catch (Exception e) {
                hasPartialFailure = true;
                errorCount++;

                // Log the fail detail
                SyncJobDetail failDetail = new SyncJobDetail();
                failDetail.setSyncJob(syncJob);
                failDetail.setStatus("FAILED");
                failDetail.setErrorMessage(e.getMessage());
                syncJobDetailRepository.save(failDetail);
            }
        }

        // Process missing repositories
        try {
            List<Repository> allRepos = repositoryRepository.findAll();
            List<Repository> missingRepos = allRepos.stream()
                    .filter(r -> r.getGithubRepoId() != null && !seenGithubRepoIds.contains(r.getGithubRepoId()))
                    .collect(Collectors.toList());

            if (!missingRepos.isEmpty()) {
                for (Repository r : missingRepos) {
                    r.setIsActive(false);
                }
                repositoryRepository.saveAll(missingRepos);
            }
        } catch (Exception e) {
            System.err.println("Error marking missing repositories inactive: " + e.getMessage());
        }

        SyncJobStatus finalizedStatus;
        if (hasPartialFailure) {
            finalizedStatus = repositoriesScanned > 0 ? SyncJobStatus.PARTIAL_SUCCESS : SyncJobStatus.FAILED;
        } else {
            finalizedStatus = SyncJobStatus.SUCCESS;
        }

        syncJob.setCompletedAt(LocalDateTime.now());
        syncJob.setStatus(finalizedStatus);
        syncJob.setRepositoriesScanned(repositoriesScanned);
        syncJob.setCollaboratorsFound(collaboratorsFound);
        syncJob.setErrorCount(errorCount);
        syncJob.setErrorMessage(errorCount > 0 ? "One or more repositories failed during sync." : null);
        syncJobRepository.save(syncJob);

        auditLogService.recordAuditEvent(
                finalizedStatus == SyncJobStatus.SUCCESS ? "SYNC_COMPLETED" : "SYNC_FAILED",
                "sync_jobs",
                syncJob.getId(),
                user,
                Map.of(
                        "repositoriesScanned", repositoriesScanned,
                        "collaboratorsFound", collaboratorsFound,
                        "errorCount", errorCount,
                        "status", finalizedStatus.toString()
                )
        );

        return Map.of(
                "success", finalizedStatus == SyncJobStatus.SUCCESS,
                "repositoriesProcessed", repositoriesScanned,
                "collaboratorsProcessed", collaboratorsFound,
                "errors", errorCount,
                "status", finalizedStatus.toString()
        );
    }
}
