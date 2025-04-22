package model;

import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

public class User {
    private String username;
    private String email;
    private String password;
    private List<String> enrollments;
    private Map<String, Integer> progress;
    private Map<String, String> lastAccessed;
    
    // Default constructor for Firebase
    public User() {
        this.enrollments = new ArrayList<>();
        this.progress = new HashMap<>();
        this.lastAccessed = new HashMap<>();
    }
    
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.enrollments = new ArrayList<>();
        this.progress = new HashMap<>();
        this.lastAccessed = new HashMap<>();
    }

    // Getters and setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<String> getEnrollments() {
        return enrollments;
    }

    public void setEnrollments(List<String> enrollments) {
        this.enrollments = enrollments;
    }

    public void addEnrollment(String courseId) {
        if (this.enrollments == null) {
            this.enrollments = new ArrayList<>();
        }
        this.enrollments.add(courseId);
    }

    public Map<String, Integer> getProgress() {
        return progress;
    }

    public void setProgress(Map<String, Integer> progress) {
        this.progress = progress;
    }

    public Map<String, String> getLastAccessed() {
        return lastAccessed;
    }

    public void setLastAccessed(Map<String, String> lastAccessed) {
        this.lastAccessed = lastAccessed;
    }
}