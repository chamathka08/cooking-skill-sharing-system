import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { loginUser } from '../services/api';
import './LoginForm.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  // Validation function
  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value) error = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(value)) error = 'Invalid email format';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
    }
    return error;
  };

  // Handle input changes with live validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors in the form.',
      });
      return;
    }

    try {
      const userData = await loginUser(formData); // Call login API
      if (!userData || !userData.userId) {
        throw new Error('Invalid response from server: No user ID found');
      }
      localStorage.setItem('userId', userData.userId); // Store user ID
      localStorage.setItem('token', userData.token || ''); // Store token if available
      localStorage.setItem('username', userData.username || 'User'); // Store username
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: `Welcome back, ${userData.username || 'User'}!`,
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate(`/profile`); // Navigate to profile with userId
      });
    } catch (error) {
      let errorMessage = 'Invalid email or password. Please try again.';
      if (error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to the server. Please ensure the backend is running on http://localhost:8081.';
      } else if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Incorrect email or password.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found.';
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.message.includes('No user ID found')) {
        errorMessage = 'Login failed: User ID not returned from server.';
      }
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
      });
      console.error('Login error:', error.response || error.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-header">Welcome Back</h2>
        <p className="login-subtext">Log in to continue your cooking journey!</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field-wrapper">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`login-field ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div className="login-field-wrapper">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="new-password" // Prevents autofill
              className={`login-field ${errors.password ? 'error' : ''}`}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <button type="submit" className="login-submit">Log In</button>
        </form>
        <p className="register-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;