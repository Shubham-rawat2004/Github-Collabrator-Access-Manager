package com.gitcollab.manager.service;

import com.gitcollab.manager.model.*;
import com.gitcollab.manager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class OffboardingService {

    @Autowired
    private OffboardingJobRepository offboardingJobRepository;

    @Autowired
    private OffboardingJobItemRepository offboardingJobItemRepository;

    @Autowired
    private RemovalRequestRepository removalRequestRepository;

    @Autowired
    private BulkOffboardingBatchRepository bulkOffboardingBatchRepository;

    @Autowired
    private BulkOffboardingBatchItemRepository bulkOffboardingBatchItemRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private RepositoryRepository repositoryRepository;

    @Autowired
    private GithubUserRepository githubUserRepository;

    @Autowired
    private RepositoryAccessRepository repositoryAccessRepository;

    @Autowired
    private GitHubClientService gitHubClient;

    @Autowired
    private OffboardingTransactionService offboardingTransactionService;

    @Autowired
    private GovernanceService governanceService;

    @Autowired
    private AuditLogService auditLogService;

    public List<OffboardingJob> listOffboardingJobs() {
        return offboardingJobRepository.findRecentOffboardingJobs(PageRequest.of(0, 50));
    }

    public List<RemovalRequest> listRemovalRequests() {
        return removalRequestRepository.findRecentRemovalRequests(PageRequest.of(0, 50));
    }

    public List<BulkOffboardingBatch> listBulkOffboardingBatches() {
        return bulkOffboardingBatchRepository.findRecentBulkOffboardingBatches(PageRequest.of(0, 50));
    }

    public OffboardingJob createOffboardingJob(UUID employeeId, String requestedBy, String reason) {
        String requester = requestedBy != null ? requestedBy.trim() : "admin";

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found."));

        Map<UUID, Repository> reposById = new HashMap<>();
        List<Map<String, Object>> removalTargets = new ArrayList<>();

        for (GithubUser user : employee.getGithubUsers()) {
            for (RepositoryAccess access : user.getRepositoryAccess()) {
                Repository repo = access.getRepository();
                reposById.put(repo.getId(), repo);

                removalTargets.add(Map.of(
                        "githubUserId", user.getId(),
                        "githubUsername", user.getGithubUsername(),
                        "repositoryId", repo.getId(),
                        "repositoryFullName", repo.getFullName()
                ));
            }
        }

        OffboardingJob job = new OffboardingJob();
        job.setEmployee(employee);
        job.setStatus("PENDING");
        job.setRepositoriesTotal(reposById.size());
        job.setStartedAt(LocalDateTime.now());
        job = offboardingJobRepository.save(job);

        // Create job items
        for (Repository repo : reposById.values()) {
            OffboardingJobItem item = new OffboardingJobItem();
            item.setOffboardingJob(job);
            item.setRepository(repo);
            item.setStatus("PENDING");
            offboardingJobItemRepository.save(item);
        }

        // Create removal requests
        for (Map<String, Object> target : removalTargets) {
            UUID githubUserId = (UUID) target.get("githubUserId");
            UUID repositoryId = (UUID) target.get("repositoryId");

            GithubUser githubUser = githubUserRepository.findById(githubUserId).orElse(null);
            Repository repository = repositoryRepository.findById(repositoryId).orElse(null);

            RemovalRequest request = new RemovalRequest();
            request.setGithubUser(githubUser);
            request.setRepository(repository);
            request.setStatus(RemovalRequestStatus.PENDING);
            request.setRequestedBy(requester);
            request.setReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Offboarding " + employee.getFullName());
            removalRequestRepository.save(request);
        }

        auditLogService.recordAuditEvent(
                "OFFBOARDING_JOB_CREATED",
                "offboarding_jobs",
                job.getId(),
                requester,
                Map.of(
                        "employeeId", employee.getId().toString(),
                        "repositoriesTotal", reposById.size(),
                        "removalTargets", removalTargets.size()
                )
        );

        return job;
    }

    public BulkOffboardingBatch createBulkOffboardingBatch(List<UUID> employeeIds, String requestedBy, String reason) {
        String requester = requestedBy != null ? requestedBy.trim() : "admin";

        List<UUID> uniqueEmployeeIds = employeeIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        if (uniqueEmployeeIds.isEmpty()) {
            throw new RuntimeException("Select at least one employee.");
        }

        List<Employee> employees = employeeRepository.findAllById(uniqueEmployeeIds);
        if (employees.isEmpty()) {
            throw new RuntimeException("No matching employees were found.");
        }

        BulkOffboardingBatch batch = new BulkOffboardingBatch();
        batch.setRequestedBy(requester);
        batch.setReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : null);
        batch.setStatus("PENDING_APPROVAL");
        batch = bulkOffboardingBatchRepository.save(batch);

        for (Employee emp : employees) {
            BulkOffboardingBatchItem item = new BulkOffboardingBatchItem();
            item.setBulkOffboardingBatch(batch);
            item.setEmployee(emp);
            item.setStatus("PENDING");
            bulkOffboardingBatchItemRepository.save(item);
        }

        // Create Governance Approval Request
        ApprovalRequest approvalRequest = governanceService.createApprovalRequest(
                "BULK_OFFBOARDING",
                batch.getId().toString(),
                requester
        );

        batch.setApprovalRequest(approvalRequest);
        batch = bulkOffboardingBatchRepository.save(batch);

        auditLogService.recordAuditEvent(
                "BULK_OFFBOARDING_BATCH_CREATED",
                "bulk_offboarding_batches",
                batch.getId(),
                requester,
                Map.of(
                        "employeeIds", employees.stream().map(e -> e.getId().toString()).collect(Collectors.toList()),
                        "employeeCount", employees.size(),
                        "reason", reason != null ? reason : "",
                        "approvalRequestId", approvalRequest.getId().toString()
                )
        );

        return batch;
    }

    private boolean isGithubNotFoundError(Exception e) {
        return e.getMessage() != null && e.getMessage().toLowerCase().contains("not found");
    }

    private Map<String, String> getOwnerAndRepo(String fullName) {
        String[] parts = fullName.split("/");
        if (parts.length < 2) {
            throw new RuntimeException("Invalid repository full name: " + fullName);
        }
        return Map.of("owner", parts[0], "repo", parts[1]);
    }

    public OffboardingJob executeOffboardingJob(UUID jobId, String executedBy) {
        String executor = executedBy != null ? executedBy.trim() : "admin";

        OffboardingJob job = offboardingJobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Offboarding job not found."));

        if (job.getEmployee() == null) {
            throw new RuntimeException("This offboarding job is not attached to an employee.");
        }

        job.setStatus("EXECUTING");
        job.setStartedAt(LocalDateTime.now());
        job = offboardingJobRepository.saveAndFlush(job);

        Employee employee = job.getEmployee();
        int repositoriesProcessed = 0;
        int repositoriesFailed = 0;

        for (OffboardingJobItem item : job.getItems()) {
            if (item.getRepository() == null) {
                repositoriesFailed++;
                item.setStatus("FAILED");
                item.setErrorMessage("Repository data is missing for this job item.");
                offboardingJobItemRepository.save(item);
                continue;
            }

            Repository repository = item.getRepository();

            // Find all accesses for the employee's github users in this repository
            List<RepositoryAccess> accesses = new ArrayList<>();
            for (GithubUser user : employee.getGithubUsers()) {
                for (RepositoryAccess access : user.getRepositoryAccess()) {
                    if (access.getRepository().getId().equals(repository.getId())) {
                        accesses.add(access);
                    }
                }
            }

            if (accesses.isEmpty()) {
                item.setStatus("SUCCESS");
                offboardingJobItemRepository.save(item);
                repositoriesProcessed++;
                continue;
            }

            boolean itemFailed = false;

            for (RepositoryAccess access : accesses) {
                GithubUser githubUser = access.getGithubUser();
                
                try {
                    // Update corresponding RemovalRequest to EXECUTING
                    List<RemovalRequest> pendingRequests = removalRequestRepository.findAll().stream()
                            .filter(r -> r.getGithubUser() != null && r.getGithubUser().getId().equals(githubUser.getId()) &&
                                         r.getRepository() != null && r.getRepository().getId().equals(repository.getId()) &&
                                         r.getStatus() == RemovalRequestStatus.PENDING)
                            .collect(Collectors.toList());

                    for (RemovalRequest r : pendingRequests) {
                        r.setStatus(RemovalRequestStatus.EXECUTING);
                        removalRequestRepository.save(r);
                    }

                    // Remove collaborator
                    Map<String, String> nameParts = getOwnerAndRepo(repository.getFullName());
                    gitHubClient.removeCollaborator(nameParts.get("owner"), nameParts.get("repo"), githubUser.getGithubUsername());

                    // Execute database updates in isolated transaction
                    offboardingTransactionService.deleteAccessAndDetachUser(
                            repository.getId(),
                            githubUser.getId(),
                            null,
                            LocalDateTime.now()
                    );

                    for (RemovalRequest r : pendingRequests) {
                        r.setStatus(RemovalRequestStatus.EXECUTED);
                        r.setExecutedAt(LocalDateTime.now());
                        removalRequestRepository.save(r);
                    }

                } catch (Exception e) {
                    if (isGithubNotFoundError(e)) {
                        // Success pathway: collaborator already removed from repo
                        List<RemovalRequest> pendingRequests = removalRequestRepository.findAll().stream()
                                .filter(r -> r.getGithubUser() != null && r.getGithubUser().getId().equals(githubUser.getId()) &&
                                             r.getRepository() != null && r.getRepository().getId().equals(repository.getId()) &&
                                             (r.getStatus() == RemovalRequestStatus.PENDING || r.getStatus() == RemovalRequestStatus.EXECUTING))
                                .collect(Collectors.toList());

                        offboardingTransactionService.deleteAccessAndDetachUser(
                                repository.getId(),
                                githubUser.getId(),
                                null,
                                LocalDateTime.now()
                        );

                        for (RemovalRequest r : pendingRequests) {
                            r.setStatus(RemovalRequestStatus.EXECUTED);
                            r.setExecutedAt(LocalDateTime.now());
                            removalRequestRepository.save(r);
                        }
                        continue;
                    }

                    itemFailed = true;

                    // Update corresponding RemovalRequest to FAILED
                    List<RemovalRequest> pendingRequests = removalRequestRepository.findAll().stream()
                            .filter(r -> r.getGithubUser() != null && r.getGithubUser().getId().equals(githubUser.getId()) &&
                                         r.getRepository() != null && r.getRepository().getId().equals(repository.getId()) &&
                                         (r.getStatus() == RemovalRequestStatus.PENDING || r.getStatus() == RemovalRequestStatus.EXECUTING))
                            .collect(Collectors.toList());

                    for (RemovalRequest r : pendingRequests) {
                        r.setStatus(RemovalRequestStatus.FAILED);
                        removalRequestRepository.save(r);
                    }

                    item.setStatus("FAILED");
                    item.setErrorMessage(e.getMessage());
                    offboardingJobItemRepository.save(item);

                    auditLogService.recordAuditEvent(
                            "REMOVAL_REQUEST_FAILED",
                            "removal_requests",
                            pendingRequests.isEmpty() ? null : pendingRequests.get(0).getId(),
                            executor,
                            Map.of(
                                    "githubUserId", githubUser.getId().toString(),
                                    "repositoryId", repository.getId().toString(),
                                    "error", e.getMessage()
                            )
                    );
                }
            }

            if (!itemFailed) {
                item.setStatus("SUCCESS");
                item.setErrorMessage(null);
                offboardingJobItemRepository.save(item);
                repositoriesProcessed++;
            } else {
                repositoriesFailed++;
            }
        }

        String finalizedStatus = repositoriesFailed > 0 ? (repositoriesProcessed > 0 ? "PARTIAL_SUCCESS" : "FAILED") : "EXECUTED";
        
        job.setStatus(finalizedStatus);
        job.setCompletedAt(LocalDateTime.now());
        job.setRepositoriesProcessed(repositoriesProcessed);
        job.setRepositoriesFailed(repositoriesFailed);
        job = offboardingJobRepository.save(job);

        auditLogService.recordAuditEvent(
                "EXECUTED".equalsIgnoreCase(finalizedStatus) ? "OFFBOARDING_JOB_EXECUTED" : "OFFBOARDING_JOB_PARTIAL_FAILURE",
                "offboarding_jobs",
                job.getId(),
                executor,
                Map.of(
                        "employeeId", employee.getId().toString(),
                        "repositoriesProcessed", repositoriesProcessed,
                        "repositoriesFailed", repositoriesFailed,
                        "status", finalizedStatus
                )
        );

        return job;
    }

    public BulkOffboardingBatch executeBulkOffboardingBatch(UUID batchId, String executedBy) {
        String executor = executedBy != null ? executedBy.trim() : "admin";

        BulkOffboardingBatch batch = bulkOffboardingBatchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Bulk offboarding batch not found."));

        if ("EXECUTED".equalsIgnoreCase(batch.getStatus())) {
            return batch;
        }

        batch.setStatus("EXECUTING");
        batch.setExecutedBy(executor);
        batch = bulkOffboardingBatchRepository.saveAndFlush(batch);

        int succeeded = 0;
        int failed = 0;

        for (BulkOffboardingBatchItem item : batch.getItems()) {
            if (item.getEmployee() == null) {
                failed++;
                item.setStatus("FAILED");
                item.setErrorMessage("Employee data is missing for this batch item.");
                bulkOffboardingBatchItemRepository.save(item);
                continue;
            }

            try {
                // Create individual offboarding job
                OffboardingJob offboardingJob = createOffboardingJob(item.getEmployee().getId(), executor, batch.getReason());
                
                // Execute job
                OffboardingJob executedJob = executeOffboardingJob(offboardingJob.getId(), executor);

                item.setStatus(executedJob.getStatus());
                item.setOffboardingJob(executedJob);
                item.setErrorMessage("EXECUTED".equalsIgnoreCase(executedJob.getStatus()) ? null : executedJob.getStatus());
                bulkOffboardingBatchItemRepository.save(item);

                if ("EXECUTED".equalsIgnoreCase(executedJob.getStatus())) {
                    succeeded++;
                } else {
                    failed++;
                }
            } catch (Exception e) {
                failed++;
                item.setStatus("FAILED");
                item.setErrorMessage(e.getMessage());
                bulkOffboardingBatchItemRepository.save(item);
            }
        }

        String finalizedStatus = failed > 0 ? (succeeded > 0 ? "PARTIAL_SUCCESS" : "FAILED") : "EXECUTED";
        batch.setStatus(finalizedStatus);
        batch.setExecutedAt(LocalDateTime.now());
        batch.setExecutedBy(executor);
        batch = bulkOffboardingBatchRepository.save(batch);

        auditLogService.recordAuditEvent(
                "EXECUTED".equalsIgnoreCase(finalizedStatus) ? "BULK_OFFBOARDING_BATCH_EXECUTED" : "BULK_OFFBOARDING_BATCH_PARTIAL_FAILURE",
                "bulk_offboarding_batches",
                batch.getId(),
                executor,
                Map.of(
                        "approvalRequestId", batch.getApprovalRequest() != null ? batch.getApprovalRequest().getId().toString() : "",
                        "succeeded", succeeded,
                        "failed", failed,
                        "status", finalizedStatus
                )
        );

        return batch;
    }

    public RemovalRequest createRemovalRequest(UUID githubUserId, UUID repositoryId, String requestedBy, String reason) {
        String requester = requestedBy != null ? requestedBy.trim() : "admin";

        GithubUser githubUser = githubUserRepository.findById(githubUserId)
                .orElseThrow(() -> new RuntimeException("Github user not found."));

        Repository repository = repositoryRepository.findById(repositoryId)
                .orElseThrow(() -> new RuntimeException("Repository not found."));

        RemovalRequest request = new RemovalRequest();
        request.setGithubUser(githubUser);
        request.setRepository(repository);
        request.setStatus(RemovalRequestStatus.PENDING);
        request.setRequestedBy(requester);
        request.setReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : null);
        request = removalRequestRepository.save(request);

        auditLogService.recordAuditEvent(
                "REMOVAL_REQUEST_CREATED",
                "removal_requests",
                request.getId(),
                requester,
                Map.of(
                        "githubUserId", githubUser.getId().toString(),
                        "repositoryId", repository.getId().toString(),
                        "reason", reason != null ? reason : ""
                )
        );

        return request;
    }

    public RemovalRequest executeRemovalRequest(UUID removalRequestId, String executedBy) {
        String executor = executedBy != null ? executedBy.trim() : "admin";

        RemovalRequest request = removalRequestRepository.findById(removalRequestId)
                .orElseThrow(() -> new RuntimeException("Removal request not found."));

        if (request.getGithubUser() == null || request.getRepository() == null) {
            throw new RuntimeException("Removal request is missing GitHub user or repository data.");
        }

        GithubUser githubUser = request.getGithubUser();
        Repository repository = request.getRepository();

        request.setStatus(RemovalRequestStatus.EXECUTING);
        removalRequestRepository.saveAndFlush(request);

        try {
            Map<String, String> nameParts = getOwnerAndRepo(repository.getFullName());
            gitHubClient.removeCollaborator(nameParts.get("owner"), nameParts.get("repo"), githubUser.getGithubUsername());

            offboardingTransactionService.deleteAccessAndDetachUser(
                    repository.getId(),
                    githubUser.getId(),
                    null,
                    LocalDateTime.now()
            );

            request.setStatus(RemovalRequestStatus.EXECUTED);
            request.setExecutedAt(LocalDateTime.now());
            removalRequestRepository.save(request);

            auditLogService.recordAuditEvent(
                    "REMOVAL_REQUEST_EXECUTED",
                    "removal_requests",
                    request.getId(),
                    executor,
                    Map.of(
                            "githubUserId", githubUser.getId().toString(),
                            "repositoryId", repository.getId().toString()
                    )
            );

        } catch (Exception e) {
            if (isGithubNotFoundError(e)) {
                offboardingTransactionService.deleteAccessAndDetachUser(
                        repository.getId(),
                        githubUser.getId(),
                        null,
                        LocalDateTime.now()
                );

                request.setStatus(RemovalRequestStatus.EXECUTED);
                request.setExecutedAt(LocalDateTime.now());
                removalRequestRepository.save(request);

                auditLogService.recordAuditEvent(
                        "REMOVAL_REQUEST_EXECUTED",
                        "removal_requests",
                        request.getId(),
                        executor,
                        Map.of(
                                "githubUserId", githubUser.getId().toString(),
                                "repositoryId", repository.getId().toString(),
                                "alreadyRemoved", true
                        )
                );

                return removalRequestRepository.findById(removalRequestId).orElse(request);
            }

            request.setStatus(RemovalRequestStatus.FAILED);
            removalRequestRepository.save(request);

            auditLogService.recordAuditEvent(
                    "REMOVAL_REQUEST_FAILED",
                    "removal_requests",
                    request.getId(),
                    executor,
                    Map.of(
                            "githubUserId", githubUser.getId().toString(),
                            "repositoryId", repository.getId().toString(),
                            "error", e.getMessage()
                    )
            );

            throw new RuntimeException(e);
        }

        return removalRequestRepository.findById(removalRequestId).orElse(request);
    }

    public Map<String, Object> removeEmployeeAccess(UUID employeeId, String executedBy) {
        String executor = executedBy != null ? executedBy.trim() : "admin";

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found."));

        Map<UUID, Map<String, Object>> repoTargets = new HashMap<>();

        for (GithubUser user : employee.getGithubUsers()) {
            for (RepositoryAccess access : user.getRepositoryAccess()) {
                Repository repo = access.getRepository();
                
                Map<String, Object> target = repoTargets.computeIfAbsent(repo.getId(), k -> new HashMap<>(Map.of(
                        "repositoryId", repo.getId(),
                        "repositoryName", repo.getName(),
                        "repositoryFullName", repo.getFullName(),
                        "accesses", new ArrayList<Map<String, String>>()
                )));

                List<Map<String, String>> accessesList = (List<Map<String, String>>) target.get("accesses");
                accessesList.add(Map.of(
                        "githubUserId", user.getId().toString(),
                        "githubUsername", user.getGithubUsername()
                ));
            }
        }

        if (repoTargets.isEmpty()) {
            return Map.of(
                    "employeeId", employee.getId().toString(),
                    "employeeName", employee.getFullName(),
                    "removed", 0,
                    "failed", 0,
                    "alreadyClear", true,
                    "repositoryResults", List.of()
            );
        }

        List<Map<String, Object>> repositoryResults = new ArrayList<>();
        int removed = 0;
        int failed = 0;

        for (Map<String, Object> target : repoTargets.values()) {
            UUID repoId = (UUID) target.get("repositoryId");
            String repoName = String.valueOf(target.get("repositoryName"));
            String repoFullName = String.valueOf(target.get("repositoryFullName"));
            List<Map<String, String>> accessesList = (List<Map<String, String>>) target.get("accesses");

            int succeededForRepo = 0;
            int failedForRepo = 0;
            String lastError = null;

            Map<String, String> nameParts = getOwnerAndRepo(repoFullName);

            for (Map<String, String> access : accessesList) {
                UUID gUserId = UUID.fromString(access.get("githubUserId"));
                String username = access.get("githubUsername");

                try {
                    gitHubClient.removeCollaborator(nameParts.get("owner"), nameParts.get("repo"), username);
                } catch (Exception e) {
                    if (!isGithubNotFoundError(e)) {
                        failedForRepo++;
                        lastError = e.getMessage();
                        continue;
                    }
                }

                try {
                    offboardingTransactionService.deleteAccessAndDetachUser(
                            repoId,
                            gUserId,
                            null,
                            LocalDateTime.now()
                    );
                    succeededForRepo++;
                } catch (Exception e) {
                    failedForRepo++;
                    lastError = e.getMessage();
                }
            }

            if (failedForRepo == 0) {
                removed++;
                repositoryResults.add(Map.of(
                        "repositoryId", repoId.toString(),
                        "repositoryName", repoName,
                        "repositoryFullName", repoFullName,
                        "status", "SUCCESS",
                        "errorMessage", ""
                ));
            } else {
                failed++;
                repositoryResults.add(Map.of(
                        "repositoryId", repoId.toString(),
                        "repositoryName", repoName,
                        "repositoryFullName", repoFullName,
                        "status", succeededForRepo > 0 ? "PARTIAL_SUCCESS" : "FAILED",
                        "errorMessage", lastError != null ? lastError : "Unknown error"
                ));
            }
        }

        auditLogService.recordAuditEvent(
                failed > 0 ? "EMPLOYEE_ACCESS_REMOVAL_PARTIAL_FAILURE" : "EMPLOYEE_ACCESS_REMOVED",
                "employees",
                employee.getId(),
                executor,
                Map.of(
                        "employeeId", employee.getId().toString(),
                        "employeeName", employee.getFullName(),
                        "removed", removed,
                        "failed", failed,
                        "repositoryResults", repositoryResults
                )
        );

        return Map.of(
                "employeeId", employee.getId().toString(),
                "employeeName", employee.getFullName(),
                "removed", removed,
                "failed", failed,
                "repositoryResults", repositoryResults
        );
    }

    public Map<String, Object> removeCollaboratorsFromRepository(UUID repositoryId, List<UUID> githubUserIds, String executedBy) {
        String executor = executedBy != null ? executedBy.trim() : "admin";

        Repository repository = repositoryRepository.findById(repositoryId)
                .orElseThrow(() -> new RuntimeException("Repository not found."));

        Map<String, String> nameParts = getOwnerAndRepo(repository.getFullName());
        int removed = 0;
        int failed = 0;
        List<Map<String, Object>> results = new ArrayList<>();

        for (UUID githubUserId : githubUserIds) {
            Optional<GithubUser> userOpt = githubUserRepository.findById(githubUserId);
            if (userOpt.isEmpty()) {
                failed++;
                results.add(Map.of("githubUserId", githubUserId.toString(), "status", "FAILED", "error", "User not found"));
                continue;
            }

            GithubUser githubUser = userOpt.get();

            try {
                gitHubClient.removeCollaborator(nameParts.get("owner"), nameParts.get("repo"), githubUser.getGithubUsername());
            } catch (Exception e) {
                if (!isGithubNotFoundError(e)) {
                    failed++;
                    results.add(Map.of("githubUserId", githubUserId.toString(), "status", "FAILED", "error", e.getMessage()));
                    continue;
                }
            }

            try {
                offboardingTransactionService.deleteAccessAndDetachUser(
                        repository.getId(),
                        githubUser.getId(),
                        null,
                        LocalDateTime.now()
                );
                removed++;
                results.add(Map.of("githubUserId", githubUserId.toString(), "status", "SUCCESS", "username", githubUser.getGithubUsername()));
            } catch (Exception e) {
                failed++;
                results.add(Map.of("githubUserId", githubUserId.toString(), "status", "FAILED", "error", e.getMessage()));
            }
        }

        auditLogService.recordAuditEvent(
                "COLLABORATORS_REMOVED_FROM_REPOSITORY",
                "repositories",
                repository.getId(),
                executor,
                Map.of(
                        "repositoryId", repository.getId().toString(),
                        "repositoryName", repository.getName(),
                        "removed", removed,
                        "failed", failed,
                        "results", results
                )
        );

        return Map.of(
                "repositoryName", repository.getName(),
                "removed", removed,
                "failed", failed,
                "results", results
        );
    }

    public Map<String, Object> removeCollaboratorFromAllRepos(UUID githubUserId, String executedBy) {
        String executor = executedBy != null ? executedBy.trim() : "admin";

        GithubUser githubUser = githubUserRepository.findById(githubUserId)
                .orElseThrow(() -> new RuntimeException("Collaborator not found."));

        int removed = 0;
        int failed = 0;
        List<Map<String, Object>> repositoryResults = new ArrayList<>();

        for (RepositoryAccess access : githubUser.getRepositoryAccess()) {
            Repository repository = access.getRepository();
            Map<String, String> nameParts = getOwnerAndRepo(repository.getFullName());

            try {
                gitHubClient.removeCollaborator(nameParts.get("owner"), nameParts.get("repo"), githubUser.getGithubUsername());
            } catch (Exception e) {
                if (!isGithubNotFoundError(e)) {
                    failed++;
                    repositoryResults.add(Map.of(
                            "repositoryId", repository.getId().toString(),
                            "repositoryName", repository.getName(),
                            "repositoryFullName", repository.getFullName(),
                            "status", "FAILED",
                            "errorMessage", e.getMessage()
                    ));
                    continue;
                }
            }

            try {
                offboardingTransactionService.deleteAccessAndDetachUser(
                        repository.getId(),
                        githubUser.getId(),
                        null,
                        LocalDateTime.now()
                );
                removed++;
                repositoryResults.add(Map.of(
                        "repositoryId", repository.getId().toString(),
                        "repositoryName", repository.getName(),
                        "repositoryFullName", repository.getFullName(),
                        "status", "SUCCESS",
                        "errorMessage", ""
                ));
            } catch (Exception e) {
                failed++;
                repositoryResults.add(Map.of(
                        "repositoryId", repository.getId().toString(),
                        "repositoryName", repository.getName(),
                        "repositoryFullName", repository.getFullName(),
                        "status", "FAILED",
                        "errorMessage", e.getMessage()
                ));
            }
        }

        auditLogService.recordAuditEvent(
                "COLLABORATOR_REMOVED_FROM_ALL_REPOS",
                "collaborators",
                githubUserId,
                executor,
                Map.of(
                        "githubUserId", githubUserId.toString(),
                        "githubUsername", githubUser.getGithubUsername(),
                        "removed", removed,
                        "failed", failed,
                        "repositoryResults", repositoryResults
                )
        );

        return Map.of(
                "githubUsername", githubUser.getGithubUsername(),
                "removed", removed,
                "failed", failed,
                "repositoryResults", repositoryResults
        );
    }
}
