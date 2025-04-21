package controller;

import io.javalin.http.Context;
import model.User;
import service.UserService;

import java.util.HashMap;
import java.util.Map;

public class UserController {
    private final UserService userService;
    
    public UserController() {
        this.userService = new UserService();
    }
    
    public void register(Context ctx) {
        try {
            // Parse JSON request body from React frontend
            Map<String, Object> requestBody = ctx.bodyAsClass(Map.class);
            
            String username = (String) requestBody.get("username");
            String email = (String) requestBody.get("email");
            String password = (String) requestBody.get("password");
            
            if (username == null || email == null || password == null) {
                ctx.status(400).json(Map.of("error", "Missing required parameters"));
                return;
            }
            
            User user = new User(username, email, password);
            boolean created = userService.createUser(user);
            
            if (created) {
                ctx.status(201).json(Map.of("message", "User registered successfully!"));
            }
            
        } catch (Exception e) {
            if (e.getMessage().contains("Username is already taken") || 
                e.getMessage().contains("Email is already registered")) {
                ctx.status(409).json(Map.of("error", e.getMessage()));
            } else {
                ctx.status(500).json(Map.of("error", "Error while registering user: " + e.getMessage()));
            }
        }
    }
    
    public void login(Context ctx) {
        try {
            // Parse JSON request body from React frontend
            Map<String, Object> requestBody = ctx.bodyAsClass(Map.class);
            
            String username = (String) requestBody.get("username");
            String password = (String) requestBody.get("password");
            
            if (username == null || password == null) {
                ctx.status(400).json(Map.of("error", "Missing username or password"));
                return;
            }
            
            User authenticatedUser = userService.login(username, password);
            
            if (authenticatedUser != null) {
                // Create user response, excluding password
                Map<String, Object> userResponse = new HashMap<>();
                userResponse.put("username", authenticatedUser.getUsername());
                userResponse.put("email", authenticatedUser.getEmail());
                
                if (authenticatedUser.getCourses() != null && !authenticatedUser.getCourses().isEmpty()) {
                    userResponse.put("courses", authenticatedUser.getCourses());
                }
                
                // Create full response
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("user", userResponse);
                
                ctx.status(200).json(response);
            } else {
                ctx.status(401).json(Map.of("error", "Invalid username or password"));
            }
            
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", "Server error: " + e.getMessage()));
        }
    }
}