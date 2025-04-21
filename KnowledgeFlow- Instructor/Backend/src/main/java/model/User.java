package model;

import java.util.ArrayList;
import java.util.List;

public class User {
    private String username;
    private String email;
    private String password; // In production, store hashed passwords only
    private List<String> courses;
    
    // Default constructor for Firebase
    public User() {
        this.courses = new ArrayList<>();
    }
    
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.courses = new ArrayList<>();
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
    
    public List<String> getCourses() {
        return courses;
    }
    
    public void setCourses(List<String> courses) {
        this.courses = courses;
    }
    
    public void addCourse(String courseId) {
        if (this.courses == null) {
            this.courses = new ArrayList<>();
        }
        this.courses.add(courseId);
    }
}