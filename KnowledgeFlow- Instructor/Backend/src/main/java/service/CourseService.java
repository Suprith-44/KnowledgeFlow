package service;

import com.google.firebase.database.*;
import model.Course;
import model.Lesson;
import model.Quiz;

import java.util.*;
import java.util.concurrent.CountDownLatch;

public class CourseService {
    private final DatabaseReference courseRef;
    private final UserService userService;
    
    public CourseService() {
        this.courseRef = FirebaseDatabase.getInstance().getReference("courses");
        this.userService = new UserService();
    }
    
    public Course createCourse(Course course) throws Exception {
        // Generate a UUID for the course if not provided
        if (course.getId() == null || course.getId().isEmpty()) {
            course.setId(UUID.randomUUID().toString());
        }
        
        // Set creation timestamp
        course.setCreatedAt(System.currentTimeMillis());
        
        // Create course data map
        Map<String, Object> courseData = new HashMap<>();
        courseData.put("title", course.getTitle());
        courseData.put("description", course.getDescription());
        courseData.put("category", course.getCategory());
        courseData.put("thumbnailUrl", course.getThumbnailUrl());
        courseData.put("creatorUsername", course.getCreatorUsername());
        courseData.put("createdAt", course.getCreatedAt());
        
        if (course.getCertificateLink() != null) {
            courseData.put("certificateLink", course.getCertificateLink());
        }
        
        // Save the course
        courseRef.child(course.getId()).setValueAsync(courseData).get();
        
        // Add lessons if present
        if (course.getLessons() != null && !course.getLessons().isEmpty()) {
            for (Lesson lesson : course.getLessons()) {
                if (lesson.getId() == null) {
                    lesson.setId(UUID.randomUUID().toString());
                }
                
                Map<String, Object> lessonData = new HashMap<>();
                lessonData.put("title", lesson.getTitle());
                lessonData.put("content", lesson.getContent());
                lessonData.put("order", lesson.getOrder());
                if (lesson.getVideoUrl() != null) {
                    lessonData.put("videoUrl", lesson.getVideoUrl());
                }
                
                courseRef.child(course.getId()).child("lessons").child(lesson.getId()).setValueAsync(lessonData).get();
            }
        }
        
        // Add quizzes if present
        if (course.getQuizzes() != null && !course.getQuizzes().isEmpty()) {
            for (Quiz quiz : course.getQuizzes()) {
                if (quiz.getId() == null) {
                    quiz.setId(UUID.randomUUID().toString());
                }
                
                Map<String, Object> quizData = new HashMap<>();
                quizData.put("question", quiz.getQuestion());
                quizData.put("options", quiz.getOptions());
                quizData.put("correctOption", quiz.getCorrectOption());
                
                courseRef.child(course.getId()).child("quizzes").child(quiz.getId()).setValueAsync(quizData).get();
            }
        }
        
        // Add course to user's course list
        userService.addCourseToUser(course.getCreatorUsername(), course.getId());
        
        return course;
    }
    
