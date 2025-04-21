package service;

import com.google.firebase.database.*;
import model.User;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;

public class UserService {
    private final DatabaseReference userRef;
    
    public UserService() {
        this.userRef = FirebaseDatabase.getInstance().getReference("users");
    }
    
    public boolean createUser(User user) throws Exception {
        final boolean[] usernameExists = {false};
        final boolean[] emailExists = {false};
        CountDownLatch usernameLatch = new CountDownLatch(1);
        
        // Check if username already exists
        userRef.child(user.getUsername()).addListenerForSingleValueEvent(new ValueEventListener() {
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
        
        CountDownLatch emailLatch = new CountDownLatch(1);
        // Check if email is already in use
        userRef.orderByChild("email").equalTo(user.getEmail()).addListenerForSingleValueEvent(new ValueEventListener() {
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
        
        usernameLatch.await();
        emailLatch.await();
        
        if (usernameExists[0]) {
            throw new Exception("Username is already taken");
        }
        
        if (emailExists[0]) {
            throw new Exception("Email is already registered");
        }
        
        // Create user data map
        Map<String, Object> userData = new HashMap<>();
        userData.put("email", user.getEmail());
        userData.put("password", user.getPassword()); // Should be hashed in production
        
        // Save to database
        userRef.child(user.getUsername()).setValueAsync(userData).get();
        return true;
    }
    
    public User login(String username, String password) throws Exception {
        final User[] authenticatedUser = {null};
        final CountDownLatch latch = new CountDownLatch(1);
        
        userRef.child(username).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    String storedPassword = dataSnapshot.child("password").getValue(String.class);
                    if (storedPassword != null && storedPassword.equals(password)) {
                        User user = new User();
                        user.setUsername(username);
                        user.setEmail(dataSnapshot.child("email").getValue(String.class));
                        
                        // Add courses if they exist
                        if (dataSnapshot.hasChild("courses")) {
                            for (DataSnapshot courseSnapshot : dataSnapshot.child("courses").getChildren()) {
                                String courseId = courseSnapshot.getValue(String.class);
                                if (courseId != null) {
                                    user.addCourse(courseId);
                                }
                            }
                        }
                        
                        authenticatedUser[0] = user;
                    }
                }
                latch.countDown();
            }
            
            @Override
            public void onCancelled(DatabaseError databaseError) {
                latch.countDown();
            }
        });
        
        latch.await();
        return authenticatedUser[0];
    }
    
    public void addCourseToUser(String username, String courseId) throws Exception {
        userRef.child(username).child("courses").push().setValueAsync(courseId).get();
    }
}