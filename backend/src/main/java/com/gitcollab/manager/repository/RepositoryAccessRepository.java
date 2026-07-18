package com.gitcollab.manager.repository;

import com.gitcollab.manager.model.RepositoryAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositoryAccessRepository extends JpaRepository<RepositoryAccess, UUID> {
    
    List<RepositoryAccess> findByRepository_IdOrderByGithubUser_GithubUsernameAsc(UUID repositoryId);

    @Modifying
    @Query("DELETE FROM RepositoryAccess ra WHERE ra.repository.id = :repositoryId")
    void deleteByRepositoryId(@Param("repositoryId") UUID repositoryId);

    @Modifying
    @Query("DELETE FROM RepositoryAccess ra WHERE ra.repository.id = :repositoryId AND ra.githubUser.id = :githubUserId")
    void deleteByRepositoryIdAndGithubUserId(@Param("repositoryId") UUID repositoryId, @Param("githubUserId") UUID githubUserId);

    long countByGithubUser_Id(UUID githubUserId);

}
