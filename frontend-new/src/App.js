import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import UserForm from './components/UserForm';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import HomePage from './components/HomePage';
import WorkPlanForm from './components/WorkPlanForm';
import WorkPlanList from './components/WorkPlanList';
import WorkPlanEdit from './components/WorkPlanEdit';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import PostEdit from './components/PostEdit';
import Explore from './components/Explore'; // Add this import
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<UserForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/workplan/create" element={<WorkPlanForm />} />
          <Route path="/workplan/list" element={<WorkPlanList />} />
          <Route path="/workplan/edit/:id" element={<WorkPlanEdit />} />
          <Route path="/post/create" element={<PostForm />} />
          <Route path="/post/list" element={<PostList />} />
          <Route path="/post/edit/:id" element={<PostEdit />} />
          <Route path="/explore" element={<Explore />} /> {/* Add this route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;