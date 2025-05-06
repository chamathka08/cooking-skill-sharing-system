import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createPost } from '../services/api';
import './PostForm.css';

const PostForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = '';
    if (name === 'title' && !value) error = 'Title is required';
    if (name === 'description' && !value) error = 'Description is required';
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const error = validateField(name, value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      title: validateField('title', formData.title),
      description: validateField('description', formData.description),
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
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User not logged in.');
      const postData = { ...formData, userId };
      await createPost(postData);
      Swal.fire({
        icon: 'success',
        title: 'Post Created!',
        text: 'Your post has been created successfully.',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate('/post/list');
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message.includes('Network Error')
          ? 'Cannot connect to the server. Please ensure the backend is running.'
          : 'Failed to create post.',
      });
    }
  };

  return (
    <div className="post-form-container">
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <p className="error-text">{errors.title}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <p className="error-text">{errors.description}</p>}
        </div>
        <button type="submit" className="submit-btn">Create Post</button>
      </form>
    </div>
  );
};

export default PostForm;