import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="landing-wrapper">
      <header className="landing-header">
        <div className="logo">👩‍🍳FlavorShare</div>
        <nav className="landing-nav">
          <button className="nav-btn" onClick={handleLogin}>Login</button>
          <button className="nav-btn signup" onClick={handleSignUp}>Sign Up</button>
        </nav>
      </header>
      <section className="hero-section">
  <div className="hero-content">
    <h1 className="hero-title">Ignite Your Culinary Passion</h1>
    <p className="hero-subtitle">
      Connect with chefs, share recipes, and savor new skills.
      </p>
      <div className="hero-image-container"> 

  <img 
  src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
  alt="Plate of food with orange sauce"
  className="hero-image"
/>    
      <img
  src="https://images.unsplash.com/photo-1551183053-bf91a1d81141"
  alt="Plate of food with orange sauce"
  className="hero-image"
/>


<img
 src="https://images.unsplash.com/photo-1504674900247-0877df9cc836

"
alt="Plate of food with orange sauce"
  className="hero-image"
/>

</div>

    <button className="hero-cta" onClick={handleSignUp}>
      Start Your Journey
    </button>
  </div>
</section>
      <section className="features-section">
        <h2 className="features-title">Why Join FlavorShare?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🍽️</div>
            <h3>Share Recipes</h3>
            <p>Post your favorite dishes and inspire others.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👩‍🍳</div>
            <h3>Learn from Pros</h3>
            <p>Gain tips from expert cooks worldwide.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>Build Community</h3>
            <p>Connect with food lovers like you.</p>
          </div>
        </div>
      </section>
      <footer className="landing-footer">
        <p>© 2025 FlavorShare - Igniting Culinary Passion</p>
      </footer>
    </div>
  );
};

export default LandingPage;