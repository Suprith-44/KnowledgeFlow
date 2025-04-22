import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle, HelpCircle, Award, AlertCircle, ExternalLink, Lock, Check, X, ArrowRight } from 'lucide-react';

export default function ViewCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeLesson, setActiveLesson] = useState(null);
  const [videoSrc, setVideoSrc] = useState('');
  
  // Track course progress
  const [completedLessons, setCompletedLessons] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [certificateUnlocked, setCertificateUnlocked] = useState(false);
  // Add to the component's state definitions near the top
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:7000/courses/${id}`, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch course: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setCourse(data);
        
        // Set the first lesson as active if available
        if (data.lessons && data.lessons.length > 0) {
          setActiveLesson(data.lessons[0]);
          processVideoUrl(data.lessons[0].videoUrl);
        }
        
        // Load saved progress from localStorage
        loadProgress(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  // Helper to check if all lessons can be marked complete
  const hasUncompletedLessons = () => {
    if (!course || !course.lessons || course.lessons.length === 0) return false;
    return completedLessons.length < course.lessons.length;
  };
  
  // Helper function to check if all answers are selected but not submitted
  const allQuizAnswersSelected = () => {
    if (!course || !course.quizzes || course.quizzes.length === 0) return false;
    
    // Check if there's at least one quiz with an answer selected but not submitted
    return course.quizzes.some(quiz => 
      !quizSubmitted[quiz.id] && quizAnswers[quiz.id] !== undefined
    );
  };
  
  // Function to mark all lessons as complete at once
  const markAllLessonsComplete = () => {
    if (!course || !course.lessons || course.lessons.length === 0) return;
    
    // Create an array with all lesson IDs
    const allLessonIds = course.lessons.map(lesson => lesson.id);
    
    // Filter to only include lessons that aren't already marked complete
    const newCompletedLessons = allLessonIds.filter(id => !completedLessons.includes(id));
    
    if (newCompletedLessons.length > 0) {
      // Combine existing completed lessons with new ones
      const updatedCompletedLessons = [...completedLessons, ...newCompletedLessons];
      setCompletedLessons(updatedCompletedLessons);
      
      // Check if all quizzes are completed
      const allQuizzesCompleted = course.quizzes && course.quizzes.length > 0 ? 
        course.quizzes.every(quiz => quizSubmitted[quiz.id]) : true;
      
      // If everything is completed, unlock certificate
      if (!certificateUnlocked) {
        setCertificateUnlocked(true);
      }
    }
  };

  // Update the submitAllQuizAnswers function to handle different option counts
const submitAllQuizAnswers = () => {
  if (!course || !course.quizzes || course.quizzes.length === 0) return;
  
  const newSubmitted = { ...quizSubmitted };
  const newResults = { ...quizResults };
  
  // Process each quiz that has an answer selected but not yet submitted
  course.quizzes.forEach(quiz => {
    // Skip quizzes that are already submitted
    if (newSubmitted[quiz.id] || quizSubmitted[quiz.id]) return;
    
    // Only process quizzes that have an answer selected
    if (quizAnswers[quiz.id] !== undefined) {
      // Mark as submitted
      newSubmitted[quiz.id] = true;
      
      // Check if answer is correct
      newResults[quiz.id] = quizAnswers[quiz.id] === quiz.correctOption;
    }
  });
  
  // Only update state if there's something to update
  if (Object.keys(newSubmitted).length > 0) {
    // Update state
    setQuizSubmitted({...quizSubmitted, ...newSubmitted});
    setQuizResults({...quizResults, ...newResults});
    
    // Check if all lessons are completed
    const allLessonsCompleted = completedLessons.length === course.lessons.length;
    
    // If everything is completed after this submission, unlock certificate
    const allQuizzesNowCompleted = course.quizzes.every(quiz => 
      newSubmitted[quiz.id] || quizSubmitted[quiz.id]
    );
    
    if (allLessonsCompleted && allQuizzesNowCompleted && !certificateUnlocked) {
      setCertificateUnlocked(true);
    }
  }
};

  // Enhance the loadProgress function to also fetch from server when needed
  const loadProgress = async (courseData) => {
    try {
      // Get current user
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const progressKey = `course_${id}_${user.username}`;
      const savedProgress = localStorage.getItem(progressKey);
      
      // First try to load from localStorage
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setCompletedLessons(progress.completedLessons || []);
        setQuizAnswers(progress.quizAnswers || {});
        setQuizSubmitted(progress.quizSubmitted || {});
        setQuizResults(progress.quizResults || {});
        setCertificateUnlocked(progress.certificateUnlocked || false);
        
        // Calculate overall progress
        calculateProgress(courseData, progress.completedLessons || [], progress.quizSubmitted || {});
      } else {
        // If not in localStorage, try to fetch from server
        try {
          const response = await fetch(`http://localhost:7000/api/users/${user.username}/courses/${id}/progress`);
          
          if (response.ok) {
            const serverProgress = await response.json();
            
            // Update state with server data
            setCompletedLessons(serverProgress.completedLessons || []);
            setQuizAnswers(serverProgress.quizAnswers || {});
            setQuizSubmitted(serverProgress.quizSubmitted || {});
            setQuizResults(serverProgress.quizResults || {});
            setCertificateUnlocked(serverProgress.certificateUnlocked || false);
            
            // Calculate overall progress
            calculateProgress(
              courseData, 
              serverProgress.completedLessons || [], 
              serverProgress.quizSubmitted || {}
            );
            
            // Also update localStorage
            localStorage.setItem(progressKey, JSON.stringify(serverProgress));
          }
        } catch (serverError) {
          console.error("Error fetching progress from server:", serverError);
        }
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };
  
  // Modify the saveProgress function to also update server
  const saveProgress = () => {
    try {
      // Get current user
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const progressKey = `course_${id}_${user.username}`;
      
      const progressData = {
        completedLessons,
        quizAnswers,
        quizSubmitted,
        quizResults,
        certificateUnlocked,
        lastUpdated: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem(progressKey, JSON.stringify(progressData));
      
      // Also update API
      updateProgressOnServer(progressData);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Add this function to sync progress with the server
  const updateProgressOnServer = async (progressData) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      
      const response = await fetch(`http://localhost:7000/api/users/${user.username}/courses/${id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...progressData,
          overallProgress: overallProgress
        }),
      });

      if (!response.ok) {
        console.error("Failed to update progress on server");
      }
    } catch (error) {
      console.error("Error updating progress on server:", error);
    }
  };

  // Update the calculateProgress function to count all quiz attempts, not just successful ones
// Update the calculateProgress function to count all quiz attempts, not just successful ones
const calculateProgress = (courseData, completed, submitted) => {
  if (!courseData) return 0;
  
  const totalItems = (courseData.lessons?.length || 0) + (courseData.quizzes?.length || 0);
  if (totalItems === 0) return 100; // Nothing to complete
  
  // Count both completed lessons and any quiz that has been submitted (right or wrong)
  const completedItems = completed.length + Object.keys(submitted).length;
  const percentage = Math.round((completedItems / totalItems) * 100);
  
  setOverallProgress(percentage);
  
  // Unlock certificate if everything is attempted
  const allLessonsCompleted = completed.length === courseData.lessons?.length;
  const allQuizzesAttempted = Object.keys(submitted).length === courseData.quizzes?.length;
  
  if (percentage === 100 && allLessonsCompleted && allQuizzesAttempted && !certificateUnlocked) {
    setCertificateUnlocked(true);
  }
  
  return percentage;
};

  useEffect(() => {
    if (course) {
      calculateProgress(course, completedLessons, quizSubmitted);
      saveProgress();
    }
  }, [completedLessons, quizSubmitted, certificateUnlocked]);

  // Function to process YouTube or other video URLs
  const processVideoUrl = (url) => {
    if (!url) {
      setVideoSrc('');
      return;
    }

    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Extract video ID
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1];
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
        const questionMarkPosition = videoId.indexOf('?');
        if (questionMarkPosition !== -1) {
          videoId = videoId.substring(0, questionMarkPosition);
        }
      }
      
      if (videoId) {
        setVideoSrc(`https://www.youtube.com/embed/${videoId}`);
      } else {
        setVideoSrc(url); // If parsing fails, use the original URL
      }
    } 
    // Handle Vimeo URLs (if needed)
    else if (url.includes('vimeo.com')) {
      // Extract Vimeo ID
      const vimeoId = url.split('vimeo.com/')[1];
      if (vimeoId) {
        setVideoSrc(`https://player.vimeo.com/video/${vimeoId}`);
      } else {
        setVideoSrc(url);
      }
    } 
    // For other URLs, use them directly
    else {
      setVideoSrc(url);
    }
  };

  const handleLessonClick = (lesson) => {
    setActiveLesson(lesson);
    processVideoUrl(lesson.videoUrl);
    setActiveTab('lessons');
  };
  
  // Mark a lesson as completed
  const markLessonCompleted = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      const updatedCompletedLessons = [...completedLessons, lessonId];
      setCompletedLessons(updatedCompletedLessons);
      
      // Check if all lessons are now completed
      const allLessonsCompleted = updatedCompletedLessons.length === course.lessons.length;
      
      // Check if all quizzes are completed
      const allQuizzesCompleted = course.quizzes && course.quizzes.length > 0 ? 
        course.quizzes.every(quiz => quizSubmitted[quiz.id]) : true;
      
      // If everything is completed, unlock certificate
      if (allLessonsCompleted && allQuizzesCompleted && !certificateUnlocked) {
        setCertificateUnlocked(true);
      }
    }
  };
  
  // Check if a lesson is completed
  const isLessonCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };
  
  // Get next available lesson or quiz
  const getNextContent = () => {
    if (!course) return null;
    
    // Get current lesson index
    const currentLessonIndex = activeLesson ? 
      course.lessons.findIndex(lesson => lesson.id === activeLesson.id) : -1;
    
    // If there's another lesson, return it
    if (currentLessonIndex >= 0 && currentLessonIndex < course.lessons.length - 1) {
      return { type: 'lesson', content: course.lessons[currentLessonIndex + 1] };
    }
    
    // If we've completed all lessons, check for unfinished quizzes
    if (course.quizzes && course.quizzes.length > 0) {
      for (const quiz of course.quizzes) {
        if (!quizSubmitted[quiz.id]) {
          return { type: 'quiz', content: quiz };
        }
      }
    }
    
    // If everything is completed, return certificate
    if (overallProgress === 100) {
      return { type: 'certificate' };
    }
    
    return null;
  };
  
  // Navigate to next content
  const goToNextContent = () => {
    const next = getNextContent();
    
    if (!next) return;
    
    if (next.type === 'lesson') {
      handleLessonClick(next.content);
    } else if (next.type === 'quiz') {
      setActiveTab('quizzes');
    } else if (next.type === 'certificate') {
      setActiveTab('certificate');
    }
  };
  
  // Fix the handleQuizAnswerSelect function to maintain independent selections
