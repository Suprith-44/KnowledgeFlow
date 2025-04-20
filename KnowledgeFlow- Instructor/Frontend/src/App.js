import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import DashboardPage from './Dashboard';
import CreateCoursePage from './CreateCourse';
import ViewCoursePage from './ViewCourse';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create-course" element={<CreateCoursePage />} />
        <Route path="/course/:id" element={<ViewCoursePage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;