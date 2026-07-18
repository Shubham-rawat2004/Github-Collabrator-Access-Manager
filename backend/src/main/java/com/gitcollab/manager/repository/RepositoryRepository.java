package com.gitcollab.manager.repository;

import com.gitcollab.manager.model.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositoryRepository extends JpaRepository<Repository, UUID> {
    
    Optional<Repository> findByGithubRepoId(Long githubRepoId);

    @Query("SELECT r FROM Repository r WHERE " +
           "(:search = '' OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:visibility = 'all' OR LOWER(r.visibility) = LOWER(:visibility)) " +
           "ORDER BY r.isActive DESC, r.updatedAt DESC")
    List<Repository> searchRepositories(@Param("search") String search, @Param("visibility") String visibility);

    @Query("SELECT r FROM Repository r WHERE r.id = :id OR r.githubRepoId = :githubRepoId")
    Optional<Repository> findByIdOrGithubRepoId(@Param("id") UUID id, @Param("githubRepoId") Long githubRepoId);
}
