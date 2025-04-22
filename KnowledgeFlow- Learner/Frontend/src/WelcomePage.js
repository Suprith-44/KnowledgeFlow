import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, Award, Search, ChevronRight, Users, Clock, Check, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WelcomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState([
    {
      id: 1,
      title: "Data Science Fundamentals",
      instructor: "Dr. Sarah Johnson",
      rating: 4.8,
      students: 3420,
      price: 49.99,
      image: "https://source.unsplash.com/random/300x200?data"
    },
    {
      id: 2,
      title: "UX Design Principles",
      instructor: "Michael Chen",
      rating: 4.9,
      students: 2845,
      price: 59.99,
      image: "https://source.unsplash.com/random/300x200?design"
    },
    {
      id: 3,
      title: "Financial Literacy Masterclass",
      instructor: "Emma Roberts",
      rating: 4.7,
      students: 5210,
      price: 44.99,
      image: "https://source.unsplash.com/random/300x200?finance"
    },
    {
      id: 4,
      title: "Advanced Web Development",
      instructor: "Jason Patel",
      rating: 4.9,
      students: 7650,
      price: 69.99,
      image: "https://source.unsplash.com/random/300x200?coding"
    }
  ]);

  const [categories, setCategories] = useState([
    { name: "Technology", icon: "💻", count: 450 },
    { name: "Business", icon: "📊", count: 320 },
    { name: "Design", icon: "🎨", count: 280 },
    { name: "Health", icon: "🏥", count: 215 },
    { name: "Science", icon: "🔬", count: 310 },
    { name: "Languages", icon: "🌎", count: 175 }
  ]);

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
              Learn from the best, become your best
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

      {/* Categories Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Explore Our Categories
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Discover courses in various fields taught by world-class experts
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            variants={container}
            initial="hidden"
            animate={isVisible ? "show" : "hidden"}
          >
            {categories.map((category, index) => (
              <motion.div 
                key={index}
                variants={item} 
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-all cursor-pointer hover:bg-indigo-50 border border-gray-100"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-gray-900 font-medium">{category.name}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Learning Journey */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Your Learning Journey
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From enrollment to certification, we support every step of your educational path
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate={isVisible ? "show" : "hidden"}
          >
            <motion.div variants={item} className="relative">
              <div className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full border-t-4 border-blue-500">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Expert-Led Video Lectures</h3>
                <p className="mt-4 text-gray-600">Engage with comprehensive video content created by industry professionals and academics</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="relative">
              <div className="bg-purple-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full border-t-4 border-purple-500">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Interactive Quizzes</h3>
                <p className="mt-4 text-gray-600">Test your knowledge with challenging quizzes designed to reinforce key concepts</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="relative">
              <div className="bg-green-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full border-t-4 border-green-500">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Earn Certificates</h3>
                <p className="mt-4 text-gray-600">Receive industry-recognized certificates upon successful course completion</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Our Learners Say
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied students who have transformed their lives through our platform
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate={isVisible ? "show" : "hidden"}
          >
            <motion.div variants={item} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                  <img src="https://source.unsplash.com/random/100x100?portrait=1" alt="Student" className="h-full w-full object-cover" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Alex Rivera</h4>
                  <p className="text-sm text-gray-500">Data Science Graduate</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"The Data Science course completely changed my career path. I went from being uncertain about my future to landing a job at a top tech company within 3 months of completion."</p>
              <div className="mt-3 text-yellow-400 flex">
                ★★★★★
              </div>
            </motion.div>

            <motion.div variants={item} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                  <img src="https://source.unsplash.com/random/100x100?portrait=2" alt="Student" className="h-full w-full object-cover" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Priya Sharma</h4>
                  <p className="text-sm text-gray-500">UX Design Student</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"The instructors are true experts who don't just teach theory but share real-world experiences. The projects helped me build an impressive portfolio that employers love."</p>
              <div className="mt-3 text-yellow-400 flex">
                ★★★★★
              </div>
            </motion.div>

            <motion.div variants={item} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                  <img src="https://source.unsplash.com/random/100x100?portrait=3" alt="Student" className="h-full w-full object-cover" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Marcus Johnson</h4>
                  <p className="text-sm text-gray-500">Financial Literacy Student</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"I've taken courses on multiple platforms, but KnowledgeFlow stands out. The certification is well-recognized, and the quizzes really ensure you've mastered the material."</p>
              <div className="mt-3 text-yellow-400 flex">
                ★★★★★
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-indigo-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div>
              <p className="text-4xl font-bold text-white">1M+</p>
              <p className="mt-2 text-indigo-200">Active Learners</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">2,500+</p>
              <p className="mt-2 text-indigo-200">Courses Available</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">12K+</p>
              <p className="mt-2 text-indigo-200">Expert Instructors</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">500K+</p>
              <p className="mt-2 text-indigo-200">Certificates Awarded</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to start learning?</span>
              <span className="block text-indigo-200">Join our community of lifelong learners today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-200">
              Get unlimited access to thousands of courses taught by industry experts
            </p>
          </motion.div>
          <div className="mt-8 flex flex-col sm:flex-row lg:mt-0 lg:flex-shrink-0 gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="/signup"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10"
              >
                Sign Up Free
              </a>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="/browse"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10"
              >
                Browse Courses
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white">Knowledge<span className="text-indigo-400">Flow</span></h3>
              <p className="mt-4 text-gray-400 text-sm">Learn from the best, become your best. Your journey to mastery starts here.</p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><a href="/courses" className="text-gray-400 hover:text-white">All Courses</a></li>
                <li><a href="/categories" className="text-gray-400 hover:text-white">Categories</a></li>
                <li><a href="/instructors" className="text-gray-400 hover:text-white">Instructors</a></li>
                <li><a href="/certificates" className="text-gray-400 hover:text-white">Certificates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Community</h3>
              <ul className="space-y-2">
                <li><a href="/forum" className="text-gray-400 hover:text-white">Discussion Forum</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="/events" className="text-gray-400 hover:text-white">Events</a></li>
                <li><a href="/help" className="text-gray-400 hover:text-white">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Contact</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white">Contact Us</a></li>
                <li><a href="/support" className="text-gray-400 hover:text-white">Support</a></li>
                <li><a href="/careers" className="text-gray-400 hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 KnowledgeFlow Learning Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}