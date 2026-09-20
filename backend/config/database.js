import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'darshansetu',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const testConnection = async () => {
  try {
    if (process.env.DB_PASSWORD === undefined) {
      throw new Error('DB_PASSWORD is not configured. Create backend/.env from .env.example and set the MySQL password.');
    }

    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    await connection.release();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

export const ensureStaffSchema = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`CREATE TABLE IF NOT EXISTS staff_profiles (
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
    )`);
    await connection.query(`CREATE TABLE IF NOT EXISTS staff_deployments (
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
    )`);
    await connection.query(`INSERT IGNORE INTO users (name, email, phone, role) VALUES
      ('Amit Kumar', 'amit.staff@darshansetu.com', '9876500001', 'staff'),
      ('Pooja Rao', 'pooja.staff@darshansetu.com', '9876500002', 'staff'),
      ('Ravi Das', 'ravi.staff@darshansetu.com', '9876500003', 'staff'),
      ('Neha Sharma', 'neha.staff@darshansetu.com', '9876500004', 'staff'),
      ('Vikram Singh', 'vikram.staff@darshansetu.com', '9876500005', 'staff'),
      ('Meera Joshi', 'meera.staff@darshansetu.com', '9876500006', 'staff')`);
    await connection.query(`INSERT IGNORE INTO staff_profiles (user_id, temple_id, staff_id, staff_role, assigned_zone, shift_start, shift_end, status, assignment, priority, current_location, emergency_contact, joining_date)
      SELECT id, 1, 'ST-001', 'Security', 'Gate 3', '08:00:00', '16:00:00', 'Active', 'Gate Security', 'HIGH', 'Gate 3', '9876511001', '2023-04-12' FROM users WHERE phone = '9876500001'
      UNION ALL SELECT id, 1, 'ST-014', 'Medical', 'Main Entrance', '12:00:00', '20:00:00', 'On Break', 'Medical Support', 'MEDIUM', 'Staff Room', '9876511002', '2023-07-19' FROM users WHERE phone = '9876500002'
      UNION ALL SELECT id, 1, 'ST-022', 'Security', 'Queue Zone B', '16:00:00', '00:00:00', 'Emergency Deployment', 'Emergency Response', 'CRITICAL', 'Queue Zone B', '9876511003', '2024-01-08' FROM users WHERE phone = '9876500003'
      UNION ALL SELECT id, 1, 'ST-031', 'Crowd Control', 'Gate 2', '06:00:00', '14:00:00', 'Available', 'Crowd Control', 'MEDIUM', 'Operations Desk', '9876511004', '2024-02-14' FROM users WHERE phone = '9876500004'
      UNION ALL SELECT id, 1, 'ST-044', 'Parking', 'Parking A', '08:00:00', '16:00:00', 'Active', 'Parking Management', 'LOW', 'Parking A', '9876511005', '2024-03-21' FROM users WHERE phone = '9876500005'
      UNION ALL SELECT id, 1, 'ST-052', 'Support', 'Temple Courtyard', '10:00:00', '18:00:00', 'Off Duty', 'Regular Duty', 'LOW', 'Off Duty', '9876511006', '2024-05-03' FROM users WHERE phone = '9876500006'`);
  } finally {
    await connection.release();
  }
};

export default pool;
