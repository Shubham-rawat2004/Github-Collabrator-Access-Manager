package com.gitcollab.manager.repository;

import com.gitcollab.manager.model.GithubUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GithubUserRepository extends JpaRepository<GithubUser, UUID> {
    
    @Query("SELECT u FROM GithubUser u WHERE LOWER(u.githubUsername) = LOWER(:username)")
    Optional<GithubUser> findByGithubUsernameIgnoreCase(@Param("username") String username);

    @Query("SELECT u FROM GithubUser u WHERE SIZE(u.repositoryAccess) > 0 AND " +
           "(:search = '' OR " +
           "LOWER(u.githubUsername) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(u.employee IS NOT NULL AND (" +
           "LOWER(u.employee.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.employee.email) LIKE LOWER(CONCAT('%', :search, '%'))))) " +
           "ORDER BY u.githubUsername ASC")
    List<GithubUser> searchCollaborators(@Param("search") String search);

    @Query("SELECT COUNT(DISTINCT u.id) FROM GithubUser u WHERE SIZE(u.repositoryAccess) > 0")
    long countCollaboratorsWithAccess();

    @Query("SELECT COUNT(DISTINCT u.id) FROM GithubUser u WHERE u.employee IS NOT NULL AND SIZE(u.repositoryAccess) > 0")
    long countMappedUsersWithAccess();
}

