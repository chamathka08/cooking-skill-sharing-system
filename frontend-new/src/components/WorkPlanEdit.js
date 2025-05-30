import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getWorkPlan, updateWorkPlan } from '../services/api';
import './WorkPlanEdit.css';

const WorkPlanEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkPlan = async () => {
      try {
        const data = await getWorkPlan(id);
        setFormData({ title: data.title, description: data.description });
        setLoading(false);
      } catch (err) {
        Swal.fire('Error', 'Failed to load work plan.', 'error');
        setLoading(false);
      }
    };

    fetchWorkPlan();
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
      await updateWorkPlan(id, formData);
      Swal.fire({
        icon: 'success',
        title: 'Work Plan Updated!',
        text: 'Your work plan has been updated successfully.',
        timer: 1000,
        showConfirmButton: false,
      }).then(() => {
        navigate('/workplan/list');
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to update work plan.', 'error');
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="workplan-edit-container">
      <h2>Edit Work Plan</h2>
      <form onSubmit={handleSubmit} className="workplan-edit-form">
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
        <button type="submit" className="update-btn">Update Work Plan</button>
      </form>
    </div>
  );
};

export default WorkPlanEdit;