package controller;

import io.javalin.http.Context;
import model.CourseProgress;
import service.CourseService;
import service.LearnerService;
import service.UserService;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LearnerController {
    private final LearnerService learnerService;
    private final UserService userService;
    private final CourseService courseService;
    
    public LearnerController() {
        this.learnerService = new LearnerService();
        this.userService = new UserService();
        this.courseService = new CourseService();
    }
    
    public void getEnrolledCourses(Context ctx) {
        try {
            String username = ctx.pathParam("username");
            
            if (username == null || username.isEmpty()) {
                ctx.status(400).json(Map.of("error", "Username is required"));
                return;
            }
            
            // Check if user exists
            if (!userService.userExists(username)) {
                ctx.status(404).json(Map.of("error", "User not found"));
                return;
            }
            
            List<Map<String, Object>> enrolledCourses = learnerService.getEnrolledCourses(username);
            ctx.json(enrolledCourses);
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Failed to retrieve enrolled courses: " + e.getMessage()));
        }
    }
    
    public void enrollInCourse(Context ctx) {
        try {
            String courseId = ctx.pathParam("id");
            Map<String, Object> requestBody = ctx.bodyAsClass(Map.class);
            String username = (String) requestBody.get("username");
            
            if (courseId == null || username == null) {
                ctx.status(400).json(Map.of("error", "Course ID and username are required"));
                return;
            }
            
            // Check if the course exists
            if (!courseService.courseExists(courseId)) {
                ctx.status(404).json(Map.of("error", "Course not found"));
                return;
            }
            
            // Check if user exists
            if (!userService.userExists(username)) {
                ctx.status(404).json(Map.of("error", "User not found"));
                return;
            }
            
            boolean enrolled = learnerService.enrollInCourse(username, courseId);
            
            if (!enrolled) {
                ctx.status(409).json(Map.of("error", "User is already enrolled in this course"));
                return;
            }
            
            // Get the current date as enrollment date
            String enrollmentDate = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").format(new Date());
            
            ctx.status(200).json(Map.of(
                "message", "Successfully enrolled in course",
                "enrollmentDate", enrollmentDate
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Failed to enroll in course: " + e.getMessage()));
        }
    }
    
    public void updateCourseProgress(Context ctx) {
        try {
            // Get path parameters
            String username = ctx.pathParam("username");
            String courseId = ctx.pathParam("courseId");
            
            // Parse request body
            Map<String, Object> progressData = ctx.bodyAsClass(Map.class);
            
            if (username == null || courseId == null) {
                ctx.status(400).json(Map.of("error", "Username and courseId are required"));
                return;
            }
            
            // Check if user exists
            if (!userService.userExists(username)) {
                ctx.status(404).json(Map.of("error", "User not found"));
                return;
            }
            
            // Check if course exists
            if (!courseService.courseExists(courseId)) {
                ctx.status(404).json(Map.of("error", "Course not found"));
                return;
            }
            
            // Check if the user is enrolled in the course
            List<String> enrollments = learnerService.getEnrollments(username);
            if (!enrollments.contains(courseId)) {
                ctx.status(403).json(Map.of("error", "User is not enrolled in this course"));
                return;
            }
            
            // Create CourseProgress object
            CourseProgress progress = new CourseProgress(courseId, username);
            
            // Extract progress fields
            if (progressData.containsKey("completedLessons")) {
                progress.setCompletedLessons((List<String>) progressData.get("completedLessons"));
            }
            
            if (progressData.containsKey("quizAnswers")) {
                progress.setQuizAnswers((Map<String, Object>) progressData.get("quizAnswers"));
            }
            
            if (progressData.containsKey("quizSubmitted")) {
                progress.setQuizSubmitted((Map<String, Object>) progressData.get("quizSubmitted"));
            }
            
            if (progressData.containsKey("quizResults")) {
                progress.setQuizResults((Map<String, Object>) progressData.get("quizResults"));
            }
            
            if (progressData.containsKey("certificateUnlocked")) {
                progress.setCertificateUnlocked((boolean) progressData.get("certificateUnlocked"));
            }
            
            if (progressData.containsKey("overallProgress")) {
                progress.setOverallProgress(((Number) progressData.get("overallProgress")).intValue());
            }
            
            // Update the progress
            learnerService.updateCourseProgress(progress);
            
            // Return success response
            ctx.status(200).json(Map.of(
                "message", "Progress updated successfully",
                "timestamp", progress.getLastUpdated()
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Failed to update progress: " + e.getMessage()));
        }
    }
    
    public void getCourseProgress(Context ctx) {
        try {
            // Get path parameters
            String username = ctx.pathParam("username");
            String courseId = ctx.pathParam("courseId");
            
            if (username == null || courseId == null) {
                ctx.status(400).json(Map.of("error", "Username and courseId are required"));
                return;
            }
            
            // Check if user exists
            if (!userService.userExists(username)) {
                ctx.status(404).json(Map.of("error", "User not found"));
                return;
            }
            
            // Check if course exists
            if (!courseService.courseExists(courseId)) {
                ctx.status(404).json(Map.of("error", "Course not found"));
                return;
            }
            
            // Get the progress data
            CourseProgress progress = learnerService.getCourseProgress(username, courseId);
            
            Map<String, Object> progressMap = new HashMap<>();
            progressMap.put("completedLessons", progress.getCompletedLessons());
            progressMap.put("quizAnswers", progress.getQuizAnswers());
            progressMap.put("quizSubmitted", progress.getQuizSubmitted());
            progressMap.put("quizResults", progress.getQuizResults());
            progressMap.put("certificateUnlocked", progress.isCertificateUnlocked());
            progressMap.put("overallProgress", progress.getOverallProgress());
            progressMap.put("lastUpdated", progress.getLastUpdated());
            
            ctx.status(200).json(progressMap);
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Failed to retrieve progress: " + e.getMessage()));
        }
    }
}