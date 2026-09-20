INSERT INTO temples (name, location, capacity, description) VALUES
('Banke Bihari Temple', 'Vrindavan', 10000, 'Ancient temple dedicated to Lord Krishna'),
('Dauji Temple', 'Baldeo', 8000, 'Shiva temple with historical significance'),
('Dwarkadhish Temple', 'Mathura', 12000, 'Grand temple of Lord Krishna'),
('Giriraj Ji Temple', 'Govardhan', 6000, 'Sacred mountain temple'),
('Prem Mandir', 'Vrindavan', 9000, 'Modern architectural marvel'),
('Radha Rani Temple', 'Barsana', 7000, 'Devotion to Radha Ji'),
('Shri Krishna Janmabhoomi', 'Mathura', 15000, 'Birthplace of Lord Krishna');

INSERT INTO darshan_types (temple_id, name, description, price, duration_minutes) VALUES
(1, 'Regular Darshan', 'Standard darshan experience', 0, 30),
(1, 'VIP Darshan', 'Priority access with less waiting', 500, 30),
(1, 'Special Pooja Darshan', 'Includes special prayers', 1000, 45),
(2, 'Regular Darshan', 'Standard darshan', 0, 30),
(3, 'Regular Darshan', 'Standard darshan', 0, 30),
(3, 'VIP Darshan', 'VIP priority access', 500, 30);

INSERT INTO time_slots (temple_id, date, start_time, end_time, capacity, booked, status) VALUES
(1, CURDATE(), '06:00:00', '07:00:00', 1000, 650, 'limited'),
(1, CURDATE(), '07:00:00', '08:00:00', 1000, 820, 'almost_full'),
(1, CURDATE(), '08:00:00', '09:00:00', 1000, 990, 'full'),
(1, CURDATE(), '09:00:00', '10:00:00', 1000, 1000, 'full'),
(1, CURDATE(), '05:00:00', '06:00:00', 1000, 680, 'limited'),
(1, CURDATE(), '10:00:00', '11:00:00', 1000, 860, 'limited'),
(1, CURDATE(), '11:00:00', '12:00:00', 1000, 940, 'limited'),
(2, CURDATE(), '06:00:00', '07:00:00', 1000, 400, 'available'),
(3, CURDATE(), '06:00:00', '07:00:00', 1500, 800, 'limited');

INSERT INTO gates (temple_id, name, capacity, current_crowd, risk_level) VALUES
(1, 'Gate A', 2000, 1820, 'critical'),
(1, 'Gate B', 1800, 900, 'moderate'),
(1, 'Gate C', 2000, 1200, 'high'),
(1, 'Gate D', 2200, 950, 'moderate'),
(2, 'Main Gate', 2000, 400, 'safe'),
(3, 'Gate 1', 2500, 1500, 'high'),
(3, 'Gate 2', 2500, 1600, 'high');

INSERT INTO parking (temple_id, name, capacity, occupied) VALUES
(1, 'Parking A', 500, 410),
(1, 'Parking B', 350, 140),
(1, 'Parking C', 200, 160),
(2, 'Main Parking', 300, 150),
(3, 'Parking East', 600, 450),
(3, 'Parking West', 500, 280);

INSERT INTO users (name, email, password, phone, role) VALUES
('Admin User', 'admin@darshansetu.com', '$2a$10$.3W4Xu6IVf4Q5v8OvvKQn.aOHRuc1apnMqi2XFk7CjoJlqJvqpLAC', '9876543210', 'admin'),
('John Visitor', 'john@example.com', '$2a$10$.3W4Xu6IVf4Q5v8OvvKQn.aOHRuc1apnMqi2XFk7CjoJlqJvqpLAC', '9876543211', 'user'),
('Staff Member', 'staff@darshansetu.com', '$2a$10$.3W4Xu6IVf4Q5v8OvvKQn.aOHRuc1apnMqi2XFk7CjoJlqJvqpLAC', '9876543212', 'staff'),
('Jane Visitor', 'jane@example.com', '$2a$10$.3W4Xu6IVf4Q5v8OvvKQn.aOHRuc1apnMqi2XFk7CjoJlqJvqpLAC', '9876543213', 'user');

INSERT INTO users (name, email, password, phone, role) VALUES
('Amit Kumar', 'amit.staff@darshansetu.com', NULL, '9876500001', 'staff'),
('Pooja Rao', 'pooja.staff@darshansetu.com', NULL, '9876500002', 'staff'),
('Ravi Das', 'ravi.staff@darshansetu.com', NULL, '9876500003', 'staff'),
('Neha Sharma', 'neha.staff@darshansetu.com', NULL, '9876500004', 'staff'),
('Vikram Singh', 'vikram.staff@darshansetu.com', NULL, '9876500005', 'staff'),
('Meera Joshi', 'meera.staff@darshansetu.com', NULL, '9876500006', 'staff');

