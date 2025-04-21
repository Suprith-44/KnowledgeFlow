import io.javalin.Javalin;
import service.FirebaseService;
import controller.UserController;
import controller.CourseController;

public class Main {
    public static void main(String[] args) {
        try {
            // Initialize Firebase
            FirebaseService.getInstance().initializeFirebase();
            
            // Create controllers
            UserController userController = new UserController();
            CourseController courseController = new CourseController();
            
            // Initialize Javalin
            Javalin app = Javalin.create(config -> {
                config.plugins.enableCors(cors -> {
                    cors.add(corsConfig -> {
                        corsConfig.allowHost("http://localhost:3000");
                        corsConfig.allowHost("http://127.0.0.1:3000");
                        corsConfig.allowCredentials = true;
                        corsConfig.exposeHeader("*");
                        corsConfig.maxAge = 3600;
                    });
                });
            }).start(7000);
            
            // Register routes
            app.post("/register", userController::register);
            app.post("/signup", userController::register); // alias for register
            app.post("/login", userController::login);
            app.post("/courses", courseController::createCourse);
            app.get("/courses", courseController::getCourses);
            app.get("/courses/{id}", courseController::getCourseById);
            
            System.out.println("Server started on port 7000");
            
        } catch (Exception e) {
            System.err.println("Failed to start server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}