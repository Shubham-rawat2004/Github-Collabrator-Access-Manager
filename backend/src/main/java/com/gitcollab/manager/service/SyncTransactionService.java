package com.gitcollab.manager.service;

import com.gitcollab.manager.model.GithubUser;
import com.gitcollab.manager.model.Repository;
import com.gitcollab.manager.model.RepositoryAccess;
import com.gitcollab.manager.model.SyncJob;
import com.gitcollab.manager.model.SyncJobDetail;
import com.gitcollab.manager.repository.GithubUserRepository;
import com.gitcollab.manager.repository.RepositoryAccessRepository;
import com.gitcollab.manager.repository.RepositoryRepository;
import com.gitcollab.manager.repository.SyncJobDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SyncTransactionService {

    @Autowired
    private RepositoryRepository repositoryRepository;

    @Autowired
    private RepositoryAccessRepository repositoryAccessRepository;

    @Autowired
    private GithubUserRepository githubUserRepository;

    @Autowired
    private SyncJobDetailRepository syncJobDetailRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void syncRepositoryData(SyncJob syncJob, Map<String, Object> repoData, List<Map<String, Object>> collaboratorSnapshots) {
        Long githubRepoId = ((Number) repoData.get("id")).longValue();
        String name = String.valueOf(repoData.get("name"));
        String fullName = String.valueOf(repoData.get("full_name"));
        String description = repoData.get("description") != null ? String.valueOf(repoData.get("description")) : null;
        
        String homepage = repoData.get("homepage") != null ? String.valueOf(repoData.get("homepage")) : null;
        String liveUrl = (homepage != null && !homepage.trim().isEmpty()) ? homepage.trim() : null;
        
        String visibility = String.valueOf(repoData.get("visibility"));
        String defaultBranch = repoData.get("default_branch") != null ? String.valueOf(repoData.get("default_branch")) : null;
        boolean archived = Boolean.TRUE.equals(repoData.get("archived"));

        // Upsert Repository
        Repository repository = repositoryRepository.findByGithubRepoId(githubRepoId)
                .orElse(new Repository());
        
        repository.setGithubRepoId(githubRepoId);
        repository.setName(name);
        repository.setFullName(fullName);
        repository.setDescription(description);
        repository.setLiveUrl(liveUrl);
        repository.setVisibility(visibility);
        repository.setDefaultBranch(defaultBranch);
        repository.setArchived(archived);
        repository.setIsActive(true);
        repository.setLastSyncedAt(LocalDateTime.now());
        
        repository = repositoryRepository.saveAndFlush(repository);

        // Delete existing access rows for this repo
        repositoryAccessRepository.deleteByRepositoryId(repository.getId());
        repositoryAccessRepository.flush();

        // Process collaborator access
        for (Map<String, Object> snapshot : collaboratorSnapshots) {
            Map<String, Object> collaborator = (Map<String, Object>) snapshot.get("collaborator");
            String permission = String.valueOf(snapshot.get("permission"));

            if ("none".equalsIgnoreCase(permission)) {
                continue;
            }

            Long githubUserId = ((Number) collaborator.get("id")).longValue();
            String login = String.valueOf(collaborator.get("login"));
            String htmlUrl = String.valueOf(collaborator.get("html_url"));

            // Upsert GitHub User
            GithubUser githubUser = githubUserRepository.findByGithubUsernameIgnoreCase(login)
                    .orElse(new GithubUser());
            
            githubUser.setGithubId(githubUserId);
            githubUser.setGithubUsername(login);
            githubUser.setGithubProfileUrl(htmlUrl);
            githubUser = githubUserRepository.saveAndFlush(githubUser);

            // Create RepositoryAccess
            RepositoryAccess access = new RepositoryAccess();
            access.setRepository(repository);
            access.setGithubUser(githubUser);
            access.setPermission(permission);
            access.setSource("direct");
            access.setSyncedAt(LocalDateTime.now());
            repositoryAccessRepository.save(access);
        }

        // Create SyncJobDetail
        SyncJobDetail detail = new SyncJobDetail();
        detail.setSyncJob(syncJob);
        detail.setRepository(repository);
        detail.setStatus("SUCCESS");
        syncJobDetailRepository.save(detail);
    }
}