const handleQuizAnswerSelect = (quizId, answerIndex) => {
  // Create a new object to avoid modifying state directly
  setQuizAnswers(prevAnswers => ({
    ...prevAnswers,
    [quizId]: answerIndex
  }));
};
  
  // Update the submitQuizAnswer function to properly handle one quiz at a time
const submitQuizAnswer = (quizId, correctOption) => {
  // Check if the selected answer is correct but don't show results yet
  const selectedAnswer = quizAnswers[quizId];
  
  // Don't proceed if no answer selected
  if (selectedAnswer === undefined) return;
  
  // Just mark as submitted, but don't show results
  setQuizSubmitted(prev => ({
    ...prev,
    [quizId]: true
  }));
  
  // Save progress immediately but don't update certificate status
  saveProgress();
};

// Add a function to check if all quizzes have answers selected
const areAllQuestionsAnswered = () => {
  if (!course?.quizzes?.length) return false;
  return course.quizzes.every(quiz => quizAnswers[quiz.id] !== undefined);
};

// Add a function to submit all answers at once
// Update submitAllAnswers function to properly count all quizzes
const submitAllAnswers = () => {
  if (!course || !course.quizzes || course.quizzes.length === 0) return;
  
  const newSubmitted = { ...quizSubmitted };
  const newResults = { ...quizResults };
  
  // Process ALL quizzes that have answers selected
  course.quizzes.forEach(quiz => {
    // Skip quizzes that are already submitted
    if (quizSubmitted[quiz.id]) return;
    
    // Only process quizzes that have an answer selected
    if (quizAnswers[quiz.id] !== undefined) {
      // Mark as submitted (this is key for progress calculation)
      newSubmitted[quiz.id] = true;
      
      // Check if answer is correct
      newResults[quiz.id] = quizAnswers[quiz.id] === quiz.correctOption;
    }
  });
  
  // Only update state if there's something to update
  if (Object.keys(newSubmitted).length > 0) {
    // Update state with all the submitted quizzes
    setQuizSubmitted(prev => ({...prev, ...newSubmitted}));
    setQuizResults(prev => ({...prev, ...newResults}));
    
    // Calculate new progress after submission
    const allLessonsCompleted = completedLessons.length === course.lessons.length;
    
    // If all lessons and quizzes are completed, unlock certificate
    // This uses the updated submission state that includes all newly submitted quizzes
    const updatedSubmitted = {...quizSubmitted, ...newSubmitted};
    const allQuizzesSubmitted = course.quizzes.every(quiz => updatedSubmitted[quiz.id]);
    
    if (allLessonsCompleted && allQuizzesSubmitted && !certificateUnlocked) {
      setCertificateUnlocked(true);
    }
  }
};

  // Add a comprehensive function to complete the entire course
