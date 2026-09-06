import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserForm from '../components/UserForm';
import { getUserById, createUser, updateUser } from '../services/userService';

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const fetchUser = async () => {
        setLoading(true);
        setServerError(null);
        try {
          const user = await getUserById(id);
          setInitialValues(user);
        } catch (err) {
          console.error('Error loading user details:', err);
          const msg = err.response?.data?.message || 'Failed to load user details.';
          setServerError(msg);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, isEditing]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setServerError(null);
    try {
      if (isEditing) {
        await updateUser(id, formData);
        navigate('/users', {
          state: { message: `User "${formData.firstName} ${formData.lastName}" updated successfully!` }
        });
      } else {
        await createUser(formData);
        navigate('/users', {
          state: { message: `User "${formData.firstName} ${formData.lastName}" registered successfully!` }
        });
      }
    } catch (err) {
      console.error('Error saving user:', err);
      const msg = err.response?.data?.message || 'An error occurred while saving user.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div className="page-container small-container">
      <div className="card">
        <div className="card-header">
          <h2>{isEditing ? 'Edit User' : 'Add New User'}</h2>
          <p className="card-subtitle">
            {isEditing ? 'Update the details of the selected user.' : 'Fill in the information below to register a new user.'}
          </p>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading user details...</p>
            </div>
          ) : (
            <UserForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={isEditing}
              isLoading={submitting}
              serverError={serverError}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserFormPage;