INSERT INTO staff_profiles (user_id, temple_id, staff_id, staff_role, assigned_zone, shift_start, shift_end, status, assignment, priority, current_location, emergency_contact, joining_date)
SELECT id, 1, 'ST-001', 'Security', 'Gate 3', '08:00:00', '16:00:00', 'Active', 'Gate Security', 'HIGH', 'Gate 3', '9876511001', '2023-04-12' FROM users WHERE phone = '9876500001'
UNION ALL SELECT id, 1, 'ST-014', 'Medical', 'Main Entrance', '12:00:00', '20:00:00', 'On Break', 'Medical Support', 'MEDIUM', 'Staff Room', '9876511002', '2023-07-19' FROM users WHERE phone = '9876500002'
UNION ALL SELECT id, 1, 'ST-022', 'Security', 'Queue Zone B', '16:00:00', '00:00:00', 'Emergency Deployment', 'Emergency Response', 'CRITICAL', 'Queue Zone B', '9876511003', '2024-01-08' FROM users WHERE phone = '9876500003'
UNION ALL SELECT id, 1, 'ST-031', 'Crowd Control', 'Gate 2', '06:00:00', '14:00:00', 'Available', 'Crowd Control', 'MEDIUM', 'Operations Desk', '9876511004', '2024-02-14' FROM users WHERE phone = '9876500004'
UNION ALL SELECT id, 1, 'ST-044', 'Parking', 'Parking A', '08:00:00', '16:00:00', 'Active', 'Parking Management', 'LOW', 'Parking A', '9876511005', '2024-03-21' FROM users WHERE phone = '9876500005'
UNION ALL SELECT id, 1, 'ST-052', 'Support', 'Temple Courtyard', '10:00:00', '18:00:00', 'Off Duty', 'Regular Duty', 'LOW', 'Off Duty', '9876511006', '2024-05-03' FROM users WHERE phone = '9876500006';

INSERT INTO bookings (booking_id, user_id, temple_id, darshan_type_id, time_slot_id, number_of_visitors, gate_assignment, booking_status, payment_status, booking_date, booking_time) VALUES
('BK-20240524-1001', 2, 1, 1, 1, 3, 'A-127', 'confirmed', 'paid', '2024-05-24', '06:30:00'),
('BK-20240524-1002', 2, 1, 2, 2, 2, 'B-205', 'completed', 'paid', '2024-05-24', '07:15:00'),
('BK-20240524-1003', 4, 1, 1, 3, 1, 'C-312', 'confirmed', 'unpaid', '2024-05-24', '08:00:00'),
('BK-20240524-1004', 4, 2, 4, 8, 4, 'Main', 'confirmed', 'paid', '2024-05-24', '06:00:00'),
('BK-20240524-1005', 2, 3, 5, 9, 2, 'Gate 1', 'pending', 'unpaid', '2024-05-24', '06:45:00');

INSERT INTO checkins (booking_id, gate_id, status) VALUES
(1, 1, 'checked_in'),
(2, 2, 'completed'),
(4, 5, 'checked_in');

INSERT INTO notifications (user_id, title, message, notification_type, read_status) VALUES
(2, 'Booking Confirmed', 'Your booking BK-20240524-1001 has been confirmed', 'booking', 0),
(2, 'Crowd Alert', 'High crowd expected at Gate 3 in next 30 minutes', 'alert', 1),
(4, 'Booking Confirmation', 'Your booking BK-20240524-1003 has been confirmed', 'booking', 0),
(4, 'Announcement', 'Temple will close at 8 PM today for maintenance', 'announcement', 0),
(2, 'Queue Update', 'You are 5th in queue at Gate B', 'queue', 1);

INSERT INTO emergency_alerts (incident_id, temple_id, alert_type, location, description, priority, status) VALUES
('INC-1001', 1, 'medical', 'Gate 3', 'Minor medical emergency reported', 'high', 'resolved'),
('INC-1002', 1, 'crowd_surge', 'Queue Zone B', 'Sudden crowd surge in queue area', 'high', 'responding'),
('INC-1003', 3, 'security', 'Parking B', 'Suspicious activity reported', 'medium', 'assigned');

INSERT INTO crowd_analytics (temple_id, date, hour, estimated_crowd, predicted_crowd, occupancy_percentage, risk_level) VALUES
(1, '2024-05-24', 6, 2500, 3000, 25, 'safe'),
(1, '2024-05-24', 7, 5800, 7000, 58, 'moderate'),
(1, '2024-05-24', 8, 7850, 8500, 78, 'high'),
(1, '2024-05-24', 9, 7200, 7500, 72, 'high'),
(1, '2024-05-24', 10, 5500, 6000, 55, 'moderate'),
(2, '2024-05-24', 6, 1800, 2000, 22, 'safe'),
(3, '2024-05-24', 7, 6500, 7200, 54, 'moderate');

SELECT 'Temples' as table_name, COUNT(*) as count FROM temples
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Gates', COUNT(*) FROM gates
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Emergency Alerts', COUNT(*) FROM emergency_alerts
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;