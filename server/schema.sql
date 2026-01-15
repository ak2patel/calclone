CREATE DATABASE IF NOT EXISTS cal_clone;
USE cal_clone;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  duration INT NOT NULL, -- in minutes
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  day_of_week VARCHAR(20) NOT NULL, -- e.g., 'Monday', 'Tuesday'
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type_id INT NOT NULL,
  booker_name VARCHAR(255) NOT NULL,
  booker_email VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE
);

-- Seed default user
INSERT INTO users (name, email) VALUES ('Admin User', 'admin@example.com') ON DUPLICATE KEY UPDATE name=name;

-- Seed sample event type
INSERT INTO event_types (user_id, title, slug, duration, description) 
SELECT id, '15 Min Meeting', '15min', 15, 'A quick 15 minute chat.' FROM users WHERE email='admin@example.com' LIMIT 1;

-- Seed sample availability (Mon-Fri, 9-5)
INSERT INTO availability (user_id, day_of_week, start_time, end_time)
SELECT id, 'Monday', '09:00:00', '17:00:00' FROM users WHERE email='admin@example.com' LIMIT 1;
INSERT INTO availability (user_id, day_of_week, start_time, end_time)
SELECT id, 'Tuesday', '09:00:00', '17:00:00' FROM users WHERE email='admin@example.com' LIMIT 1;
INSERT INTO availability (user_id, day_of_week, start_time, end_time)
SELECT id, 'Wednesday', '09:00:00', '17:00:00' FROM users WHERE email='admin@example.com' LIMIT 1;
INSERT INTO availability (user_id, day_of_week, start_time, end_time)
SELECT id, 'Thursday', '09:00:00', '17:00:00' FROM users WHERE email='admin@example.com' LIMIT 1;
INSERT INTO availability (user_id, day_of_week, start_time, end_time)
SELECT id, 'Friday', '09:00:00', '17:00:00' FROM users WHERE email='admin@example.com' LIMIT 1;
