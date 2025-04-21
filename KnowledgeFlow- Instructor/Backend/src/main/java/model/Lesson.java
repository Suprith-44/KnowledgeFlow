package model;

public class Lesson {
    private String id;
    private String title;
    private String content;
    private int order;
    private String videoUrl;
    
    // Default constructor for Firebase
    public Lesson() {}
    
    public Lesson(String id, String title, String content, int order) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.order = order;
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
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public int getOrder() {
        return order;
    }
    
    public void setOrder(int order) {
        this.order = order;
    }
    
    public String getVideoUrl() {
        return videoUrl;
    }
    
    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
}