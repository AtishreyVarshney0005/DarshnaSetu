CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(20) UNIQUE NOT NULL,
  role ENUM('user', 'admin', 'staff') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE temples (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  location VARCHAR(255),
  capacity INT DEFAULT 10000,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE darshan_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  temple_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  duration_minutes INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE time_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  temple_id INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INT DEFAULT 1000,
  booked INT DEFAULT 0,
  status ENUM('available', 'limited', 'almost_full', 'full') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_slot (temple_id, date, start_time),
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  temple_id INT NOT NULL,
  darshan_type_id INT NOT NULL,
  time_slot_id INT NOT NULL,
  number_of_visitors INT NOT NULL,
  gate_assignment VARCHAR(50),
  qr_code TEXT,
  qr_token CHAR(64) UNIQUE,
  booking_status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
  FOREIGN KEY (darshan_type_id) REFERENCES darshan_types(id),
  FOREIGN KEY (time_slot_id) REFERENCES time_slots(id)
);

CREATE TABLE gates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  temple_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  capacity INT DEFAULT 2000,
  current_crowd INT DEFAULT 0,
  risk_level ENUM('safe', 'moderate', 'high', 'critical') DEFAULT 'safe',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE queue_management (
  id INT PRIMARY KEY AUTO_INCREMENT,
  gate_id INT NOT NULL,
  booking_id INT NOT NULL,
  position INT,
  wait_time_minutes INT,
  status ENUM('waiting', 'in_progress', 'completed') DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gate_id) REFERENCES gates(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE parking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  temple_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  capacity INT DEFAULT 500,
  occupied INT DEFAULT 0,
  available INT,
  occupancy_percentage DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE crowd_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  temple_id INT NOT NULL,
  date DATE NOT NULL,
  hour INT,
  estimated_crowd INT,
  predicted_crowd INT,
  occupancy_percentage DECIMAL(5, 2),
  risk_level ENUM('safe', 'moderate', 'high', 'critical'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
  INDEX idx_temple_date (temple_id, date)
);

CREATE TABLE emergency_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  incident_id VARCHAR(50) UNIQUE NOT NULL,
  temple_id INT NOT NULL,
  alert_type ENUM('medical', 'fire', 'crowd_surge', 'missing_person', 'security', 'weather'),
  location VARCHAR(255),
  description TEXT,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('active', 'assigned', 'responding', 'resolved') DEFAULT 'active',
  assigned_staff INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  notification_type ENUM('booking', 'alert', 'announcement', 'queue') DEFAULT 'announcement',
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, read_status)
);

CREATE TABLE checkins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  gate_id INT,
  checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('checked_in', 'completed') DEFAULT 'checked_in',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (gate_id) REFERENCES gates(id)
);

CREATE TABLE staff_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  temple_id INT NOT NULL,
  staff_id VARCHAR(20) NOT NULL UNIQUE,
  staff_role ENUM('Security', 'Medical', 'Administration', 'Crowd Control', 'Parking', 'Queue Management', 'Support') DEFAULT 'Support',
  assigned_zone VARCHAR(100) DEFAULT 'Main Entrance',
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  status ENUM('Active', 'Available', 'On Break', 'Emergency Deployment', 'Off Duty') DEFAULT 'Available',
  assignment VARCHAR(100) DEFAULT 'Regular Duty',
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
  deployment_notes TEXT,
  current_location VARCHAR(100),
  emergency_contact VARCHAR(20),
  joining_date DATE,
  last_deployment DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
  INDEX idx_staff_temple_status (temple_id, status),
  INDEX idx_staff_role (staff_role),
  INDEX idx_staff_zone (assigned_zone)
);

CREATE TABLE staff_deployments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deployment_id VARCHAR(30) NOT NULL UNIQUE,
  staff_profile_id INT NOT NULL,
  incident_id VARCHAR(50),
  zone VARCHAR(100) NOT NULL,
  assignment VARCHAR(100) NOT NULL,
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
  notes TEXT,
  deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deployed_by INT,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  FOREIGN KEY (staff_profile_id) REFERENCES staff_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (deployed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_deployment_staff_status (staff_profile_id, status)
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_temple ON bookings(temple_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_time_slots_temple ON time_slots(temple_id);
CREATE INDEX idx_gates_temple ON gates(temple_id);
CREATE INDEX idx_parking_temple ON parking(temple_id);