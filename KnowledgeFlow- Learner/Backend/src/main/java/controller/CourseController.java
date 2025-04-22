package controller;

import io.javalin.http.Context;
import service.CourseService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CourseController {
    private final CourseService courseService;
    
    public CourseController() {
        this.courseService = new CourseService();
    }
    
    public void browseAllCourses(Context ctx) {
        try {
            // Get query parameters for filtering
            String category = ctx.queryParam("category");
            String search = ctx.queryParam("search");
            
            List<Map<String, Object>> courses = courseService.browseAllCourses(category, search);
            ctx.json(courses);
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Failed to retrieve courses: " + e.getMessage()));
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
            
            Map<String, Object> course = courseService.getCourseById(courseId);
            
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
}