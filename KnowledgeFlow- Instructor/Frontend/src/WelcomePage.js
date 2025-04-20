import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, Award, DollarSign, ChevronRight, Users, PieChart, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WelcomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-10 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-blue-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome to <span className="text-indigo-600">KnowledgeFlow</span>
            </motion.h1>
            <motion.p 
              className="mt-4 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Your platform to create, share, and monetize your expertise through engaging online courses
            </motion.p>

          </motion.div>
        </div>
      </div>

      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <a 
          href="/login" 
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Get Started
          <ChevronRight className="ml-2 h-5 w-5" />
        </a>
      </motion.div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to create successful courses
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools to build, launch, and grow your online teaching business
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={container}
            initial="hidden"
            animate={isVisible ? "show" : "hidden"}
          >
            <motion.div variants={item} className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Course Creation</h3>
              <p className="mt-2 text-gray-600">Easily build your curriculum with our intuitive course builder</p>
            </motion.div>

            <motion.div variants={item} className="bg-purple-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Video Hosting</h3>
              <p className="mt-2 text-gray-600">Upload and manage your video content with our cloud storage</p>
            </motion.div>

            <motion.div variants={item} className="bg-green-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Certificates</h3>
              <p className="mt-2 text-gray-600">Reward your students with customized completion certificates</p>
            </motion.div>

            <motion.div variants={item} className="bg-amber-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Monetization</h3>
              <p className="mt-2 text-gray-600">Set your prices and receive payments directly to your account</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-indigo-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div>
              <p className="text-4xl font-bold text-white">10,000+</p>
              <p className="mt-2 text-indigo-200">Instructors</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">500,000+</p>
              <p className="mt-2 text-indigo-200">Students</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">$25M+</p>
              <p className="mt-2 text-indigo-200">Instructor Earnings</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How KnowledgeFlow Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to start sharing your knowledge and earning
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate={isVisible ? "show" : "hidden"}
          >
            <motion.div variants={item} className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
                <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white font-bold text-lg">1</div>
                <h3 className="text-xl font-semibold text-gray-900">Create Your Course</h3>
                <p className="mt-4 text-gray-600">Build your curriculum, upload videos, create quizzes, and customize completion certificates</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
                <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white font-bold text-lg">2</div>
                <h3 className="text-xl font-semibold text-gray-900">Set Your Price</h3>
                <p className="mt-4 text-gray-600">Choose your pricing strategy, from free courses to premium subscriptions</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
                <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white font-bold text-lg">3</div>
                <h3 className="text-xl font-semibold text-gray-900">Launch & Grow</h3>
                <p className="mt-4 text-gray-600">Publish your course, attract students, and track your progress with detailed analytics</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <motion.div 
              className="lg:col-span-5"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -30 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Powerful Instructor Dashboard
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Get a comprehensive view of your courses, students, and earnings. Our intuitive dashboard gives you all the insights you need to grow your teaching business.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Student Management</h3>
                    <p className="mt-1 text-gray-600">Track enrollments and student progress in real-time</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                      <PieChart className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Performance Analytics</h3>
                    <p className="mt-1 text-gray-600">Get detailed insights on your course performance</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                      <BarChart2 className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Revenue Tracking</h3>
                    <p className="mt-1 text-gray-600">Monitor your earnings and payout history</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-12 lg:mt-0 lg:col-span-7"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="bg-gray-100 rounded-lg shadow-xl overflow-hidden">
                <div className="bg-indigo-600 h-10 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <h4 className="text-sm font-medium text-gray-500">Active Students</h4>
                      <p className="text-2xl font-bold text-gray-900">1,245</p>
                      <p className="text-xs text-green-600">↑ 12% this month</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <h4 className="text-sm font-medium text-gray-500">Course Completions</h4>
                      <p className="text-2xl font-bold text-gray-900">842</p>
                      <p className="text-xs text-green-600">↑ 8% this month</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <h4 className="text-sm font-medium text-gray-500">Revenue</h4>
                    <p className="text-2xl font-bold text-gray-900">$4,285</p>
                    <div className="h-10 bg-gray-100 rounded-full mt-2">
                      <div className="h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">65% of monthly goal</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h4 className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Recent Enrollments</span>
                      <span className="text-xs text-indigo-600">View All</span>
                    </h4>
                    <ul className="mt-2 space-y-2">
                      <li className="text-sm py-1 border-b border-gray-100 flex justify-between">
                        <span>Advanced Web Development</span>
                        <span className="text-green-600">+12</span>
                      </li>
                      <li className="text-sm py-1 border-b border-gray-100 flex justify-between">
                        <span>Digital Marketing Basics</span>
                        <span className="text-green-600">+8</span>
                      </li>
                      <li className="text-sm py-1 flex justify-between">
                        <span>Data Science Fundamentals</span>
                        <span className="text-green-600">+5</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to start teaching?</span>
              <span className="block text-indigo-200">Join thousands of successful instructors today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-200">
              Create your first course and start sharing your knowledge with the world
            </p>
          </motion.div>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <motion.div 
              className="inline-flex rounded-md shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Get Started
              </a>
            </motion.div>
            <motion.div 
              className="ml-3 inline-flex rounded-md shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="/demo"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
              >
                Watch Demo
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <h3 className="text-2xl font-bold text-white">Knowledge<span className="text-indigo-400">Flow</span></h3>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center md:text-right text-base text-gray-400">
                &copy; 2025 KnowledgeFlow. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}