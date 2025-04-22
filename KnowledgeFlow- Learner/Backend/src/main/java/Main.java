import io.javalin.Javalin;
import config.FirebaseConfig;
import controller.UserController;
import controller.CourseController;
import controller.LearnerController;

public class Main {
    public static void main(String[] args) {
        try {
            // Initialize Firebase
            FirebaseConfig.getInstance().initializeFirebase();
            
            // Create controllers
            UserController userController = new UserController();
            CourseController courseController = new CourseController();
            LearnerController learnerController = new LearnerController();
            
            // Initialize Javalin
            Javalin app = Javalin.create(config -> {
                config.plugins.enableCors(cors -> {
                    cors.add(corsConfig -> {
                        // Allow specific origin(s)
                        corsConfig.allowHost("http://localhost:3000");
                        corsConfig.allowHost("http://127.0.0.1:3000");
                        corsConfig.allowHost("https://yourdomain.com");
                        
                        // Enable standard CORS settings
                        corsConfig.allowCredentials = true;
                        corsConfig.exposeHeader("*");
                        corsConfig.maxAge = 3600;
                    });
                });
            }).start(7000);
            
            // User authentication routes
            app.post("/signup", userController::signupUser);
            app.post("/login", userController::loginUser);
            
            // Course routes
            app.get("/courses/{id}", courseController::getCourseById);
            app.get("/api/courses", courseController::browseAllCourses);
            
            // Learner-specific routes
            app.get("/api/users/{username}/enrolled-courses", learnerController::getEnrolledCourses);
            app.post("/api/courses/{id}/enroll", learnerController::enrollInCourse);
            app.post("/api/users/{username}/courses/{courseId}/progress", learnerController::updateCourseProgress);
            app.get("/api/users/{username}/courses/{courseId}/progress", learnerController::getCourseProgress);
            
            System.out.println("Server started on port 7000");
            
        } catch (Exception e) {
            System.err.println("Failed to start server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}