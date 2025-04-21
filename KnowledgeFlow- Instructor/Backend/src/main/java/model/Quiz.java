package model;

import java.util.ArrayList;
import java.util.List;

public class Quiz {
    private String id;
    private String question;
    private List<String> options;
    private int correctOption;
    
    // Default constructor for Firebase
    public Quiz() {
        this.options = new ArrayList<>();
    }
    
    public Quiz(String id, String question, List<String> options, int correctOption) {
        this.id = id;
        this.question = question;
        this.options = options;
        this.correctOption = correctOption;
    }
    
    // Getters and setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getQuestion() {
        return question;
    }
    
    public void setQuestion(String question) {
        this.question = question;
    }
    
    public List<String> getOptions() {
        return options;
    }
    
    public void setOptions(List<String> options) {
        this.options = options;
    }
    
    public int getCorrectOption() {
        return correctOption;
    }
    
    public void setCorrectOption(int correctOption) {
        this.correctOption = correctOption;
    }
}