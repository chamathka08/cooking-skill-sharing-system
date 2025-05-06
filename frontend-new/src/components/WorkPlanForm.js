import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createWorkPlan } from '../services/api';
import './WorkPlanForm.css';

const WorkPlanForm = () => {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topics: '',
    startDate: '',
    endDate: '',
    status: 'In Progress',
  });
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    topics: '',
    startDate: '',
    endDate: '',
    status: '',
  });

  const validateField = (name, value, allValues = formData) => {
    switch (name) {
      case 'title':
        if (!value) return 'Title is required';
        if (value.length < 3) return 'Title must be at least 3 characters';
        return '';
      case 'description':
        if (value && value.length < 10) return 'Description must be at least 10 characters';
        return '';
      case 'topics':
        if (value) {
          const topicsArray = value.split(',').map((topic) => topic.trim());
          if (topicsArray.some((topic) => !topic)) return 'Each topic must be non-empty';
        }
        return '';
      case 'startDate':
        if (!value) return 'Start date is required';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(value);
        if (start < today) return 'Start date must be today or in the future';
        return '';
      case 'endDate':
        if (!value) return 'End date is required';
        if (allValues.startDate) {
          const start = new Date(allValues.startDate);
          const end = new Date(value);
          if (end <= start) return 'End date must be after start date';
        }
        return '';
      case 'status':
        if (!['In Progress', 'Completed', 'Not Started'].includes(value)) {
          return 'Invalid status';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {
      title: validateField('title', formData.title),
      description: validateField('description', formData.description),
      topics: validateField('topics', formData.topics),
      startDate: validateField('startDate', formData.startDate),
      endDate: validateField('endDate', formData.endDate, formData),
      status: validateField('status', formData.status),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({
      ...errors,
      [name]: validateField(name, value, { ...formData, [name]: value }),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Failed',
        text: 'Please fix the errors in the form.',
      });
      return;
    }
    try {
      const workPlan = {
        ...formData,
        userId: currentUserId,
        topics: formData.topics ? formData.topics.split(',').map((topic) => topic.trim()) : [],
      };
      await createWorkPlan(workPlan);
      Swal.fire({
        icon: 'success',
        title: 'Work Plan Created!',
        text: 'Your work plan has been created.',
        timer: 1500,
      });
      navigate('/profile');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: 'Something went wrong.',
      });
      console.error('Create work plan error:', error);
    }
  };

  const isFormValid = () => {
    return !Object.values(errors).some((error) => error) &&
           formData.title &&
           formData.startDate &&
           formData.endDate &&
           ['In Progress', 'Completed', 'Not Started'].includes(formData.status);
  };

  return (
    <div className="workplan-container">
      <div className="workplan-card">
        <h2>Create Work Plan</h2>
        <form onSubmit={handleSubmit} className="workplan-form">
          <div className="form-group">
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title (e.g., Learn to Make Cupcakes)"
              className={`workplan-input ${errors.title ? 'error' : ''}`}
              required
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          <div className="form-group">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className={`workplan-textarea ${errors.description ? 'error' : ''}`}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
          <div className="form-group">
            <input
              name="topics"
              value={formData.topics}
              onChange={handleChange}
              placeholder="Topics (e.g., Baking, Frosting)"
              className={`workplan-input ${errors.topics ? 'error' : ''}`}
            />
            {errors.topics && <span className="error-message">{errors.topics}</span>}
          </div>
          <div className="form-group">
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className={`workplan-input ${errors.startDate ? 'error' : ''}`}
              required
            />
            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
          </div>
          <div className="form-group">
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className={`workplan-input ${errors.endDate ? 'error' : ''}`}
              required
            />
            {errors.endDate && <span className="error-message">{errors.endDate}</span>}
          </div>
          <div className="form-group">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`workplan-input ${errors.status ? 'error' : ''}`}
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Not Started">Not Started</option>
            </select>
            {errors.status && <span className="error-message">{errors.status}</span>}
          </div>
          <button
            type="submit"
            className="workplan-submit"
            disabled={!isFormValid()}
          >
            Create
          </button>
        </form>
        <button className="workplan-cancel" onClick={() => navigate('/profile')}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WorkPlanForm;