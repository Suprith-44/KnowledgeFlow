import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, LogOut, User, Bell, Search, Filter, Heart, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const categories = [
    "All",
    "Programming",
    "Design",
    "Business",
    "Marketing",
    "Science",
    "Language"
  ];

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      // Redirect to login if no user data found
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Fetch the user's enrolled courses
      fetchEnrolledCourses(parsedUser.username);
      // Fetch all available courses
      fetchAllCourses();
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Handle invalid data by redirecting to login
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  // Fetch courses the user has enrolled in/purchased
  const fetchEnrolledCourses = async (username) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(`http://localhost:7000/api/users/${username}/enrolled-courses`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch enrolled courses (${response.status})`);
      }
      
      const coursesData = await response.json();
      setEnrolledCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      setFetchError("Failed to load your enrolled courses. Please try again later.");
      setEnrolledCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the fetchAllCourses function to handle errors properly
  const fetchAllCourses = async () => {
    try {
      const response = await fetch(`http://localhost:7000/api/courses`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses (${response.status})`);
      }
      
      const coursesData = await response.json();
      
      // Transform data to match expected format
      const formattedCourses = Array.isArray(coursesData) ? coursesData.map(course => ({
        id: course.id,
        title: course.title || "Untitled Course",
        description: course.description || "No description available",
        instructor: course.creatorUsername || "Unknown Instructor", 
        category: course.category || "Uncategorized",
        thumbnailUrl: course.thumbnailUrl || "https://via.placeholder.com/640x360?text=Course+Image",
        price: course.price || "Free"
      })) : [];
      
      setAllCourses(formattedCourses);
    } catch (error) {
      console.error("Error fetching all courses:", error);
      setAllCourses([]);
      setFetchError("Failed to load available courses. Please try again later.");
    }
  };

  // Add an enrollment function
  const enrollInCourse = async (courseId) => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:7000/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to enroll in course (${response.status})`);
      }

      // Show success message
      alert('Successfully enrolled in course!');
      
      // Refresh enrolled courses
      fetchEnrolledCourses(user.username);
      
      // Switch to the enrolled tab
      setActiveTab('enrolled');
      
    } catch (error) {
      console.error("Error enrolling in course:", error);
      alert(`Failed to enroll: ${error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatLastAccessed = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
    } catch (error) {
      return "Recently";
    }
  };

  // Filter courses based on search and category
  const getFilteredCourses = () => {
    return allCourses.filter(course => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  };

  // Error message component
  const ErrorMessage = ({ message }) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center mt-6">
      <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Error Loading Data</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      <button
        onClick={() => {
          setFetchError(null);
          if (activeTab === 'enrolled') {
            fetchEnrolledCourses(user.username);
          } else {
            fetchAllCourses();
          }
        }}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Try Again
      </button>
    </div>
  );

  if (!user) return null; // Don't render until user data is loaded

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation Bar */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.h1 
                className="text-2xl font-bold text-indigo-600 cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => navigate('/')}
              >
                KnowledgeFlow
              </motion.h1>
            </div>
            
            {/* Navigation Items */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {/* Search Bar */}
              <div className="relative mx-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search courses"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Notification Bell */}
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Bell className="h-6 w-6" />
              </button>
              
              {/* User Menu */}
              <div className="ml-3 relative flex items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="ml-2 text-gray-700 text-sm font-medium">{user.username}</span>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="ml-3 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome Message */}
          <div className="px-4 sm:px-0">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.username}!</h2>
            <p className="mt-1 text-sm text-gray-600">Continue your learning journey today</p>
          </div>
          
          {/* Dashboard Tabs */}
          <div className="mt-6 px-4 sm:px-0">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px space-x-8">
                <button
                  className={`${
                    activeTab === 'enrolled'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('enrolled')}
                >
                  My Learning
                </button>
                <button
                  className={`${
                    activeTab === 'browse'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('browse')}
                >
                  Browse Courses
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6 px-4 sm:px-0">
            {activeTab === 'enrolled' ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900">My Enrolled Courses</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Continue learning where you left off
                </p>

                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : fetchError ? (
                  <ErrorMessage message={fetchError} />
                ) : enrolledCourses.length === 0 ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg p-10 text-center mt-6">
                    <Book className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No enrolled courses yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Browse our catalog and enroll in your first course.</p>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Browse Courses
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {enrolledCourses.map(course => (
                      <motion.div
                        key={course.id}
                        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="h-40 w-full overflow-hidden relative">
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/640x360?text=Course+Image";
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-white text-xs font-medium">
                                {course.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-4">
                          <h4 className="text-base font-medium text-gray-900 line-clamp-1">
                            {course.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            by {course.creatorUsername || course.instructor || "Unknown Instructor"}
                          </p>
                          
                          <div className="mt-4">
                            {course.lastAccessed && (
                              <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                                <span>Last accessed: {formatLastAccessed(course.lastAccessed)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 flex items-center space-x-3">
                            <button
                              onClick={() => navigate(`/course/${course.id}`)}
                              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Resume Course
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Browse Courses</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Find your next learning adventure
                    </p>
                  </div>
                  
                  {/* Filter by Category */}
                  <div className="mt-4 md:mt-0 flex items-center">
                    <Filter className="h-4 w-4 text-gray-400 mr-2" />
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : fetchError ? (
                  <ErrorMessage message={fetchError} />
                ) : allCourses.length === 0 ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg p-10 text-center mt-6">
                    <Book className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No courses available</h3>
                    <p className="mt-1 text-sm text-gray-500">Please check back later for new courses.</p>
                  </div>
                ) : getFilteredCourses().length === 0 ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg p-10 text-center mt-6">
                    <Search className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No matching courses found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or category filter.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCategoryFilter('All');
                      }}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {getFilteredCourses().map(course => (
                      <motion.div
                        key={course.id}
                        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="h-40 w-full overflow-hidden relative">
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/640x360?text=Course+Image";
                            }}
                          />
                          <div className="absolute top-0 right-0 p-2">
                            <button className="p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500">
                              <Heart className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <span className="text-white text-xs font-medium">{course.category}</span>
                          </div>
                        </div>
                        <div className="px-4 py-4">
                          <h4 className="text-base font-medium text-gray-900 line-clamp-1">
                            {course.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            by {course.instructor || "Unknown Instructor"}
                          </p>
                          
                          {course.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {course.description}
                            </p>
                          )}
                          
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {typeof course.price === 'number' ? `$${course.price.toFixed(2)}` : course.price}
                            </span>
                            <button
                              onClick={() => enrollInCourse(course.id)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Enroll Now
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}