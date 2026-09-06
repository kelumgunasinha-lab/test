import React from 'react';

const UserTable = ({ users, onEdit, onDelete }) => {
  if (!users || users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3>No users found.</h3>
        <p>Click the "Add User" button above to register a new user.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="table-responsive">
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Created At</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="font-mono">{user.id}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>
                <a href={`mailto:${user.email}`} className="email-link">
                  {user.email}
                </a>
              </td>
              <td>{user.phone}</td>
              <td className="text-muted">{formatDate(user.createdAt)}</td>
              <td className="actions-cell">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => onEdit(user.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onDelete(user)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
