package com.gitcollab.manager;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gitcollab.manager.model.*;
import com.gitcollab.manager.repository.*;
import com.gitcollab.manager.service.GitHubClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;
import java.util.*;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = OnboardingApplication.class)
@AutoConfigureMockMvc
public class OnboardingWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GitHubClientService gitHubClient;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private GithubUserRepository githubUserRepository;

    @Autowired
    private RepositoryRepository repositoryRepository;

    @Autowired
    private RepositoryAccessRepository repositoryAccessRepository;

    @Autowired
    private SyncJobRepository syncJobRepository;

    @Autowired
    private SyncJobDetailRepository syncJobDetailRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private RemovalRequestRepository removalRequestRepository;

    @Autowired
    private OffboardingJobRepository offboardingJobRepository;

    @Autowired
    private OffboardingJobItemRepository offboardingJobItemRepository;

    @Autowired
    private ApprovalRequestRepository approvalRequestRepository;

    @Autowired
    private BulkOffboardingBatchRepository bulkOffboardingBatchRepository;

    @Autowired
    private BulkOffboardingBatchItemRepository bulkOffboardingBatchItemRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @BeforeEach
    public void setup() throws Exception {
        // Clear database tables before each test
        jdbcTemplate.execute("TRUNCATE TABLE bulk_offboarding_batch_items, bulk_offboarding_batches, approval_requests, offboarding_job_items, offboarding_jobs, removal_requests, repository_access, github_users, repositories, sync_job_details, sync_jobs, employees, audit_logs CASCADE");


        // Setup mock behaviors for GitHub Client
        Map<String, Object> mockRepo = Map.of(
                "id", 12345,
                "name", "test-repo",
                "full_name", "owner/test-repo",
                "description", "A mock repository for testing",
                "homepage", "https://mock.live",
                "visibility", "public",
                "default_branch", "main",
                "archived", false,
                "owner", Map.of("login", "owner")
        );

        Map<String, Object> mockCollaborator = Map.of(
                "id", 98765,
                "login", "collaborator1",
                "html_url", "https://github.com/collaborator1"
        );

        Mockito.when(gitHubClient.getRepositories()).thenReturn(List.of(mockRepo));
        Mockito.when(gitHubClient.getCollaborators("owner", "test-repo")).thenReturn(List.of(mockCollaborator));
        Mockito.when(gitHubClient.getCollaboratorPermission("owner", "test-repo", "collaborator1")).thenReturn("write");
        Mockito.when(gitHubClient.getRepository("owner", "test-repo")).thenReturn(Map.of(
                "permissions", Map.of("admin", true)
        ));
        Mockito.when(gitHubClient.getAuthenticatedUser()).thenReturn(Map.of("login", "admin"));
    }

    @Test
    public void testHealthCheck() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok", is(true)))
                .andExpect(jsonPath("$.service", is("git-collabration")));
    }

    @Test
    public void testEnd2EndWorkflow() throws Exception {
        // 1. Sync repositories from GitHub
        mockMvc.perform(post("/api/sync")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("initiatedBy", "test-runner"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.repositoriesProcessed", is(1)))
                .andExpect(jsonPath("$.collaboratorsProcessed", is(1)))
                .andExpect(jsonPath("$.status", is("SUCCESS")));

        // Verify Repository was saved in DB
        List<Repository> repos = repositoryRepository.findAll();
        assertEquals(1, repos.size());
        assertEquals("test-repo", repos.get(0).getName());
        assertEquals("owner/test-repo", repos.get(0).getFullName());
        assertTrue(repos.get(0).getIsActive());

        // Verify GithubUser was saved in DB
        List<GithubUser> users = githubUserRepository.findAll();
        assertEquals(1, users.size());
        assertEquals("collaborator1", users.get(0).getGithubUsername());

        // Verify RepositoryAccess mapping in DB
        List<RepositoryAccess> accesses = repositoryAccessRepository.findAll();
        assertEquals(1, accesses.size());
        assertEquals("write", accesses.get(0).getPermission());

        // 2. Create an Employee
        String empPayload = objectMapper.writeValueAsString(Map.of(
                "fullName", "Shubham Rawat",
                "email", "shubham@example.com"
        ));

        String employeeJson = mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(empPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employee.fullName", is("Shubham Rawat")))
                .andExpect(jsonPath("$.employee.email", is("shubham@example.com")))
                .andReturn().getResponse().getContentAsString();

        Map<String, Object> empResult = objectMapper.readValue(employeeJson, Map.class);
        Map<String, Object> employeeMap = (Map<String, Object>) empResult.get("employee");
        String employeeId = String.valueOf(employeeMap.get("id"));

        // 3. Map GithubUser to Employee
        String mappingPayload = objectMapper.writeValueAsString(Map.of(
                "githubUserId", users.get(0).getId().toString(),
                "employeeId", employeeId
        ));

        mockMvc.perform(post("/api/github-users/mapping")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mappingPayload))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.githubUser.employeeId", is(employeeId)));


        // 4. Create Offboarding Job for Employee
        String offboardPayload = objectMapper.writeValueAsString(Map.of(
                "employeeId", employeeId,
                "requestedBy", "admin",
                "reason", "Test offboarding"
        ));

        String jobJson = mockMvc.perform(post("/api/offboarding/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(offboardPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.offboardingJob.status", is("PENDING")))
                .andExpect(jsonPath("$.offboardingJob.repositoriesTotal", is(1)))
                .andReturn().getResponse().getContentAsString();

        Map<String, Object> jobResult = objectMapper.readValue(jobJson, Map.class);
        Map<String, Object> jobMap = (Map<String, Object>) jobResult.get("offboardingJob");
        String jobId = String.valueOf(jobMap.get("id"));

        // Verify RemovalRequest was created in DB
        List<RemovalRequest> requests = removalRequestRepository.findAll();
        assertEquals(1, requests.size());
        assertEquals("PENDING", requests.get(0).getStatus().toString());

        // 5. Execute Offboarding Job
        mockMvc.perform(post("/api/offboarding/jobs/" + jobId + "/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("executedBy", "admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.offboardingJob.status", is("EXECUTED")))
                .andExpect(jsonPath("$.offboardingJob.repositoriesProcessed", is(1)))
                .andExpect(jsonPath("$.offboardingJob.repositoriesFailed", is(0)));

        // Verify collaborator access was deleted
        List<RepositoryAccess> accessesPostOffboard = repositoryAccessRepository.findAll();
        assertEquals(0, accessesPostOffboard.size());

        // Verify RemovalRequest status is EXECUTED
        List<RemovalRequest> requestsPostOffboard = removalRequestRepository.findAll();
        assertEquals(1, requestsPostOffboard.size());
        assertEquals("EXECUTED", requestsPostOffboard.get(0).getStatus().toString());

        // Verify GitHub removeCollaborator was invoked
        Mockito.verify(gitHubClient, Mockito.times(1)).removeCollaborator("owner", "test-repo", "collaborator1");
    }

    @Test
    public void testBulkOffboardingBatchWorkflow() throws Exception {
        // Create 2 Employees
        Employee emp1 = new Employee();
        emp1.setFullName("Employee One");
        emp1.setEmail("emp1@example.com");
        emp1 = employeeRepository.save(emp1);

        Employee emp2 = new Employee();
        emp2.setFullName("Employee Two");
        emp2.setEmail("emp2@example.com");
        emp2 = employeeRepository.save(emp2);

        // Create Bulk Offboarding Batch
        String bulkPayload = objectMapper.writeValueAsString(Map.of(
                "employeeIds", List.of(emp1.getId().toString(), emp2.getId().toString()),
                "requestedBy", "admin",
                "reason", "Bulk offboarding test"
        ));

        String batchJson = mockMvc.perform(post("/api/offboarding/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bulkPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bulkBatch.status", is("PENDING_APPROVAL")))
                .andReturn().getResponse().getContentAsString();

        Map<String, Object> batchResult = objectMapper.readValue(batchJson, Map.class);
        Map<String, Object> batchMap = (Map<String, Object>) batchResult.get("bulkBatch");
        String batchId = String.valueOf(batchMap.get("id"));
        Map<String, Object> approvalRequestMap = (Map<String, Object>) batchMap.get("approvalRequest");
        String approvalRequestId = String.valueOf(approvalRequestMap.get("id"));

        // Approve the batch via governance approvals PATCH
        mockMvc.perform(patch("/api/governance/approvals/" + approvalRequestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "status", "APPROVED",
                                "actedBy", "admin"
                        ))))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approvalRequest.status", is("APPROVED")));


        // Verify batch was approved and executed
        Optional<BulkOffboardingBatch> updatedBatch = bulkOffboardingBatchRepository.findById(UUID.fromString(batchId));
        assertTrue(updatedBatch.isPresent());
        assertEquals("EXECUTED", updatedBatch.get().getStatus());
    }

    @Test
    public void testRemoveCollaboratorsControllerValidation() throws Exception {
        // Upsert Repository in DB
        Repository repo = new Repository();
        repo.setGithubRepoId(12345L);
        repo.setName("test-repo");
        repo.setFullName("owner/test-repo");
        repo = repositoryRepository.save(repo);

        // Create a user in DB
        GithubUser user = new GithubUser();
        user.setGithubId(98765L);
        user.setGithubUsername("collaborator1");
        user = githubUserRepository.save(user);

        // Access map
        RepositoryAccess access = new RepositoryAccess();
        access.setRepository(repo);
        access.setGithubUser(user);
        access.setPermission("write");
        repositoryAccessRepository.save(access);

        // Test POST /api/repositories/remove-collaborators
        String removePayload = objectMapper.writeValueAsString(Map.of(
                "repositoryId", repo.getId().toString(),
                "githubUserIds", List.of(user.getId().toString()),
                "executedBy", "admin"
        ));

        mockMvc.perform(post("/api/repositories/remove-collaborators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(removePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.removed", is(1)))
                .andExpect(jsonPath("$.result.failed", is(0)));

        // Test POST /api/repositories/remove-collaborators with non-admin authentication mock
        Mockito.when(gitHubClient.getRepository("owner", "test-repo")).thenReturn(Map.of(
                "permissions", Map.of("admin", false)
        ));

        mockMvc.perform(post("/api/repositories/remove-collaborators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(removePayload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("don't have permission")));
    }
}
