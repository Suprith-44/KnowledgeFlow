import io.javalin.Javalin;
import io.javalin.http.Context;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.*;
import com.google.firebase.database.ValueEventListener;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) throws IOException {
        // Initialize Firebase
        FileInputStream serviceAccount = new FileInputStream("D:/Sem-6/OOAD/Project/javalin-hello/firebase.json");

        FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(com.google.auth.oauth2.GoogleCredentials.fromStream(serviceAccount))
            .setDatabaseUrl("")
        FirebaseApp.initializeApp(options);

        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> {
                cors.add(corsConfig -> {
                    // Allow specific origin(s) - http://localhost:3000 for React dev server
                    corsConfig.allowHost("http://localhost:3000");
                    corsConfig.allowHost("http://127.0.0.1:3000");
                    // Add other origins as needed
                    corsConfig.allowHost("https://yourdomain.com");
                    
                    // Enable standard CORS settings
                    corsConfig.allowCredentials = true;
                    corsConfig.exposeHeader("*");
                    corsConfig.maxAge = 3600;
                });
            });
        }).start(7000);

        app.post("/register", Main::registerUser);
        app.post("/signup", Main::signupUser);
        app.post("/login", Main::loginUser);
        app.post("/courses", Main::createCourse);
        app.get("/courses", Main::getCourses);
        app.get("/courses/{id}", Main::getCourseById); // Changed from "/courses/:id"
    }

    private static void createCourse(Context ctx) {
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
            List<Map<String, Object>> lessons = (List<Map<String, Object>>) requestBody.get("lessons");
            List<Map<String, Object>> quizzes = (List<Map<String, Object>>) requestBody.get("quizzes");
            
            // Generate a random unique ID for the course
            String courseId = UUID.randomUUID().toString();
            
            // Create course data
            Map<String, Object> courseData = new HashMap<>();
            courseData.put("id", courseId);
            courseData.put("title", title);
            courseData.put("description", description);
            courseData.put("category", category);
            courseData.put("thumbnailUrl", thumbnailUrl);
            courseData.put("creatorUsername", username);
            courseData.put("createdAt", System.currentTimeMillis());
            
            // Add optional fields if present
            if (certificateLink != null && !certificateLink.isEmpty()) {
                courseData.put("certificateLink", certificateLink);
            }
            
            if (lessons != null && !lessons.isEmpty()) {
                courseData.put("lessons", lessons);
            }
            
            if (quizzes != null && !quizzes.isEmpty()) {
                courseData.put("quizzes", quizzes);
            }
            
            // Get a reference to the courses node in Firebase
            DatabaseReference coursesRef = FirebaseDatabase.getInstance().getReference("courses");
            
            // Store the course with courseId as the key
            coursesRef.child(courseId).setValueAsync(courseData).get();
            
            // Also update the user's courses list
            DatabaseReference userRef = FirebaseDatabase.getInstance().getReference("users").child(username).child("courses");
            userRef.push().setValueAsync(courseId).get();
            
            // Return success response with course ID
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Course created successfully");
            response.put("courseId", courseId);
            
            ctx.status(201).json(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Failed to create course: " + e.getMessage()));
        }
    }
    
    private static void getCourses(Context ctx) {
        try {
            // Get username from query parameters
            String username = ctx.queryParam("username");
            
            if (username == null || username.isEmpty()) {
                ctx.status(400).json(Map.of("error", "Username parameter is required"));
                return;
            }
            
            // Get a reference to the courses node
            DatabaseReference coursesRef = FirebaseDatabase.getInstance().getReference("courses");
            
            // Create a query to find courses by creator username
            Query query = coursesRef.orderByChild("creatorUsername").equalTo(username);
            
            // Use CountDownLatch to wait for the asynchronous Firebase query
            CountDownLatch latch = new CountDownLatch(1);
            final Map<String, Object>[] coursesData = new Map[1];
            
            query.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    Map<String, Object> courses = new HashMap<>();
                    
                    for (DataSnapshot courseSnapshot : dataSnapshot.getChildren()) {
                        Map<String, Object> course = new HashMap<>();
                        
                        for (DataSnapshot child : courseSnapshot.getChildren()) {
                            course.put(child.getKey(), child.getValue());
                        }
                        
                        courses.put(courseSnapshot.getKey(), course);
                    }
                    
                    coursesData[0] = courses;
                    latch.countDown();
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    latch.countDown();
                }
            });
            
            try {
                latch.await();
                
                if (coursesData[0] != null && !coursesData[0].isEmpty()) {
                    ctx.json(coursesData[0]);
                } else {
                    ctx.json(Map.of());
                }
                
            } catch (InterruptedException e) {
                ctx.status(500).json(Map.of("error", "Error retrieving courses"));
                Thread.currentThread().interrupt();
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Failed to retrieve courses: " + e.getMessage()));
        }
    }

    private static void loginUser(Context ctx) {
        try {
            // Parse JSON request body from React frontend
            Map<String, Object> requestBody = ctx.bodyAsClass(Map.class);
            
            String username = (String) requestBody.get("username");
            String password = (String) requestBody.get("password");

            if (username == null || password == null) {
                ctx.status(400).json(Map.of("error", "Missing username or password"));
                return;
            }

            // Get a reference to the users node
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users");
            
            // Look for the user by username
            CountDownLatch latch = new CountDownLatch(1);
            final boolean[] authenticated = {false};
            final Map<String, Object>[] userData = new Map[1];
            
            ref.child(username).addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    if (dataSnapshot.exists()) {
                        // User exists, check password
                        String storedPassword = dataSnapshot.child("password").getValue(String.class);
                        if (storedPassword != null && storedPassword.equals(password)) {
                            authenticated[0] = true;
                            
                            // Create a map of user data to return (excluding password)
                            userData[0] = new HashMap<>();
                            for (DataSnapshot child : dataSnapshot.getChildren()) {
                                if (!child.getKey().equals("password")) {
                                    userData[0].put(child.getKey(), child.getValue());
                                }
                            }
                            userData[0].put("username", username);
                        }
                    }
                    latch.countDown();
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    latch.countDown();
                }
            });
            
            try {
                latch.await();
                
                if (authenticated[0]) {
                    // Create a response with user data and a success message
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Login successful");
                    response.put("user", userData[0]);
                    
                    ctx.status(200).json(response);
                } else {
                    ctx.status(401).json(Map.of("error", "Invalid username or password"));
                }
                
            } catch (InterruptedException e) {
                ctx.status(500).json(Map.of("error", "Error during authentication"));
                Thread.currentThread().interrupt();
            }
            
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    private static void registerUser(Context ctx) {
        String email = ctx.formParam("email");
        String name = ctx.formParam("name");
        String password = ctx.formParam("password");

        if (email == null || name == null || password == null) {
            ctx.status(400).result("Missing parameters");
            return;
        }

        // Get a reference to the users node
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users");
        
        // Use email as the key by replacing dots with underscores (Firebase doesn't allow dots in keys)
        String emailKey = email.replace(".", "_");
        
        // First check if a user with this email already exists
        CountDownLatch latch = new CountDownLatch(1);
        final boolean[] userExists = {false};
        
        ref.child(emailKey).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                userExists[0] = dataSnapshot.exists();
                latch.countDown();
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                latch.countDown();
            }
        });
        
        try {
            latch.await(); // Wait for the Firebase query to complete
            
            if (userExists[0]) {
                ctx.status(409).result("User already exists with this email");
                return;
            }
            
            // Create user data without including email as a value since it's now the key
            Map<String, Object> userData = new HashMap<>();
            userData.put("name", name);
            userData.put("password", password); // (⚡ in production you should hash passwords!)
            
            // Set the data at the location specified by the email key
            ref.child(emailKey).setValueAsync(userData);
    
            ctx.result("User registered successfully!");
            
        } catch (InterruptedException e) {
            ctx.status(500).result("Error while registering user");
            Thread.currentThread().interrupt();
        }
    }

    private static void signupUser(Context ctx) {
        // Parse JSON request body from React frontend
        Map<String, Object> requestBody = ctx.bodyAsClass(Map.class);
        
        String username = (String) requestBody.get("username");
        String email = (String) requestBody.get("email");
        String password = (String) requestBody.get("password");

        if (username == null || email == null || password == null) {
            ctx.status(400).json(Map.of("error", "Missing required parameters"));
            return;
        }

        // Get a reference to the users node
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users");
        
        // We'll use username as the key as requested
        // First check if a user with this username already exists
        CountDownLatch usernameLatch = new CountDownLatch(1);
        final boolean[] usernameExists = {false};
        
        ref.child(username).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                usernameExists[0] = dataSnapshot.exists();
                usernameLatch.countDown();
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                usernameLatch.countDown();
            }
        });
        
        // Also check if email is already in use
        CountDownLatch emailLatch = new CountDownLatch(1);
        final boolean[] emailExists = {false};
        
        ref.orderByChild("email").equalTo(email).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                emailExists[0] = dataSnapshot.exists();
                emailLatch.countDown();
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                emailLatch.countDown();
            }
        });
        
        try {
            usernameLatch.await();
            emailLatch.await();
            
            if (usernameExists[0]) {
                ctx.status(409).json(Map.of("error", "Username is already taken"));
                return;
            }
            
            if (emailExists[0]) {
                ctx.status(409).json(Map.of("error", "Email is already registered"));
                return;
            }
            
            // Create user data
            Map<String, Object> userData = new HashMap<>();
            userData.put("email", email);
            userData.put("password", password); // (⚡ in production you should hash passwords!)
            
            // Set the data at the location specified by the username key
            ref.child(username).setValueAsync(userData);
    
            ctx.status(201).json(Map.of("message", "User registered successfully!"));
            
        } catch (InterruptedException e) {
            ctx.status(500).json(Map.of("error", "Error while registering user"));
            Thread.currentThread().interrupt();
        }
    }

    // Add this new method to the Main class
    private static void getCourseById(Context ctx) {
        try {
            // Get course ID from path parameter
            String courseId = ctx.pathParam("id");
            
            if (courseId == null || courseId.isEmpty()) {
                ctx.status(400).json(Map.of("error", "Course ID is required"));
                return;
            }
            
            // Get a reference to the specific course in Firebase
            DatabaseReference courseRef = FirebaseDatabase.getInstance().getReference("courses").child(courseId);
            
            // Use CountDownLatch to wait for the asynchronous Firebase query
            CountDownLatch latch = new CountDownLatch(1);
            final Map<String, Object>[] courseData = new Map[1];
            
            courseRef.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    if (dataSnapshot.exists()) {
                        Map<String, Object> course = new HashMap<>();
                        
                        for (DataSnapshot child : dataSnapshot.getChildren()) {
                            String key = child.getKey();
                            Object value = child.getValue();
                            
                            // Handle special cases like lessons and quizzes which are complex objects
                            if (key.equals("lessons") || key.equals("quizzes")) {
                                List<Map<String, Object>> items = new ArrayList<>();
                                for (DataSnapshot itemSnapshot : child.getChildren()) {
                                    Map<String, Object> item = new HashMap<>();
                                    for (DataSnapshot itemField : itemSnapshot.getChildren()) {
                                        item.put(itemField.getKey(), itemField.getValue());
                                    }
                                    items.add(item);
                                }
                                course.put(key, items);
                            } else {
                                course.put(key, value);
                            }
                        }
                        
                        courseData[0] = course;
                    }
                    latch.countDown();
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    latch.countDown();
                }
            });
            
            try {
                latch.await();
                
                if (courseData[0] != null) {
                    ctx.json(courseData[0]);
                } else {
                    ctx.status(404).json(Map.of("error", "Course not found"));
                }
                
            } catch (InterruptedException e) {
                ctx.status(500).json(Map.of("error", "Error retrieving course"));
                Thread.currentThread().interrupt();
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of("error", "Failed to retrieve course: " + e.getMessage()));
        }
    }
}