const completeEntireCourse = () => {
  if (!course) return;
  
  // Mark all lessons as complete
  if (course.lessons && course.lessons.length > 0) {
    const allLessonIds = course.lessons.map(lesson => lesson.id);
    setCompletedLessons(allLessonIds);
  }
  
  // Submit all quiz answers (including those not yet answered)
  if (course.quizzes && course.quizzes.length > 0) {
    const newQuizAnswers = { ...quizAnswers };
    const newQuizSubmitted = { ...quizSubmitted };
    const newQuizResults = { ...quizResults };
    
    course.quizzes.forEach(quiz => {
      if (!quizSubmitted[quiz.id]) {
        // If no answer selected, select the correct option to ensure passing
        if (quizAnswers[quiz.id] === undefined) {
          newQuizAnswers[quiz.id] = quiz.correctOption;
        }
        
        // Mark as submitted
        newQuizSubmitted[quiz.id] = true;
        
        // Set result based on selected answer
        newQuizResults[quiz.id] = 
          (newQuizAnswers[quiz.id] !== undefined ? newQuizAnswers[quiz.id] : quizAnswers[quiz.id]) === quiz.correctOption;
      }
    });
    
    setQuizAnswers(newQuizAnswers);
    setQuizSubmitted(newQuizSubmitted);
    setQuizResults(newQuizResults);
  }
  
  // Unlock certificate
  setCertificateUnlocked(true);
};

  const goBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <div className="flex items-center text-red-500 mb-4">
            <AlertCircle className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={goBack}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Course Not Found</h2>
          <p className="text-gray-700 mb-4">The course you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={goBack}
              className="mr-4 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 truncate">{course.title}</h1>
          </div>
          
          {/* Progress indicator */}
          <div className="hidden sm:flex items-center">
            <div className="w-48 bg-gray-200 rounded-full h-2.5 mr-2">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-600">{overallProgress}% complete</span>
          </div>
        </div>
      </header>

      {/* Course Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Course Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg sticky top-6">
              {/* Course Image */}
              <div className="relative">
                <img 
                  src={course.thumbnailUrl} 
                  alt={course.title} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/640x360?text=Course+Image";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <p className="text-xs font-medium uppercase tracking-wider">{course.category}</p>
                    <h3 className="text-lg font-bold">{course.title}</h3>
                  </div>
                </div>
              </div>

              {/* Course Stats */}
              <div className="border-b border-gray-200">
                <div className="px-4 py-5 sm:px-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Lessons</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {course.lessons ? course.lessons.length : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quizzes</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {course.quizzes ? course.quizzes.length : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Progress</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {overallProgress}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Creator */}
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-500">Created by</p>
                <p className="mt-1 text-sm text-indigo-600 font-medium">@{course.creatorUsername}</p>
              </div>

              {/* Course Navigation */}
              <nav className="px-2 py-4">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                      activeTab === 'overview'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Overview
                  </button>
                  
                  {course.lessons && course.lessons.length > 0 && (
                    <button
                      onClick={() => setActiveTab('lessons')}
                      className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md w-full ${
                        activeTab === 'lessons'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>Lessons</span>
                      <span className="bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                        {completedLessons.length}/{course.lessons.length}
                      </span>
                    </button>
                  )}
                  
                  {course.quizzes && course.quizzes.length > 0 && (
                    <button
                      onClick={() => setActiveTab('quizzes')}
                      className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md w-full ${
                        activeTab === 'quizzes'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>Quizzes</span>
                      <span className="bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                        {Object.keys(quizSubmitted).length}/{course.quizzes.length}
                      </span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setActiveTab('certificate')}
                    disabled={!certificateUnlocked}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                      !certificateUnlocked
                        ? 'text-gray-400 cursor-not-allowed'
                        : activeTab === 'certificate'
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {certificateUnlocked ? (
                      <span>Certificate</span>
                    ) : (
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        <span>Certificate (Locked)</span>
                      </div>
                    )}
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <motion.div 
            className="mt-8 lg:mt-0 lg:col-span-2"
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Course Overview</h2>
                  
                  <div className="prose max-w-none">
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                  
                  {course.lessons && course.lessons.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-md font-medium text-gray-900 mb-2">Course Content</h3>
                      <ul className="border rounded-md divide-y divide-gray-200">
                        {course.lessons.map((lesson, index) => (
                          <li key={lesson.id} className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="mr-3 flex-shrink-0">
                                {isLessonCompleted(lesson.id) ? (
                                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    {index + 1}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                                {lesson.description && (
                                  <p className="text-xs text-gray-500">{lesson.description}</p>
                                )}
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                setActiveTab('lessons');
                                handleLessonClick(lesson);
                              }}
                              className="ml-3 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Watch
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {course.quizzes && course.quizzes.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-md font-medium text-gray-900 mb-2">Assessment</h3>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <div className="flex items-center">
                          <HelpCircle className="h-5 w-5 text-indigo-600 mr-2" />
                          <p className="text-sm text-gray-700">This course includes {course.quizzes.length} quiz(zes) to test your knowledge.</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('quizzes')}
                          className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Quizzes
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Certificate</h3>
                    <div className="border rounded-md p-4 bg-gray-50">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-indigo-600 mr-2" />
                        <p className="text-sm text-gray-700">
                          {certificateUnlocked 
                            ? "Congratulations! You have completed all the course content and unlocked your certificate."
                            : "Complete all lessons and quizzes to earn your certificate."}
                        </p>
                      </div>
                      {certificateUnlocked ? (
                        <button
                          onClick={() => setActiveTab('certificate')}
                          className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Certificate
                        </button>
                      ) : (
                        <div className="mt-3 flex items-center">
                          <div className="w-48 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${overallProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{overallProgress}% completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Lessons Tab - Updated to handle multiple lessons better */}
{activeTab === 'lessons' && (
  <div>
    {/* Video Player */}
    {activeLesson ? (
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          src={videoSrc}
          title={activeLesson.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-[400px]"
        ></iframe>
      </div>
    ) : (
      <div className="h-[400px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Please select a lesson to start learning</p>
      </div>
    )}

    {/* Lesson Info */}
    {activeLesson && (
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-gray-900">{activeLesson.title}</h2>
          {isLessonCompleted(activeLesson.id) ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </span>
          ) : null}
        </div>
        
        {activeLesson.description && (
          <p className="mt-2 text-gray-600">{activeLesson.description}</p>
        )}
        
        <div className="mt-6 flex justify-between">
          {/* Original video link */}
          <div className="flex items-center text-sm text-gray-500">
            <ExternalLink className="h-4 w-4 mr-1" />
            <a 
              href={activeLesson.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Open video in new tab
            </a>
          </div>
          
          {/* Mark as complete button */}
          {!isLessonCompleted(activeLesson.id) && (
            <button
              onClick={() => markLessonCompleted(activeLesson.id)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Mark as Complete
            </button>
          )}
          
          {/* Next lesson/content button */}
          {isLessonCompleted(activeLesson.id) && getNextContent() && (
            <button
              onClick={goToNextContent}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </button>
          )}
        </div>
      </div>
    )}

    {/* Lesson List - Updated to show better visual hierarchy */}
    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-medium text-gray-900">All Lessons</h3>
    
    {hasUncompletedLessons() && (
      <button
        onClick={markAllLessonsComplete}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <CheckCircle className="h-4 w-4 mr-1.5" />
        Mark All Complete
      </button>
    )}
  </div>
  
  <div className="space-y-2">
    {course.lessons && course.lessons.map((lesson, index) => (
      <div 
        key={lesson.id}
        className={`w-full text-left p-3 rounded-md border ${
          activeLesson && activeLesson.id === lesson.id
            ? 'border-indigo-200 bg-indigo-50'
            : isLessonCompleted(lesson.id)
            ? 'border-green-100 bg-white'
            : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleLessonClick(lesson)}
            className="flex flex-1 items-center text-left focus:outline-none"
          >
            <div className="mr-3 flex-shrink-0">
              {isLessonCompleted(lesson.id) ? (
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4" />
                </div>
              ) : activeLesson && activeLesson.id === lesson.id ? (
                <Play className="w-6 h-6 text-indigo-600" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-600">
                  {index + 1}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                (activeLesson && activeLesson.id === lesson.id) ? 'text-indigo-700' : 
                isLessonCompleted(lesson.id) ? 'text-gray-600' : 'text-gray-900'
              }`}>
                {lesson.title}
              </p>
              {lesson.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{lesson.description}</p>
              )}
            </div>
          </button>
          
          {/* Add mark as complete button for each lesson */}
          {!isLessonCompleted(lesson.id) && (
            <button
              onClick={() => markLessonCompleted(lesson.id)}
              className="ml-2 inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
              title="Mark as complete"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
</div>
  </div>
)}

              {/* Quizzes Tab - Updated to handle multiple quizzes better */}
{activeTab === 'quizzes' && (
  <div className="px-4 py-5 sm:p-6">
    <h2 className="text-lg font-medium text-gray-900 mb-4">Course Quizzes</h2>
    
    {course.quizzes && course.quizzes.length > 0 ? (
      <div>
        {/* Quiz progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Quiz Progress</span>
            <span className="text-sm font-medium text-indigo-600">
              {Object.keys(quizResults).length}/{course.quizzes.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${(Object.keys(quizResults).length / course.quizzes.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Quiz Status Summary */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {course.quizzes.map((quiz, index) => (
            <button
              key={quiz.id}
              onClick={() => setActiveQuizIndex(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                activeQuizIndex === index 
                  ? 'ring-2 ring-offset-2 ring-indigo-500 bg-indigo-600 text-white' 
                  : quizResults[quiz.id] !== undefined
                    ? quizResults[quiz.id] 
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                    : quizAnswers[quiz.id] !== undefined
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
              title={`Question ${index + 1}${
                quizResults[quiz.id] !== undefined 
                  ? quizResults[quiz.id] ? ' (Correct)' : ' (Incorrect)' 
                  : quizAnswers[quiz.id] !== undefined ? ' (Answered)' : ''
              }`}
            >
              {quizResults[quiz.id] !== undefined ? (
                quizResults[quiz.id] ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </button>
          ))}
        </div>

        {/* Quiz Questions */}
        {course.quizzes[activeQuizIndex] && (
          <div className="border rounded-md p-5 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-gray-900">
                Question {activeQuizIndex + 1} of {course.quizzes.length}
              </h3>
              
              {/* Navigation arrows */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveQuizIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeQuizIndex === 0}
                  className={`p-1 rounded ${activeQuizIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveQuizIndex(prev => Math.min(course.quizzes.length - 1, prev + 1))}
                  disabled={activeQuizIndex === course.quizzes.length - 1}
                  className={`p-1 rounded ${activeQuizIndex === course.quizzes.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Current Quiz Question */}
            <div className="mb-5">
              <h4 className="text-lg font-medium text-gray-900 mb-4">{course.quizzes[activeQuizIndex].question}</h4>
            </div>
            
            {/* Quiz Options - Always selectable until final submission */}
<div className="space-y-3">
  {Array.isArray(course.quizzes[activeQuizIndex].options) && 
   course.quizzes[activeQuizIndex].options.map((option, optionIndex) => {
    const quiz = course.quizzes[activeQuizIndex];
    const quizId = quiz.id;
    // Important: Use quizId to get the specific answer for this quiz
    const isSelected = quizAnswers[quizId] === optionIndex;
    const isResultShown = quizResults[quizId] !== undefined;
    const isCorrect = optionIndex === quiz.correctOption;
    
    return (
      <div 
        key={optionIndex}
        onClick={() => !isResultShown && handleQuizAnswerSelect(quizId, optionIndex)}
        className={`px-4 py-3 rounded-md border transition-all ${
          isResultShown
            ? isCorrect
              ? 'border-green-300 bg-green-50'
              : isSelected
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200'
            : isSelected
            ? 'border-indigo-300 bg-indigo-50 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        } ${!isResultShown ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex items-center">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
            isResultShown
              ? isCorrect
                ? 'bg-green-100 text-green-600'
                : isSelected
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-500'
              : isSelected
              ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {String.fromCharCode(65 + optionIndex)}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              isResultShown
                ? isCorrect
                  ? 'text-green-700'
                  : isSelected
                    ? 'text-red-700'
                    : 'text-gray-500'
                : isSelected
                ? 'text-indigo-700'
                : 'text-gray-700'
            }`}>
              {option}
            </p>
          </div>
          {isResultShown && (
            isCorrect ? (
              <Check className="h-5 w-5 text-green-500 ml-2" />
            ) : isSelected ? (
              <X className="h-5 w-5 text-red-500 ml-2" />
            ) : null
          )}
        </div>
      </div>
    );
  })}
</div>

            
            {/* Navigation buttons */}
            <div className="mt-6 flex justify-between">
              <div>
                {quizResults[course.quizzes[activeQuizIndex].id] !== undefined && (
                  <div className={`rounded-md p-3 ${
                    quizResults[course.quizzes[activeQuizIndex].id]
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {quizResults[course.quizzes[activeQuizIndex].id] ? (
                      <div className="flex">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <p className="text-sm text-green-700">Correct! Good job!</p>
                      </div>
                    ) : (
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                        <p className="text-sm text-red-700">
                          Not quite right. The correct answer is option {String.fromCharCode(65 + course.quizzes[activeQuizIndex].correctOption)}.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                {activeQuizIndex < course.quizzes.length - 1 && (
                  <button
                    onClick={() => setActiveQuizIndex(activeQuizIndex + 1)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 mr-2"
                  >
                    Next Question
                  </button>
                )}
                
                {activeQuizIndex === course.quizzes.length - 1 && quizAnswers[course.quizzes[activeQuizIndex].id] !== undefined && (
                  <button
                    onClick={() => setActiveQuizIndex(0)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 mr-2"
                  >
                    Review All Questions
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Submit All Answers Button - Only show when we haven't submitted but have chosen answers */}
        {areAllQuestionsAnswered() && Object.keys(quizResults).length === 0 && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-sm font-medium text-gray-900">Ready to Submit?</h3>
                <p className="text-sm text-gray-500">
                  You've answered all {course.quizzes.length} questions. Review your answers before submitting.
                </p>
              </div>
              
              <button
                onClick={submitAllAnswers}
                className="px-4 py-2 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit All Answers
              </button>
            </div>
          </div>
        )}
        
        {/* Show certificate button if all quizzes are evaluated (not just answered) */}
        {Object.keys(quizResults).length === course.quizzes.length && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Quiz Results</h3>
                <p className="text-sm text-gray-500">
                  You correctly answered {Object.values(quizResults).filter(r => r).length} out of {course.quizzes.length} questions.
                </p>
              </div>
              
              <button
                onClick={() => {
                  // Only try to unlock the certificate if we've actually completed everything
                  const allLessonsCompleted = completedLessons.length === course.lessons.length;
                  const allQuizzesCompleted = Object.keys(quizResults).length === course.quizzes.length;
                  
                  if (allLessonsCompleted && allQuizzesCompleted && !certificateUnlocked) {
                    setCertificateUnlocked(true);
                  }
                  setActiveTab('certificate');
                }}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm ${
                  certificateUnlocked 
                    ? 'text-white bg-indigo-600 hover:bg-indigo-700'
                    : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                }`}
                disabled={!certificateUnlocked && completedLessons.length !== course.lessons.length}
              >
                {certificateUnlocked ? (
                  <>
                    <Award className="h-5 w-5 mr-2" />
                    View Your Certificate
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Complete All Lessons First 
                    ({completedLessons.length}/{course.lessons.length})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Quizzes Available</h3>
        <p className="text-sm text-gray-500">This course doesn't have any quiz questions.</p>
      </div>
    )}
  </div>
)}

              {/* Certificate Tab */}
              {activeTab === 'certificate' && (
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Course Certificate</h2>
                  
                  {!certificateUnlocked ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Certificate Locked</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                        Complete all lessons and quizzes to unlock your course certificate.
                      </p>
                      
                      <div className="w-48 mx-auto bg-gray-200 rounded-full h-2.5 mb-2">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${overallProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mb-6">{overallProgress}% completed</p>
                      
                      <button
                        onClick={() => setActiveTab('overview')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      >
                        Return to Course Overview
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="border-4 border-double border-indigo-200 bg-indigo-50 rounded-lg p-8 text-center">
                        <div className="mb-4">
                          <Award className="h-16 w-16 text-indigo-600 mx-auto" />
                        </div>
                        
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-gray-900">Certificate of Completion</h2>
                          <p className="mt-1 text-sm text-gray-500">This certifies that</p>
                          <p className="mt-2 text-xl font-bold text-indigo-700">
                            {JSON.parse(localStorage.getItem('user'))?.name || JSON.parse(localStorage.getItem('user'))?.username || "Learner"}
                          </p>
                          <p className="mt-3 text-sm text-gray-500">has successfully completed the course</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">{course.title}</p>
                          
                          <div className="mt-6 text-sm text-gray-500">Completed on {new Date().toLocaleDateString()}</div>
                          
                          <div className="mt-8 border-t border-gray-200 pt-6 flex justify-center">
                            <div className="text-indigo-600 font-bold text-lg">KnowledgeFlow</div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">Certificate ID: {course.id}-{JSON.parse(localStorage.getItem('user'))?.username}-{Date.now()}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <button
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          onClick={() => window.print()}
                        >
                          Print Certificate
                        </button>
                      </div>
                      
                      <div className="mt-6 rounded-md bg-blue-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Award className="h-5 w-5 text-blue-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Share Your Achievement</h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>
                                Congratulations on completing this course! Don't forget to share your achievement
                                on your resume and professional networks.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Add this to the Overview tab, right after the certificate section */}
      {activeTab === 'overview' && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-md font-medium text-gray-900">Quick Completion</h3>
              <p className="text-sm text-gray-500">
                Need to complete this course quickly? Use this option to mark everything as complete at once.
              </p>
            </div>
            
            {overallProgress < 100 && (
              <button
                onClick={completeEntireCourse}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Award className="h-5 w-5 mr-2" />
                Complete Course & Get Certificate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}