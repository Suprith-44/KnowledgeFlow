package model;

import java.util.ArrayList;
import java.util.List;

public class Course {
    private String id;
    private String title;
    private String description;
    private String category;
    private String thumbnailUrl;
    private String creatorUsername;
    private long createdAt;
    private int students;
    private String certificateLink;
    private List<Lesson> lessons;
    private List<Quiz> quizzes;
    
    // Default constructor for Firebase
    public Course() {
        this.lessons = new ArrayList<>();
        this.quizzes = new ArrayList<>();
        this.students = 0;
    }
    
    public Course(String id, String title, String description, String category, 
                 String thumbnailUrl, String creatorUsername) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.thumbnailUrl = thumbnailUrl;
        this.creatorUsername = creatorUsername;
        this.createdAt = System.currentTimeMillis();
        this.lessons = new ArrayList<>();
        this.quizzes = new ArrayList<>();
        this.students = 0;
    }
    
    // Getters and setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getThumbnailUrl() {
        return thumbnailUrl;
    }
    
    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
    
    public String getCreatorUsername() {
        return creatorUsername;
    }
    
    public void setCreatorUsername(String creatorUsername) {
        this.creatorUsername = creatorUsername;
    }
    
    public long getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
    
    public int getStudents() {
        return students;
    }
    
    public void setStudents(int students) {
        this.students = students;
    }
    
    public String getCertificateLink() {
        return certificateLink;
    }
    
    public void setCertificateLink(String certificateLink) {
        this.certificateLink = certificateLink;
    }
    
    public List<Lesson> getLessons() {
        return lessons;
    }
    
    public void setLessons(List<Lesson> lessons) {
        this.lessons = lessons;
    }
    
    public void addLesson(Lesson lesson) {
        if (this.lessons == null) {
            this.lessons = new ArrayList<>();
        }
        this.lessons.add(lesson);
    }
    
    public List<Quiz> getQuizzes() {
        return quizzes;
    }
    
    public void setQuizzes(List<Quiz> quizzes) {
        this.quizzes = quizzes;
    }
    
    public void addQuiz(Quiz quiz) {
        if (this.quizzes == null) {
            this.quizzes = new ArrayList<>();
        }
        this.quizzes.add(quiz);
    }
}