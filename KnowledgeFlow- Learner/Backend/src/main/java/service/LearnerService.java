package service;

import com.google.firebase.database.*;
import model.CourseProgress;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class LearnerService {
    private final DatabaseReference learnerRef;
    private final CourseService courseService;
    
    public LearnerService() {
        this.learnerRef = FirebaseDatabase.getInstance().getReference("learners");
        this.courseService = new CourseService();
    }
    
    public boolean enrollInCourse(String username, String courseId) throws Exception {
        // Check if the user is already enrolled
        List<String> enrollments = getEnrollments(username);
        
        if (enrollments != null && enrollments.contains(courseId)) {
            return false; // Already enrolled
        }
        
        // Enroll the user
        DatabaseReference userEnrollmentsRef = learnerRef.child(username).child("enrollments");
        userEnrollmentsRef.push().setValueAsync(courseId).get();
        
        // Set initial progress to 0%
        DatabaseReference progressRef = learnerRef.child(username).child("progress").child(courseId);
        progressRef.setValueAsync(0).get();
        
        // Set enrollment date
        String enrollmentDate = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
            .format(new Date());
        
        DatabaseReference enrollmentDateRef = learnerRef.child(username)
            .child("enrollmentDates").child(courseId);
        enrollmentDateRef.setValueAsync(enrollmentDate).get();
        
        // Set as last accessed date too
        DatabaseReference lastAccessedRef = learnerRef.child(username)
            .child("lastAccessed").child(courseId);
        lastAccessedRef.setValueAsync(enrollmentDate).get();
        
        // Update course's students count
        courseService.incrementStudentCount(courseId);
        
        return true;
    }
    
    public List<String> getEnrollments(String username) throws Exception {
        final List<String> enrolledCourseIds = new ArrayList<>();
        final CountDownLatch latch = new CountDownLatch(1);
        
        DatabaseReference enrollmentsRef = learnerRef.child(username).child("enrollments");
        
        enrollmentsRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    for (DataSnapshot enrollment : dataSnapshot.getChildren()) {
                        String courseId = enrollment.getValue(String.class);
                        if (courseId != null) {
                            enrolledCourseIds.add(courseId);
                        }
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
        return enrolledCourseIds;
    }
    
    public List<Map<String, Object>> getEnrolledCourses(String username) throws Exception {
        List<String> enrolledCourseIds = getEnrollments(username);
        
        if (enrolledCourseIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Get details for each enrolled course
        final Map<String, CountDownLatch> courseLatchMap = new HashMap<>();
        final Map<String, Map<String, Object>> courseDataMap = new HashMap<>();
        
        CountDownLatch allCoursesLatch = new CountDownLatch(1);
        
        DatabaseReference coursesRef = FirebaseDatabase.getInstance().getReference("courses");
        
        coursesRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                for (DataSnapshot courseSnapshot : dataSnapshot.getChildren()) {
                    String courseId = courseSnapshot.getKey();
                    
                    if (enrolledCourseIds.contains(courseId)) {
                        Map<String, Object> course = new HashMap<>();
                        course.put("id", courseId);
                        
                        for (DataSnapshot field : courseSnapshot.getChildren()) {
                            course.put(field.getKey(), field.getValue());
                        }
                        
                        // Get progress data
                        DatabaseReference progressRef = learnerRef
                            .child(username).child("progress").child(courseId);
                        
                        CountDownLatch progressLatch = new CountDownLatch(1);
                        courseLatchMap.put(courseId, progressLatch);
                        
                        progressRef.addListenerForSingleValueEvent(new ValueEventListener() {
                            @Override
                            public void onDataChange(DataSnapshot progressSnapshot) {
                                if (progressSnapshot.exists()) {
                                    course.put("progress", progressSnapshot.getValue(Integer.class));
                                } else {
                                    course.put("progress", 0); // Default progress
                                }
                                
                                // Get last accessed time 
                                DatabaseReference lastAccessedRef = learnerRef
                                    .child(username).child("lastAccessed").child(courseId);
                                
                                lastAccessedRef.addListenerForSingleValueEvent(new ValueEventListener() {
                                    @Override
                                    public void onDataChange(DataSnapshot lastAccessedSnapshot) {
                                        if (lastAccessedSnapshot.exists()) {
                                            course.put("lastAccessed", lastAccessedSnapshot.getValue(String.class));
                                        } else {
                                            course.put("lastAccessed", new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").format(new Date()));
                                        }
                                        
                                        courseDataMap.put(courseId, course);
                                        progressLatch.countDown();
                                    }
                                    
                                    @Override
                                    public void onCancelled(DatabaseError error) {
                                        course.put("lastAccessed", new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").format(new Date()));
                                        courseDataMap.put(courseId, course);
                                        progressLatch.countDown();
                                    }
                                });
                            }
                            
                            @Override
                            public void onCancelled(DatabaseError error) {
                                course.put("progress", 0);
                                course.put("lastAccessed", new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").format(new Date()));
                                courseDataMap.put(courseId, course);
                                progressLatch.countDown();
                            }
                        });
                    }
                }
                
                allCoursesLatch.countDown();
            }
            
            @Override
            public void onCancelled(DatabaseError databaseError) {
                allCoursesLatch.countDown();
            }
        });
        
        allCoursesLatch.await();
        
        // Wait for individual course data to be fetched
        for (String courseId : courseLatchMap.keySet()) {
            try {
                courseLatchMap.get(courseId).await(5, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                System.err.println("Timeout waiting for course data: " + courseId);
            }
        }
        
        // Sort by last accessed date (most recent first)
        List<Map<String, Object>> enrolledCourses = new ArrayList<>(courseDataMap.values());
        enrolledCourses.sort((c1, c2) -> {
            String date1 = (String) c1.getOrDefault("lastAccessed", "");
            String date2 = (String) c2.getOrDefault("lastAccessed", "");
            return date2.compareTo(date1); // Descending order
        });
        
        return enrolledCourses;
    }
    
    public void updateCourseProgress(CourseProgress progress) throws Exception {
        String username = progress.getUsername();
        String courseId = progress.getCourseId();
        
        // Update the lastAccessed date
        String currentDateTime = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").format(new Date());
        progress.setLastUpdated(currentDateTime);
        
        // Create the updates map
        Map<String, Object> updates = new HashMap<>();
        updates.put("completedLessons", progress.getCompletedLessons());
        updates.put("quizAnswers", progress.getQuizAnswers());
        updates.put("quizSubmitted", progress.getQuizSubmitted());
        updates.put("quizResults", progress.getQuizResults());
        updates.put("certificateUnlocked", progress.isCertificateUnlocked());
        updates.put("overallProgress", progress.getOverallProgress());
        updates.put("lastUpdated", currentDateTime);
        
        // Update last accessed time for course
        learnerRef.child(username).child("lastAccessed").child(courseId)
            .setValueAsync(currentDateTime).get();
        
        // Update the progress
        learnerRef.child(username).child("courseProgress").child(courseId)
            .updateChildrenAsync(updates).get();
    }
    
    public CourseProgress getCourseProgress(String username, String courseId) throws Exception {
        final CourseProgress progress = new CourseProgress(courseId, username);
        final CountDownLatch latch = new CountDownLatch(1);
        
        DatabaseReference progressRef = learnerRef.child(username).child("courseProgress").child(courseId);
        
        progressRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    // Get completed lessons
                    if (snapshot.hasChild("completedLessons")) {
                        List<String> completedLessons = new ArrayList<>();
                        for (DataSnapshot lessonSnapshot : snapshot.child("completedLessons").getChildren()) {
                            completedLessons.add(lessonSnapshot.getValue(String.class));
                        }
                        progress.setCompletedLessons(completedLessons);
                    }
                    
                    // Get quiz answers
                    if (snapshot.hasChild("quizAnswers")) {
                        Map<String, Object> quizAnswers = new HashMap<>();
                        for (DataSnapshot quizSnapshot : snapshot.child("quizAnswers").getChildren()) {
                            quizAnswers.put(quizSnapshot.getKey(), quizSnapshot.getValue());
                        }
                        progress.setQuizAnswers(quizAnswers);
                    }
                    
                    // Get quiz submitted status
                    if (snapshot.hasChild("quizSubmitted")) {
                        Map<String, Object> quizSubmitted = new HashMap<>();
                        for (DataSnapshot quizSnapshot : snapshot.child("quizSubmitted").getChildren()) {
                            quizSubmitted.put(quizSnapshot.getKey(), quizSnapshot.getValue());
                        }
                        progress.setQuizSubmitted(quizSubmitted);
                    }
                    
                    // Get quiz results
                    if (snapshot.hasChild("quizResults")) {
                        Map<String, Object> quizResults = new HashMap<>();
                        for (DataSnapshot quizSnapshot : snapshot.child("quizResults").getChildren()) {
                            quizResults.put(quizSnapshot.getKey(), quizSnapshot.getValue());
                        }
                        progress.setQuizResults(quizResults);
                    }
                    
                    // Get certificate unlock status
                    if (snapshot.hasChild("certificateUnlocked")) {
                        progress.setCertificateUnlocked(snapshot.child("certificateUnlocked").getValue(Boolean.class));
                    }
                    
                    // Get overall progress
                    if (snapshot.hasChild("overallProgress")) {
                        progress.setOverallProgress(snapshot.child("overallProgress").getValue(Integer.class));
                    }
                    
                    // Get last updated time
                    if (snapshot.hasChild("lastUpdated")) {
                        progress.setLastUpdated(snapshot.child("lastUpdated").getValue(String.class));
                    }
                }
                latch.countDown();
            }
            
            @Override
            public void onCancelled(DatabaseError error) {
                latch.countDown();
            }
        });
        
        latch.await();
        return progress;
    }
}