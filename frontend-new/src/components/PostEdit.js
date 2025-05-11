import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getPostById, updatePost } from '../services/api';
import './PostEdit.css';

const PostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', image: '' });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(id);
        setFormData({ title: data.title, description: data.description, image: data.image || '' });
        setPreview(data.image || null);
        setLoading(false);
      } catch (err) {
        Swal.fire('Error', 'Failed to load post.', 'error');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Please upload an image under 1MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result; // Base64 string
        setFormData({ ...formData, image: newImage });
        setPreview(newImage);
      };
      reader.readAsDataURL(file);
    }
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
      await updatePost(id, formData);
      Swal.fire({
        icon: 'success',
        title: 'Post Updated!',
        text: 'Your post has been updated successfully.',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate('/post/list');
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to update post.', 'error');
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="post-edit-container">
      <h2>Edit Post</h2>
      <form onSubmit={handleSubmit} className="post-edit-form">
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
        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            className={errors.image ? 'error' : ''}
          />
          {preview && <img src={preview} alt="Preview" className="image-preview" />}
        </div>
        <button type="submit" className="update-btn">Update Post</button>
      </form>
    </div>
  );
};

export default PostEdit;