    public Course getCourseById(String courseId) throws Exception {
        final Course[] retrievedCourse = {null};
        final CountDownLatch latch = new CountDownLatch(1);
        
        courseRef.child(courseId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Course course = new Course();
                    course.setId(courseId);
                    
                    // Get course basic fields
                    course.setTitle(dataSnapshot.child("title").getValue(String.class));
                    course.setDescription(dataSnapshot.child("description").getValue(String.class));
                    course.setCategory(dataSnapshot.child("category").getValue(String.class));
                    course.setThumbnailUrl(dataSnapshot.child("thumbnailUrl").getValue(String.class));
                    course.setCreatorUsername(dataSnapshot.child("creatorUsername").getValue(String.class));
                    
                    if (dataSnapshot.hasChild("certificateLink")) {
                        course.setCertificateLink(dataSnapshot.child("certificateLink").getValue(String.class));
                    }
                    
                    // Get timestamp
                    if (dataSnapshot.hasChild("createdAt")) {
                        Object createdAtObj = dataSnapshot.child("createdAt").getValue();
                        if (createdAtObj instanceof Long) {
                            course.setCreatedAt((Long) createdAtObj);
                        }
                    }
                    
                    // Get lessons
                    if (dataSnapshot.hasChild("lessons")) {
                        List<Lesson> lessons = new ArrayList<>();
                        for (DataSnapshot lessonSnapshot : dataSnapshot.child("lessons").getChildren()) {
                            Lesson lesson = new Lesson();
                            lesson.setId(lessonSnapshot.getKey());
                            lesson.setTitle(lessonSnapshot.child("title").getValue(String.class));
                            lesson.setContent(lessonSnapshot.child("content").getValue(String.class));
                            
                            if (lessonSnapshot.hasChild("order")) {
                                Object orderObj = lessonSnapshot.child("order").getValue();
                                if (orderObj instanceof Long) {
                                    lesson.setOrder(((Long) orderObj).intValue());
                                }
                            }
                            
                            if (lessonSnapshot.hasChild("videoUrl")) {
                                lesson.setVideoUrl(lessonSnapshot.child("videoUrl").getValue(String.class));
                            }
                            
                            lessons.add(lesson);
                        }
                        course.setLessons(lessons);
                    }
                    
                    // Get quizzes
                    if (dataSnapshot.hasChild("quizzes")) {
                        List<Quiz> quizzes = new ArrayList<>();
                        for (DataSnapshot quizSnapshot : dataSnapshot.child("quizzes").getChildren()) {
                            Quiz quiz = new Quiz();
                            quiz.setId(quizSnapshot.getKey());
                            quiz.setQuestion(quizSnapshot.child("question").getValue(String.class));
                            
                            if (quizSnapshot.hasChild("correctOption")) {
                                Object correctOptionObj = quizSnapshot.child("correctOption").getValue();
                                if (correctOptionObj instanceof Long) {
                                    quiz.setCorrectOption(((Long) correctOptionObj).intValue());
                                }
                            }
                            
                            // Get options
                            if (quizSnapshot.hasChild("options")) {
                                List<String> options = new ArrayList<>();
                                for (DataSnapshot optionSnapshot : quizSnapshot.child("options").getChildren()) {
                                    options.add(optionSnapshot.getValue(String.class));
                                }
                                quiz.setOptions(options);
                            }
                            
                            quizzes.add(quiz);
                        }
                        course.setQuizzes(quizzes);
                    }
                    
                    retrievedCourse[0] = course;
                }
                latch.countDown();
            }
            
            @Override
            public void onCancelled(DatabaseError databaseError) {
                latch.countDown();
            }
        });
        
        latch.await();
        return retrievedCourse[0];
    }
    
    public Map<String, Course> getCoursesByUser(String username) throws Exception {
        final Map<String, Course> userCourses = new HashMap<>();
        final CountDownLatch latch = new CountDownLatch(1);
        
        Query query = courseRef.orderByChild("creatorUsername").equalTo(username);
        
        query.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                for (DataSnapshot courseSnapshot : dataSnapshot.getChildren()) {
                    String courseId = courseSnapshot.getKey();
                    
                    Course course = new Course();
                    course.setId(courseId);
                    course.setTitle(courseSnapshot.child("title").getValue(String.class));
                    course.setDescription(courseSnapshot.child("description").getValue(String.class));
                    course.setCategory(courseSnapshot.child("category").getValue(String.class));
                    course.setThumbnailUrl(courseSnapshot.child("thumbnailUrl").getValue(String.class));
                    course.setCreatorUsername(courseSnapshot.child("creatorUsername").getValue(String.class));
                    
                    if (courseSnapshot.hasChild("certificateLink")) {
                        course.setCertificateLink(courseSnapshot.child("certificateLink").getValue(String.class));
                    }
                    
                    if (courseSnapshot.hasChild("createdAt")) {
                        Object createdAtObj = courseSnapshot.child("createdAt").getValue();
                        if (createdAtObj instanceof Long) {
                            course.setCreatedAt((Long) createdAtObj);
                        }
                    }
                    
                    userCourses.put(courseId, course);
                }
                latch.countDown();
            }
            
            @Override
            public void onCancelled(DatabaseError databaseError) {
                latch.countDown();
            }
        });
        
        latch.await();
        return userCourses;
    }
}