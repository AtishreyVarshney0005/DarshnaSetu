export default String.raw`
CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE temples (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  location VARCHAR(255),
  capacity INTEGER DEFAULT 10000,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE darshan_types (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  temple_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2),
  duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE time_slots (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  temple_id INTEGER NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER DEFAULT 1000,
  booked INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'limited', 'almost_full', 'full')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (temple_id, date, start_time),
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  temple_id INTEGER NOT NULL,
  darshan_type_id INTEGER NOT NULL,
  time_slot_id INTEGER NOT NULL,
  number_of_visitors INTEGER NOT NULL,
  gate_assignment VARCHAR(50),
  qr_code TEXT,
  qr_token CHAR(64) UNIQUE,
  booking_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
  FOREIGN KEY (darshan_type_id) REFERENCES darshan_types(id),
  FOREIGN KEY (time_slot_id) REFERENCES time_slots(id)
);

CREATE TABLE gates (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  temple_id INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  capacity INTEGER DEFAULT 2000,
  current_crowd INTEGER DEFAULT 0,
  risk_level VARCHAR(20) NOT NULL DEFAULT 'safe' CHECK (risk_level IN ('safe', 'moderate', 'high', 'critical')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE queue_management (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  gate_id INTEGER NOT NULL,
  booking_id INTEGER NOT NULL,
  position INTEGER,
  wait_time_minutes INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gate_id) REFERENCES gates(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE parking (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  temple_id INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  capacity INTEGER DEFAULT 500,
  occupied INTEGER DEFAULT 0,
  available INTEGER,
  occupancy_percentage NUMERIC(5, 2),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE crowd_analytics (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  temple_id INTEGER NOT NULL,
  date DATE NOT NULL,
  hour INTEGER,
  estimated_crowd INTEGER,
  predicted_crowd INTEGER,
  occupancy_percentage NUMERIC(5, 2),
  risk_level VARCHAR(20) CHECK (risk_level IN ('safe', 'moderate', 'high', 'critical')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE emergency_alerts (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  incident_id VARCHAR(50) UNIQUE NOT NULL,
  temple_id INTEGER NOT NULL,
  alert_type VARCHAR(30) CHECK (alert_type IN ('medical', 'fire', 'crowd_surge', 'missing_person', 'security', 'weather')),
  location VARCHAR(255),
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'assigned', 'responding', 'resolved')),
  assigned_staff INTEGER,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  notification_type VARCHAR(20) NOT NULL DEFAULT 'announcement' CHECK (notification_type IN ('booking', 'alert', 'announcement', 'queue')),
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE checkins (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id INTEGER NOT NULL,
  gate_id INTEGER,
  checkin_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'completed')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (gate_id) REFERENCES gates(id)
);

CREATE TABLE staff_profiles (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  temple_id INTEGER NOT NULL,
  staff_id VARCHAR(20) NOT NULL UNIQUE,
  staff_role VARCHAR(30) NOT NULL DEFAULT 'Support' CHECK (staff_role IN ('Security', 'Medical', 'Administration', 'Crowd Control', 'Parking', 'Queue Management', 'Support')),
  assigned_zone VARCHAR(100) DEFAULT 'Main Entrance',
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Available' CHECK (status IN ('Active', 'Available', 'On Break', 'Emergency Deployment', 'Off Duty')),
  assignment VARCHAR(100) DEFAULT 'Regular Duty',
  priority VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  deployment_notes TEXT,
  current_location VARCHAR(100),
  emergency_contact VARCHAR(20),
  joining_date DATE,
  last_deployment TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
);

CREATE TABLE staff_deployments (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  deployment_id VARCHAR(30) NOT NULL UNIQUE,
  staff_profile_id INTEGER NOT NULL,
  incident_id VARCHAR(50),
  zone VARCHAR(100) NOT NULL,
  assignment VARCHAR(100) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  notes TEXT,
  deployed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deployed_by INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  FOREIGN KEY (staff_profile_id) REFERENCES staff_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (deployed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_temple ON bookings(temple_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_time_slots_temple ON time_slots(temple_id);
CREATE INDEX idx_gates_temple ON gates(temple_id);
CREATE INDEX idx_parking_temple ON parking(temple_id);
CREATE INDEX idx_temple_date ON crowd_analytics(temple_id, date);
CREATE INDEX idx_user_read ON notifications(user_id, read_status);
CREATE INDEX idx_staff_temple_status ON staff_profiles(temple_id, status);
CREATE INDEX idx_staff_role ON staff_profiles(staff_role);
CREATE INDEX idx_staff_zone ON staff_profiles(assigned_zone);
CREATE INDEX idx_deployment_staff_status ON staff_deployments(staff_profile_id, status);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER temples_set_updated_at BEFORE UPDATE ON temples FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER gates_set_updated_at BEFORE UPDATE ON gates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER queue_management_set_updated_at BEFORE UPDATE ON queue_management FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER parking_set_updated_at BEFORE UPDATE ON parking FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER emergency_alerts_set_updated_at BEFORE UPDATE ON emergency_alerts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER staff_profiles_set_updated_at BEFORE UPDATE ON staff_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
`;
