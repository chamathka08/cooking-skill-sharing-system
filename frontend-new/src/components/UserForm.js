import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createUser } from '../services/api';
import './UserForm.css';

const UserForm = ({ onSave }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    profilePicture: '', // Add profilePicture to formData
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null); // For image preview

  // Validation function
  const validateField = (name, value) => {
    let error = '';
    if (name === 'username') {
      if (!value) error = 'Username is required';
      else if (value.length < 3) error = 'Username must be at least 3 characters';
    }
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

  // Handle text input changes with live validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate in real-time as the user types
    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Please upload an image under 1MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      username: validateField('username', formData.username),
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
      const response = await createUser(formData);
      localStorage.setItem('userId', response.id); // Store userId
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User created successfully.',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate('/login');
        if (onSave) onSave();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to create user. Please try again.',
      });
      console.error('Error saving user:', error);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <h2 className="signup-header">Create Your Account</h2>
        <p className="signup-subtext">Sign up to start your cooking journey!</p>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-field">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className={`signup-field ${errors.username ? 'error' : ''}`}
            />
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>
          <div className="form-field">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`signup-field ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div className="form-field">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="new-password"
              className={`signup-field ${errors.password ? 'error' : ''}`}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <div className="form-field">
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="signup-field"
            />
          </div>
          <div className="form-field">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="signup-file-field"
            />
            {preview && (
              <img src={preview} alt="Preview" className="signup-image-preview" />
            )}
          </div>
          <button type="submit" className="signup-submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;