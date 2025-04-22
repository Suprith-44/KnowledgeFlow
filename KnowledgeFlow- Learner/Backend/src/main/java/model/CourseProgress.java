package model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CourseProgress {
    private String courseId;
    private String username;
    private List<String> completedLessons;
    private Map<String, Object> quizAnswers;
    private Map<String, Object> quizSubmitted;
    private Map<String, Object> quizResults;
    private boolean certificateUnlocked;
    private int overallProgress;
    private String lastUpdated;
    
    // Default constructor
    public CourseProgress() {
        this.completedLessons = new ArrayList<>();
        this.quizAnswers = new HashMap<>();
        this.quizSubmitted = new HashMap<>();
        this.quizResults = new HashMap<>();
        this.certificateUnlocked = false;
        this.overallProgress = 0;
    }
    
    public CourseProgress(String courseId, String username) {
        this();
        this.courseId = courseId;
        this.username = username;
    }
    
    // Getters and setters
    public String getCourseId() {
        return courseId;
    }
    
    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public List<String> getCompletedLessons() {
        return completedLessons;
    }
    
    public void setCompletedLessons(List<String> completedLessons) {
        this.completedLessons = completedLessons;
    }
    
    public Map<String, Object> getQuizAnswers() {
        return quizAnswers;
    }
    
    public void setQuizAnswers(Map<String, Object> quizAnswers) {
        this.quizAnswers = quizAnswers;
    }
    
    public Map<String, Object> getQuizSubmitted() {
        return quizSubmitted;
    }
    
    public void setQuizSubmitted(Map<String, Object> quizSubmitted) {
        this.quizSubmitted = quizSubmitted;
    }
    
    public Map<String, Object> getQuizResults() {
        return quizResults;
    }
    
    public void setQuizResults(Map<String, Object> quizResults) {
        this.quizResults = quizResults;
    }
    
    public boolean isCertificateUnlocked() {
        return certificateUnlocked;
    }
    
    public void setCertificateUnlocked(boolean certificateUnlocked) {
        this.certificateUnlocked = certificateUnlocked;
    }
    
    public int getOverallProgress() {
        return overallProgress;
    }
    
    public void setOverallProgress(int overallProgress) {
        this.overallProgress = overallProgress;
    }
    
    public String getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}