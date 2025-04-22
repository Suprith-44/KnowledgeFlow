package service;

import com.google.firebase.database.*;
import model.Course;

import java.util.*;
import java.util.concurrent.CountDownLatch;

public class CourseService {
    private final DatabaseReference courseRef;
    
    public CourseService() {
        this.courseRef = FirebaseDatabase.getInstance().getReference("courses");
    }
    
    public List<Map<String, Object>> browseAllCourses(String category, String search) throws Exception {
        final List<Map<String, Object>> allCourses = new ArrayList<>();
        final CountDownLatch latch = new CountDownLatch(1);
        
        courseRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                for (DataSnapshot courseSnapshot : dataSnapshot.getChildren()) {
                    // Create a simplified course object with only essential fields
                    Map<String, Object> course = new HashMap<>();
                    course.put("id", courseSnapshot.getKey());
                    
                    // Extract only the needed fields
                    String title = courseSnapshot.child("title").getValue(String.class);
                    String description = courseSnapshot.child("description").getValue(String.class);
                    String creatorUsername = courseSnapshot.child("creatorUsername").getValue(String.class);
                    String thumbnailUrl = courseSnapshot.child("thumbnailUrl").getValue(String.class);
                    String courseCategory = courseSnapshot.child("category").getValue(String.class);
                    
                    course.put("title", title);
                    course.put("description", description);
                    course.put("creatorUsername", creatorUsername);
                    course.put("thumbnailUrl", thumbnailUrl);
                    course.put("category", courseCategory);
                    
                    // Apply filtering logic
                    boolean includeInResults = true;
                    
                    // Filter by category if specified
                    if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("all")) {
                        if (courseCategory == null || !courseCategory.equalsIgnoreCase(category)) {
                            includeInResults = false;
                        }
                    }
                    
                    // Filter by search term if provided
                    if (search != null && !search.isEmpty()) {
                        boolean matchesSearch = false;
                        
                        if (title != null && title.toLowerCase().contains(search.toLowerCase())) {
                            matchesSearch = true;
                        } else if (description != null && description.toLowerCase().contains(search.toLowerCase())) {
                            matchesSearch = true;
                        } else if (creatorUsername != null && creatorUsername.toLowerCase().contains(search.toLowerCase())) {
                            matchesSearch = true;
                        }
                        
                        if (!matchesSearch) {
                            includeInResults = false;
                        }
                    }
                    
                    if (includeInResults) {
                        allCourses.add(course);
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
        return allCourses;
    }
    
    public Map<String, Object> getCourseById(String courseId) throws Exception {
        final Map<String, Object>[] courseData = new Map[1];
        final CountDownLatch latch = new CountDownLatch(1);
        
        courseRef.child(courseId).addListenerForSingleValueEvent(new ValueEventListener() {
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
        
        latch.await();
        return courseData[0];
    }
    
    public boolean courseExists(String courseId) throws Exception {
        final boolean[] exists = {false};
        final CountDownLatch latch = new CountDownLatch(1);
        
        courseRef.child(courseId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                exists[0] = dataSnapshot.exists();
                latch.countDown();
            }
            
            @Override
            public void onCancelled(DatabaseError databaseError) {
                latch.countDown();
            }
        });
        
        latch.await();
        return exists[0];
    }
    
    public void incrementStudentCount(String courseId) {
        courseRef.child(courseId).child("students").addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                int currentStudents = 0;
                if (dataSnapshot.exists()) {
                    currentStudents = dataSnapshot.getValue(Integer.class);
                }
                courseRef.child(courseId).child("students").setValueAsync(currentStudents + 1);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                // Do nothing
            }
        });
    }
}