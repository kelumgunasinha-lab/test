import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UsersPage from './pages/UsersPage';
import UserFormPage from './pages/UserFormPage';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <header className="navbar">
          <div className="navbar-container">
            <span className="navbar-brand">⚡ User Registration System</span>
          </div>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/new" element={<UserFormPage />} />
            <Route path="/users/edit/:id" element={<UserFormPage />} />
            <Route path="/" element={<Navigate to="/users" replace />} />
            <Route path="*" element={<Navigate to="/users" replace />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="footer-container">
            <p>&copy; {new Date().getFullYear()} User Registration CRUD App. Built with Spring Boot & React.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
