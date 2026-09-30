-- SenseSphere AI Database Schema
-- MySQL 8.0+ Compatible

CREATE DATABASE IF NOT EXISTS sensesphere_ai;
USE sensesphere_ai;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(500) DEFAULT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Chats table
CREATE TABLE IF NOT EXISTS chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender VARCHAR(20) NOT NULL, -- 'user' or 'ai'
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'text', -- 'text', 'image', 'audio', 'video', 'document', 'voice', 'camera'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- 4. Media table (stores metadata, files saved to cloud/local storage)
CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    chat_id INT DEFAULT NULL,
    message_id INT DEFAULT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    cloud_provider VARCHAR(50) DEFAULT 'local', -- 'cloudinary', 's3', 'local'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE SET NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- 5. AI Responses table
CREATE TABLE IF NOT EXISTS ai_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    model_name VARCHAR(100) NOT NULL DEFAULT 'SenseSphere-Omni-v1',
    response_text TEXT NOT NULL,
    processing_time INT DEFAULT 0, -- milliseconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- 6. User Settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    voice_enabled BOOLEAN DEFAULT FALSE,
    theme VARCHAR(50) DEFAULT 'dark',
    language VARCHAR(50) DEFAULT 'en-US',
    speech_rate FLOAT DEFAULT 1.0,
    speech_pitch FLOAT DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Developer Profile (Fixed Developer Identity System)
CREATE TABLE IF NOT EXISTS developer_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    education VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    purpose TEXT NOT NULL,
    technologies TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default Developer Identity System
INSERT INTO developer_profile (name, role, education, institution, project_name, description, purpose, technologies)
VALUES (
    'Arigala Sai Harshavardhan',
    'Admin, Founder and Lead Developer',
    'B.Tech CSE student',
    'PBR VITS',
    'SenseSphere AI',
    'SenseSphere AI is a multimodal AI assistant designed to understand text, images, audio, video, documents, camera input, and voice interactions.',
    'My purpose is to provide users with a single AI assistant capable of understanding different types of information and helping them with their questions by combining multiple forms of human-computer interaction into one simple AI assistant.',
    'Frontend web technologies (React, Vite, CSS, Lucide), backend APIs (Node.js, Express), AI services, computer vision, speech processing, MySQL relational database, cloud storage, and authentication services.'
)
ON DUPLICATE KEY UPDATE name=VALUES(name);
