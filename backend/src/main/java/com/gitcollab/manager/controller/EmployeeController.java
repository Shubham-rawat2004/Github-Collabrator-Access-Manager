package com.gitcollab.manager.controller;

import com.gitcollab.manager.model.Employee;
import com.gitcollab.manager.model.GithubUser;
import com.gitcollab.manager.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/api/employees")
    public ResponseEntity<Map<String, List<Employee>>> getEmployees(@RequestParam(value = "q", defaultValue = "") String q) {
        List<Employee> employees = employeeService.listEmployees(q);
        return ResponseEntity.ok(Map.of("employees", employees));
    }

    @PostMapping("/api/employees")
    public ResponseEntity<Map<String, Object>> createEmployee(@RequestBody Map<String, String> body) {
        String fullName = body.get("fullName");
        String email = body.get("email");

        if (fullName == null || fullName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "fullName is required"));
        }

        try {
            Employee employee = employeeService.createEmployee(fullName, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("employee", employee));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/employees/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable("id") UUID id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/api/employees/{id}")
    public ResponseEntity<Map<String, Object>> updateEmployee(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> body) {
        try {
            String fullName = (String) body.get("fullName");
            String email = (String) body.get("email");
            String department = (String) body.get("department");
            String notes = (String) body.get("notes");
            Boolean isActive = (Boolean) body.get("isActive");

            Employee employee = employeeService.updateEmployee(id, fullName, email, department, notes, isActive);
            return ResponseEntity.ok(Map.of("employee", employee));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/employees/{id}")
    public ResponseEntity<Map<String, Object>> deleteEmployee(@PathVariable("id") UUID id) {
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/github-users/mapping")

    public ResponseEntity<Map<String, Object>> mapGithubUser(@RequestBody Map<String, String> body) {
        String githubUserIdStr = body.get("githubUserId");
        String employeeIdStr = body.get("employeeId");

        if (githubUserIdStr == null || githubUserIdStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Select a synced GitHub user first. Run sync if the list is empty."));
        }

        try {
            UUID githubUserId = UUID.fromString(githubUserIdStr);
            UUID employeeId = (employeeIdStr != null && !employeeIdStr.trim().isEmpty()) ? UUID.fromString(employeeIdStr) : null;
            
            GithubUser githubUser = employeeService.mapGithubUserToEmployee(githubUserId, employeeId);
            return ResponseEntity.ok(Map.of("githubUser", githubUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
