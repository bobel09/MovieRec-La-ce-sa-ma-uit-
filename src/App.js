import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Login from './components/auth/login';
import Register from './components/auth/register';
import Home from './components/home';
import ReviewPage from './components/review';
import FeedPage from './components/feed';
import UserProfile from './components/userprofile';
import FriendRequests from './components/friendrequests';
import FriendsList from './components/friendlist';
import About from './components/about';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>MovieRec</h1>
        <p>Welcome to MovieRec! Please login or sign up to continue.</p>
        <nav>
          <Link className="landing-link" to="/login">Login</Link>
          <Link className="landing-link" to="/register">Sign Up</Link>
        </nav>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/review/:movieId" element={<ReviewPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/user/:userId" element={<UserProfile/>} />
          <Route path="/friend-requests" element={<FriendRequests/>} />
          <Route path="/friends" element={<FriendsList/>} />
          <Route path="//about/:movieId" element={<About/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
