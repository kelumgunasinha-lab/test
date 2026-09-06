import React, { useState, useEffect } from 'react';

const UserForm = ({ initialValues, onSubmit, onCancel, isEditing, isLoading, serverError }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        firstName: initialValues.firstName || '',
        lastName: initialValues.lastName || '',
        email: initialValues.email || '',
        phone: initialValues.phone || ''
      });
    }
  }, [initialValues]);

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on edit
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form" noValidate>
      {serverError && (
        <div className="alert alert-danger" role="alert">
          {serverError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="firstName" className="form-label">
          First Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Enter first name"
          disabled={isLoading}
        />
        {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="lastName" className="form-label">
          Last Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Enter last name"
          disabled={isLoading}
        />
        {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address <span className="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g. john.doe@example.com"
          disabled={isLoading}
        />
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">
          Phone Number <span className="required">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
          value={formData.phone}
          onChange={handleChange}
          placeholder="e.g. +1 (555) 000-0000"
          disabled={isLoading}
        />
        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (isEditing ? 'Updating...' : 'Saving...') : isEditing ? 'Update User' : 'Save User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
