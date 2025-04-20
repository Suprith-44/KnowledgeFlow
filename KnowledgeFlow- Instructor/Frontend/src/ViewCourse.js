import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle, HelpCircle, Award, AlertCircle, ExternalLink } from 'lucide-react';

export default function ViewCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeLesson, setActiveLesson] = useState(null);
  const [videoSrc, setVideoSrc] = useState('');

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button 
            onClick={goBack}
            className="mr-4 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 truncate">{course.title}</h1>
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
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(course.createdAt).toLocaleDateString()}
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
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                        activeTab === 'lessons'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Lessons
                    </button>
                  )}
                  
                  {course.quizzes && course.quizzes.length > 0 && (
                    <button
                      onClick={() => setActiveTab('quizzes')}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                        activeTab === 'quizzes'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Quizzes
                    </button>
                  )}
                  
                  {course.certificateLink && (
                    <button
                      onClick={() => setActiveTab('certificate')}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                        activeTab === 'certificate'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Certificate
                    </button>
                  )}
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
                              <div className="mr-3 flex-shrink-0 text-indigo-600">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                  {index + 1}
                                </div>
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
                  
                  {course.certificateLink && (
                    <div className="mt-8">
                      <h3 className="text-md font-medium text-gray-900 mb-2">Certificate</h3>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-indigo-600 mr-2" />
                          <p className="text-sm text-gray-700">Complete all lessons and quizzes to earn your certificate.</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('certificate')}
                          className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Certificate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lessons Tab */}
              {activeTab === 'lessons' && (
                <div>
                  {/* Video Player */}
                  {activeLesson && (
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
                  )}

                  {/* Lesson Info */}
                  {activeLesson && (
                    <div className="px-4 py-5 sm:p-6">
                      <h2 className="text-xl font-bold text-gray-900">{activeLesson.title}</h2>
                      {activeLesson.description && (
                        <p className="mt-2 text-gray-600">{activeLesson.description}</p>
                      )}
                      
                      {/* Original video link */}
                      <div className="mt-4 flex items-center text-sm text-gray-500">
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
                    </div>
                  )}

                  {/* Lesson List */}
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">All Lessons</h3>
                    <div className="space-y-2">
                      {course.lessons && course.lessons.map((lesson, index) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                            activeLesson && activeLesson.id === lesson.id
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="mr-3 flex-shrink-0 text-indigo-600">
                            {activeLesson && activeLesson.id === lesson.id ? (
                              <Play className="h-5 w-5" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              activeLesson && activeLesson.id === lesson.id ? 'text-indigo-700' : 'text-gray-900'
                            } truncate`}>
                              {lesson.title}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quizzes Tab */}
              {activeTab === 'quizzes' && (
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Course Quizzes</h2>
                  
                  {course.quizzes && course.quizzes.length > 0 ? (
                    <div className="space-y-6">
                      {course.quizzes.map((quiz, quizIndex) => (
                        <div key={quiz.id} className="border rounded-md p-4">
                          <h3 className="text-md font-medium text-gray-900 flex items-start">
                            <span className="bg-indigo-100 text-indigo-800 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                              {quizIndex + 1}
                            </span>
                            <span>{quiz.question}</span>
                          </h3>
                          
                          <div className="mt-3 space-y-2">
                            {quiz.options.map((option, optionIndex) => (
                              <div 
                                key={optionIndex}
                                className={`px-3 py-2 rounded-md border ${
                                  optionIndex === quiz.correctOption
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className="mr-2 text-sm font-medium text-gray-700">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </div>
                                  <div className="flex-1">{option}</div>
                                  {optionIndex === quiz.correctOption && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No quiz questions available for this course.</p>
                  )}
                </div>
              )}

              {/* Certificate Tab */}
              {activeTab === 'certificate' && (
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Course Certificate</h2>
                  
                  {course.certificateLink ? (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Complete all lessons and quizzes to receive your certificate of completion.
                      </p>
                      
                      <div className="border rounded-md p-4 bg-indigo-50">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-indigo-600 mr-2" />
                          <p className="text-sm font-medium text-indigo-700">Certificate Preview</p>
                        </div>
                        <div className="mt-3">
                          <a 
                            href={course.certificateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View Certificate Template
                          </a>
                        </div>
                      </div>
                      
                      <div className="rounded-md bg-yellow-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Note</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                Your personalized certificate will include your name, course title, and completion date
                                once you've completed all course material.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No certificate is available for this course.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}