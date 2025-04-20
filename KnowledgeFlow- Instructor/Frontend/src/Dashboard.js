import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Plus, LogOut, User, Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
    const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Programming'
  });

  // Fetch user data from localStorage on component mount
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
      
      // Fetch the user's courses (mock data for now)
      fetchUserCourses(parsedUser.username);
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Handle invalid data by redirecting to login
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, []);

  // Replace the fetchUserCourses function with this implementation:
  const fetchUserCourses = async (username) => {
    setIsLoading(true);
    try {
      // Fetch courses from the API
      const response = await fetch(`http://localhost:7000/courses?username=${username}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const coursesData = await response.json();
      
      // Transform the data structure from object to array
      const coursesArray = Object.entries(coursesData).map(([courseId, course]) => {
        return {
          id: courseId,
          ...course,
          lessons: course.lessons ? course.lessons.length : 0
        };
      });
      
      setCourses(coursesArray);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleCreateCourse = () => {
    window.location.href = '/create-course';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) return null; // Don't render until user data is loaded

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation Bar */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.h1 
                className="text-2xl font-bold text-indigo-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search courses"
                  type="search"
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
          {/* Dashboard Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <motion.button
                onClick={handleCreateCourse}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Course
              </motion.button>
            </div>

            {/* Courses Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg p-10 text-center">
                <Book className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first course.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {courses.map(course => (
                  <motion.div
                    key={course.id}
                    className="bg-white overflow-hidden shadow rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-40 w-full overflow-hidden">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/640x360?text=Course+Image";
                        }}
                      />
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {course.title}
                          </h3>
                          <p className="mt-1 text-xs text-indigo-600 font-medium">
                            {course.category}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {course.lessons} lessons
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="mt-4">
                        <button
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
                          onClick={() => navigate(`/edit-course/${course.id}`)}
                        >
                          Edit Course
                        </button>
                        <button
                          onClick={() => navigate(`/course/${course.id}`)}
                          className="inline-flex items-center ml-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
    </div>
  );
}