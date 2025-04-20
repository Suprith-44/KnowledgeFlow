import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Film, FileText, HelpCircle, Award } from 'lucide-react';

export default function CreateCoursePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Course data state
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    thumbnailUrl: '',
    certificateLink: '',
    lessons: [],
    quizzes: []
  });

  // Temporary states for adding new items
  const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', description: '' });
  const [newQuiz, setNewQuiz] = useState({ 
    question: '', 
    options: ['', '', '', ''], 
    correctOption: 0 
  });

  // Check for authentication
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      // Redirect to login if no user data found
      window.location.href = '/login';
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, []);

  // Handle input change for course basic details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input change for new lesson
  const handleLessonChange = (e) => {
    const { name, value } = e.target;
    setNewLesson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input change for new quiz
  const handleQuizQuestionChange = (e) => {
    setNewQuiz(prev => ({
      ...prev,
      question: e.target.value
    }));
  };

  // Handle input change for quiz options
  const handleQuizOptionChange = (index, value) => {
    setNewQuiz(prev => {
      const updatedOptions = [...prev.options];
      updatedOptions[index] = value;
      return { ...prev, options: updatedOptions };
    });
  };

  // Handle correct option selection
  const handleCorrectOptionChange = (index) => {
    setNewQuiz(prev => ({
      ...prev,
      correctOption: index
    }));
  };

  // Add a new lesson
  const addLesson = () => {
    // Validate lesson data
    if (!newLesson.title || !newLesson.videoUrl) {
      alert("Please enter a lesson title and video URL");
      return;
    }

    setCourseData(prev => ({
      ...prev,
      lessons: [...prev.lessons, { ...newLesson, id: Date.now() }]
    }));
    
    // Reset new lesson form
    setNewLesson({ title: '', videoUrl: '', description: '' });
  };

  // Remove a lesson
  const removeLesson = (lessonId) => {
    setCourseData(prev => ({
      ...prev,
      lessons: prev.lessons.filter(lesson => lesson.id !== lessonId)
    }));
  };

  // Add a new quiz question
  const addQuizQuestion = () => {
    // Validate quiz data
    if (!newQuiz.question || newQuiz.options.some(opt => !opt)) {
      alert("Please fill in the question and all options");
      return;
    }

    setCourseData(prev => ({
      ...prev,
      quizzes: [...prev.quizzes, { ...newQuiz, id: Date.now() }]
    }));
    
    // Reset new quiz form
    setNewQuiz({ 
      question: '', 
      options: ['', '', '', ''], 
      correctOption: 0 
    });
  };

  // Remove a quiz question
  const removeQuizQuestion = (quizId) => {
    setCourseData(prev => ({
      ...prev,
      quizzes: prev.quizzes.filter(quiz => quiz.id !== quizId)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!courseData.title || !courseData.description || !courseData.thumbnailUrl) {
      alert("Please fill in all required fields in Basic Info");
      setActiveTab('basic');
      return;
    }

    if (courseData.lessons.length === 0) {
      alert("Please add at least one lesson");
      setActiveTab('lessons');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send the course data to the API
      const response = await fetch('http://localhost:7000/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...courseData,
          username: user.username,
          createdAt: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create course');
      }
      
      const data = await response.json();
      console.log("Course created:", data);
      
      // Redirect to dashboard
      alert("Course created successfully!");
      window.location.href = '/dashboard';
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    window.location.href = '/dashboard';
  };

  if (!user) return null; // Don't render until user data is loaded

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
            <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          </div>
          
          <motion.button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : "Publish Course"}
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === 'basic' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <FileText className="h-5 w-5 mr-2" />
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === 'lessons' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <Film className="h-5 w-5 mr-2" />
              Lessons
              {courseData.lessons.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {courseData.lessons.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === 'quizzes' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <HelpCircle className="h-5 w-5 mr-2" />
              Quizzes
              {courseData.quizzes.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {courseData.quizzes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === 'certificate' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <Award className="h-5 w-5 mr-2" />
              Certificate
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Course Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Provide basic information about your course to help students understand what they'll learn.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={courseData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="mt-1">
                    <select
                      id="category"
                      name="category"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={courseData.category}
                      onChange={handleInputChange}
                    >
                      <option>Programming</option>
                      <option>Design</option>
                      <option>Business</option>
                      <option>Marketing</option>
                      <option>Data Science</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Describe what students will learn in your course"
                      value={courseData.description}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700">
                    Thumbnail Image URL <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      name="thumbnailUrl"
                      id="thumbnailUrl"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://example.com/image.jpg"
                      value={courseData.thumbnailUrl}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter a URL for your course thumbnail image. Recommended size: 1280×720px.
                  </p>
                </div>
                
                {courseData.thumbnailUrl && (
                  <div className="border rounded-md p-4 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img 
                      src={courseData.thumbnailUrl} 
                      alt="Course thumbnail preview" 
                      className="h-48 w-full object-cover rounded-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/640x360?text=Invalid+Image+URL";
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('lessons')}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue to Lessons
                </button>
              </div>
            </div>
          )}

          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Course Lessons</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add video lessons for your course. Each lesson should include a title, video URL, and optional description.
                </p>
              </div>
              
              {/* Add New Lesson Form */}
              <div className="bg-gray-50 p-6 border border-gray-200 rounded-md">
                <h4 className="text-base font-medium text-gray-900 mb-4">Add New Lesson</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="lessonTitle" className="block text-sm font-medium text-gray-700">
                      Lesson Title <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="title"
                        id="lessonTitle"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g. Introduction to JavaScript"
                        value={newLesson.title}
                        onChange={handleLessonChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
                      Video URL <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        name="videoUrl"
                        id="videoUrl"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                        value={newLesson.videoUrl}
                        onChange={handleLessonChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      You can use YouTube, Vimeo, or any direct video file URL
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="lessonDescription" className="block text-sm font-medium text-gray-700">
                      Description (optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="lessonDescription"
                        name="description"
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Briefly describe what this lesson covers"
                        value={newLesson.description}
                        onChange={handleLessonChange}
                      ></textarea>
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={addLesson}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Lesson
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Lesson List */}
              <div className="mt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Lessons ({courseData.lessons.length})
                </h4>
                
                {courseData.lessons.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-md border border-dashed border-gray-300">
                    <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No lessons added yet</p>
                    <p className="text-sm text-gray-400">Use the form above to add your first lesson</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
                    {courseData.lessons.map((lesson, index) => (
                      <li key={lesson.id} className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center mr-2">
                                {index + 1}
                              </span>
                              <h4 className="text-sm font-medium text-gray-900">{lesson.title}</h4>
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-600 ml-8">
                              <p className="truncate">{lesson.videoUrl}</p>
                              {lesson.description && (
                                <p className="mt-1 text-gray-500">{lesson.description}</p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLesson(lesson.id)}
                            className="ml-4 p-2 text-gray-400 hover:text-red-500 focus:outline-none"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="flex justify-between pt-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Basic Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('quizzes')}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue to Quizzes
                </button>
              </div>
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Course Quizzes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add multiple-choice questions to test students' knowledge of your course material.
                </p>
              </div>
              
              {/* Add New Quiz Form */}
              <div className="bg-gray-50 p-6 border border-gray-200 rounded-md">
                <h4 className="text-base font-medium text-gray-900 mb-4">Add New Question</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="quizQuestion" className="block text-sm font-medium text-gray-700">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="quizQuestion"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g. What is the correct way to declare a JavaScript variable?"
                        value={newQuiz.question}
                        onChange={handleQuizQuestionChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options <span className="text-red-500">*</span>
                    </label>
                    {newQuiz.options.map((option, index) => (
                      <div key={index} className="flex items-center mb-3">
                        <input
                          id={`option-${index}`}
                          name="correct-option"
                          type="radio"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          checked={newQuiz.correctOption === index}
                          onChange={() => handleCorrectOptionChange(index)}
                        />
                        <label htmlFor={`option-${index}`} className="ml-3 block text-sm font-medium text-gray-700">
                          Option {index + 1}
                          {newQuiz.correctOption === index && (
                            <span className="ml-2 text-xs text-green-600">(Correct Answer)</span>
                          )}
                        </label>
                        <input
                          type="text"
                          className="ml-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handleQuizOptionChange(index, e.target.value)}
                        />
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 mt-1">
                      Select the radio button next to the correct answer.
                    </p>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={addQuizQuestion}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Quiz List */}
              <div className="mt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Quiz Questions ({courseData.quizzes.length})
                </h4>
                
                {courseData.quizzes.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-md border border-dashed border-gray-300">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No quiz questions added yet</p>
                    <p className="text-sm text-gray-400">Use the form above to add questions</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
                    {courseData.quizzes.map((quiz, index) => (
                      <li key={quiz.id} className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center mr-2">
                                {index + 1}
                              </span>
                              <h4 className="text-sm font-medium text-gray-900">{quiz.question}</h4>
                            </div>
                            
                            <ul className="mt-2 ml-8 space-y-1">
                              {quiz.options.map((option, optIndex) => (
                                <li key={optIndex} className="text-sm text-gray-500 flex items-center">
                                  <span className="mr-2">{optIndex + 1}.</span> 
                                  {option}
                                  {optIndex === quiz.correctOption && (
                                    <span className="ml-2 text-xs text-green-600 font-medium">(Correct)</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeQuizQuestion(quiz.id)}
                            className="ml-4 p-2 text-gray-400 hover:text-red-500 focus:outline-none"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="flex justify-between pt-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('lessons')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Lessons
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('certificate')}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue to Certificate
                </button>
              </div>
            </div>
          )}

          {/* Certificate Tab */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Course Certificate</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add a certificate that students can earn after completing the course.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="certificateLink" className="block text-sm font-medium text-gray-700">
                    Certificate Template URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      name="certificateLink"
                      id="certificateLink"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://example.com/certificate-template.pdf"
                      value={courseData.certificateLink}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter a URL for the certificate template students will receive upon course completion.
                    Leave blank if you don't want to offer a certificate.
                  </p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Award className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-indigo-800">Certificate Information</h3>
                      <div className="mt-2 text-sm text-indigo-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Certificates should be in PDF or image format</li>
                          <li>Include placeholders for student name, course name, and completion date</li>
                          <li>Certificates will automatically be issued when all lessons and quizzes are completed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('quizzes')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Quizzes
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : "Publish Course"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}