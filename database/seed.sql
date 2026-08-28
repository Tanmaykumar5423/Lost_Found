-- Seed Mock Data for Campus Lost & Found System

-- 1. Users (Passwords: 'password123' bcrypt hashed)
-- $2b$12$e86gXo.d8JmY9H3pG7wZheB35j0yC9c4e03pA8775.r7a2/zZkF76 is a bcrypt hash for 'password123'
INSERT INTO users (id, email, hashed_password, full_name, phone_number, role, karma_score, created_at)
VALUES 
(1, 'student@college.edu', '$2b$12$b86Gv8N2Q1aK0v3mR9hW7.qL6P5vK2nF7yE4pA3388.r1a2/zZkFa', 'Alex Morgan', '+1-555-0199', 'STUDENT', 120, NOW() - INTERVAL '10 days'),
(2, 'finder@college.edu', '$2b$12$b86Gv8N2Q1aK0v3mR9hW7.qL6P5vK2nF7yE4pA3388.r1a2/zZkFa', 'Samantha Chen', '+1-555-0188', 'STUDENT', 150, NOW() - INTERVAL '8 days'),
(3, 'admin@college.edu', '$2b$12$b86Gv8N2Q1aK0v3mR9hW7.qL6P5vK2nF7yE4pA3388.r1a2/zZkFa', 'Campus Security Desk', '+1-555-0100', 'SECURITY_ADMIN', 500, NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- 2. Items
INSERT INTO items (id, user_id, type, title, description, category, campus_zone, incident_time, is_high_value, private_details, status, created_at)
VALUES 
(1, 1, 'LOST', 'Midnight Blue Dell XPS 15', 'Dell XPS 15 inch laptop with Python & GitHub stickers on top lid. Serial number DL992384. Lost on 3rd floor library study desk.', 'ELECTRONICS', 'Library Zone', NOW() - INTERVAL '2 days', TRUE, 'Lock screen background is a green pine forest. Sticker on bottom says DevClub2025.', 'OPEN', NOW() - INTERVAL '2 days'),
(2, 2, 'FOUND', 'Dell Laptop in Library Reading Room', 'Found dark blue laptop left on table 14 in Central Library 3rd floor with coding stickers.', 'ELECTRONICS', 'Library Zone', NOW() - INTERVAL '1 day', TRUE, 'Contains serial tag DL992384 and green forest wallpaper.', 'OPEN', NOW() - INTERVAL '1 day'),
(3, 1, 'LOST', 'Student ID Card & Blue Lanyard', 'ID card for Alex Morgan, CS department, roll number CS2025-4491.', 'DOCUMENTS', 'Science Block', NOW() - INTERVAL '3 days', FALSE, 'Has silver dorm key attached to lanyard.', 'OPEN', NOW() - INTERVAL '3 days'),
(4, 2, 'FOUND', 'CS Student Smart ID Card', 'Found college ID card with lanyard near Physics lab 2.', 'DOCUMENTS', 'Science Block', NOW() - INTERVAL '2 days', FALSE, 'Name on card: Alex Morgan.', 'OPEN', NOW() - INTERVAL '2 days'),
(5, 1, 'LOST', 'Set of Dorm Room Keys', '3 brass keys on a metallic carabiner clip with Hostel 3 tag.', 'KEYS', 'Hostel 3', NOW() - INTERVAL '50 days', FALSE, 'Room 304 engraved on back.', 'OPEN', NOW() - INTERVAL '50 days')
ON CONFLICT (id) DO NOTHING;

-- Reset serial counters
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('items_id_seq', (SELECT MAX(id) FROM items));
