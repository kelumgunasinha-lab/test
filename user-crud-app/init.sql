-- PostgreSQL Database Setup Script for User Registration CRUD App

-- 1. Create database (Execute this command connected to default 'postgres' database)
-- CREATE DATABASE user_crud_db;

-- Connect to database: \c user_crud_db

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Insert initial sample seed data
INSERT INTO users (first_name, last_name, email, phone, created_at)
VALUES 
    ('John', 'Doe', 'john.doe@example.com', '+1 (555) 123-4567', NOW()),
    ('Mary', 'Smith', 'mary.smith@example.com', '+1 (555) 987-6543', NOW()),
    ('Alex', 'Johnson', 'alex.johnson@example.com', '+1 (555) 456-7890', NOW())
ON CONFLICT (email) DO NOTHING;
