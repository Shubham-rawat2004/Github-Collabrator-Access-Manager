package com.gitcollab.manager.service;

import com.gitcollab.manager.model.Employee;
import com.gitcollab.manager.model.GithubUser;
import com.gitcollab.manager.repository.EmployeeRepository;
import com.gitcollab.manager.repository.GithubUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private GithubUserRepository githubUserRepository;

    private String normalizeEmail(String email) {
        if (email == null) return null;
        String trimmed = email.trim();
        return trimmed.isEmpty() ? null : trimmed.toLowerCase();
    }

    private void assertUniqueEmail(String email, UUID employeeId) {
        Optional<Employee> existing = employeeRepository.findByEmailIgnoreCase(email);
        if (existing.isPresent()) {
            if (employeeId == null || !existing.get().getId().equals(employeeId)) {
                throw new RuntimeException("An employee with this email already exists.");
            }
        }
    }

    public List<Employee> listEmployees(String search) {
        return employeeRepository.searchEmployees(search != null ? search.trim() : "");
    }

    public Optional<Employee> getEmployeeById(UUID id) {
        return employeeRepository.findById(id);
    }

    public Employee createEmployee(String fullName, String emailInput) {
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new IllegalArgumentException("fullName is required");
        }

        String email = normalizeEmail(emailInput);
        if (email != null) {
            assertUniqueEmail(email, null);
        }

        Employee employee = new Employee();
        employee.setFullName(fullName.trim());
        employee.setEmail(email);
        employee.setIsActive(true);
        employee.setCreatedAt(LocalDateTime.now());
        employee.setUpdatedAt(LocalDateTime.now());

        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(UUID id, String fullName, String emailInput, String department, String notes, Boolean isActive) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found."));

        if (fullName != null) {
            employee.setFullName(fullName.trim());
        }

        if (emailInput != null) {
            String email = normalizeEmail(emailInput);
            if (email != null) {
                assertUniqueEmail(email, id);
            }
            employee.setEmail(email);
        }

        if (department != null) {
            employee.setDepartment(department.trim().isEmpty() ? null : department.trim());
        }

        if (notes != null) {
            employee.setNotes(notes.trim().isEmpty() ? null : notes.trim());
        }

        if (isActive != null) {
            employee.setIsActive(isActive);
        }

        employee.setUpdatedAt(LocalDateTime.now());
        return employeeRepository.save(employee);
    }

    public void deleteEmployee(UUID id) {
        employeeRepository.deleteById(id);
    }

    public GithubUser mapGithubUserToEmployee(UUID githubUserId, UUID employeeId) {
        GithubUser githubUser = githubUserRepository.findById(githubUserId)
                .orElseThrow(() -> new RuntimeException("Github user not found."));

        if (employeeId != null) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found."));
            githubUser.setEmployee(employee);
        } else {
            githubUser.setEmployee(null);
        }

        githubUser.setUpdatedAt(LocalDateTime.now());
        return githubUserRepository.save(githubUser);
    }
}
