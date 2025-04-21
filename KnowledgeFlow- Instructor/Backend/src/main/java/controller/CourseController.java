package controller;

import io.javalin.http.Context;
import model.Course;
import model.Lesson;
import model.Quiz;
import service.CourseService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class CourseController {
    private final CourseService courseService;
    
    public CourseController() {
        this.courseService = new CourseService();
    }
    
    public void createCourse(Context ctx) {
        try {
            // Parse JSON request body from React frontend
            Map<String, Object> requestBody = ctx.bodyAsClass(Map.class);
            
            // Extract required fields
            String title = (String) requestBody.get("title");
            String description = (String) requestBody.get("description");
            String category = (String) requestBody.get("category");
            String thumbnailUrl = (String) requestBody.get("thumbnailUrl");
            String username = (String) requestBody.get("username");
            
            // Validate required fields
            if (title == null || description == null || thumbnailUrl == null || username == null) {
                ctx.status(400).json(Map.of("error", "Missing required course information"));
                return;
            }
            
            // Optional fields
            String certificateLink = (String) requestBody.get("certificateLink");
            
            // Create course object
            String courseId = UUID.randomUUID().toString();
            Course course = new Course(courseId, title, description, category, thumbnailUrl, username);
            
            if (certificateLink != null && !certificateLink.isEmpty()) {
                course.setCertificateLink(certificateLink);
            }
            
            // Handle lessons if present
            List<Map<String, Object>> rawLessons = (List<Map<String, Object>>) requestBody.get("lessons");
            if (rawLessons != null && !rawLessons.isEmpty()) {
                for (Map<String, Object> rawLesson : rawLessons) {
                    Lesson lesson = new Lesson();
                    lesson.setId(UUID.randomUUID().toString());
                    lesson.setTitle((String) rawLesson.get("title"));
                    lesson.setContent((String) rawLesson.get("content"));
                    
                    if (rawLesson.get("order") != null) {
                        if (rawLesson.get("order") instanceof Integer) {
                            lesson.setOrder((Integer) rawLesson.get("order"));
                        } else if (rawLesson.get("order") instanceof Long) {
                            lesson.setOrder(((Long) rawLesson.get("order")).intValue());
                        }
                    }
                    
                    if (rawLesson.get("videoUrl") != null) {
                        lesson.setVideoUrl((String) rawLesson.get("videoUrl"));
                    }
                    
                    course.addLesson(lesson);
                }
            }
            
            // Handle quizzes if present
            List<Map<String, Object>> rawQuizzes = (List<Map<String, Object>>) requestBody.get("quizzes");
            if (rawQuizzes != null && !rawQuizzes.isEmpty()) {
                for (Map<String, Object> rawQuiz : rawQuizzes) {
                    Quiz quiz = new Quiz();
                    quiz.setId(UUID.randomUUID().toString());
                    quiz.setQuestion((String) rawQuiz.get("question"));
                    
                    // Handle options
                    List<String> options = (List<String>) rawQuiz.get("options");
                    quiz.setOptions(options);
                    
                    // Handle correctOption
                    if (rawQuiz.get("correctOption") != null) {
                        if (rawQuiz.get("correctOption") instanceof Integer) {
                            quiz.setCorrectOption((Integer) rawQuiz.get("correctOption"));
                        } else if (rawQuiz.get("correctOption") instanceof Long) {
                            quiz.setCorrectOption(((Long) rawQuiz.get("correctOption")).intValue());
                        }
                    }
                    
                    course.addQuiz(quiz);
                }
            }
            
            // Save course using service
            Course createdCourse = courseService.createCourse(course);
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Course created successfully");
            response.put("courseId", createdCourse.getId());
            
            ctx.status(201).json(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Failed to create course: " + e.getMessage()));
        }
    }
    
    public void getCourseById(Context ctx) {
        try {
            // Get course ID from path parameter
            String courseId = ctx.pathParam("id");
            
            if (courseId == null || courseId.isEmpty()) {
                ctx.status(400).json(Map.of("error", "Course ID is required"));
                return;
            }
            
            Course course = courseService.getCourseById(courseId);
            
            if (course != null) {
                ctx.json(course);
            } else {
                ctx.status(404).json(Map.of("error", "Course not found"));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Failed to retrieve course: " + e.getMessage()));
        }
    }
    
    public void getCourses(Context ctx) {
        try {
            // Get username from query parameters
            String username = ctx.queryParam("username");
            
            if (username == null || username.isEmpty()) {
                ctx.status(400).json(Map.of("error", "Username parameter is required"));
                return;
            }
            
            Map<String, Course> courses = courseService.getCoursesByUser(username);
            
            // Transform to JSON-friendly structure if needed
            ctx.json(courses);
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Failed to retrieve courses: " + e.getMessage()));
        }
    }
}