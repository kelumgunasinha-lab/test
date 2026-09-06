import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserTable from '../components/UserTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { getUsers, deleteUser } from '../services/userService';

const UsersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);

  // Modal delete confirmation state
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      const msg = err.response?.data?.message || 'Failed to fetch users. Please check backend connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Clear alert message from navigation state after 4 seconds
    if (location.state?.message) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        // Clear history state
        window.history.replaceState({}, document.title);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleEdit = (id) => {
    navigate(`/users/edit/${id}`);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      setSuccessMessage(`User "${userToDelete.firstName} ${userToDelete.lastName}" deleted successfully.`);
      setUserToDelete(null);
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      const msg = err.response?.data?.message || 'Failed to delete user.';
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage registered users in the database</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-add"
          onClick={() => navigate('/users/new')}
        >
          + Add User
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button type="button" className="btn btn-sm btn-outline-secondary ml-3" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <UserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        title="Delete User"
        message={userToDelete ? `Are you sure you want to delete ${userToDelete.firstName} ${userToDelete.lastName}?` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UsersPage;
