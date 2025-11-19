-- Seed data for demo purposes
-- Run this after creating tables and RLS policies

-- Insert demo organizations
INSERT INTO organizations (slug, name, email, description, phone, timezone) VALUES
  ('serenity-spa', 'Serenity Spa & Wellness', 'info@serenityspa.com', 'Luxury spa and wellness center offering premium treatments', '(555) 123-4567', 'America/New_York'),
  ('healthfirst-clinic', 'HealthFirst Medical Clinic', 'contact@healthfirst.com', 'Professional medical services and consultations', '(555) 987-6543', 'America/Los_Angeles'),
  ('techconsult-pro', 'TechConsult Pro', 'hello@techconsult.com', 'Expert IT consulting and solutions', '(555) 456-7890', 'America/Chicago');

-- Note: Users need to be created through Supabase Auth
-- The following is just an example structure
-- After creating users via auth, insert into users table:

/*
-- Example for inserting users (after auth.users exists)
INSERT INTO users (id, email, full_name, role, organization_id) VALUES
  ('uuid-of-auth-user-1', 'owner@serenityspa.com', 'Sarah Johnson', 'owner', (SELECT id FROM organizations WHERE slug = 'serenity-spa')),
  ('uuid-of-auth-user-2', 'staff1@serenityspa.com', 'Emily Chen', 'staff', (SELECT id FROM organizations WHERE slug = 'serenity-spa')),
  ('uuid-of-auth-user-3', 'staff2@serenityspa.com', 'Michael Rodriguez', 'staff', (SELECT id FROM organizations WHERE slug = 'serenity-spa'));
*/

-- Insert demo services for Serenity Spa
INSERT INTO services (organization_id, name, description, duration_minutes, price, color) VALUES
  ((SELECT id FROM organizations WHERE slug = 'serenity-spa'), 'Swedish Massage', 'Relaxing full-body massage', 60, 89.00, '#3B82F6'),
  ((SELECT id FROM organizations WHERE slug = 'serenity-spa'), 'Deep Tissue Massage', 'Therapeutic deep tissue massage', 90, 129.00, '#8B5CF6'),
  ((SELECT id FROM organizations WHERE slug = 'serenity-spa'), 'Facial Treatment', 'Rejuvenating facial with skincare', 45, 75.00, '#EC4899'),
  ((SELECT id FROM organizations WHERE slug = 'serenity-spa'), 'Hot Stone Therapy', 'Relaxing hot stone massage', 75, 110.00, '#F59E0B'),
  ((SELECT id FROM organizations WHERE slug = 'serenity-spa'), 'Aromatherapy Session', 'Essential oils and massage therapy', 60, 95.00, '#10B981');

-- Insert demo services for HealthFirst Clinic
INSERT INTO services (organization_id, name, description, duration_minutes, price, color) VALUES
  ((SELECT id FROM organizations WHERE slug = 'healthfirst-clinic'), 'General Consultation', 'Initial medical consultation', 30, 150.00, '#3B82F6'),
  ((SELECT id FROM organizations WHERE slug = 'healthfirst-clinic'), 'Follow-up Appointment', 'Follow-up medical visit', 20, 100.00, '#10B981'),
  ((SELECT id FROM organizations WHERE slug = 'healthfirst-clinic'), 'Physical Examination', 'Comprehensive physical exam', 45, 200.00, '#F59E0B'),
  ((SELECT id FROM organizations WHERE slug = 'healthfirst-clinic'), 'Vaccination Service', 'Immunization and vaccination', 15, 75.00, '#EC4899');

-- Insert demo services for TechConsult Pro
INSERT INTO services (organization_id, name, description, duration_minutes, price, color) VALUES
  ((SELECT id FROM organizations WHERE slug = 'techconsult-pro'), 'IT Strategy Session', 'Technology planning and strategy', 60, 250.00, '#3B82F6'),
  ((SELECT id FROM organizations WHERE slug = 'techconsult-pro'), 'System Architecture Review', 'Technical architecture consultation', 90, 350.00, '#8B5CF6'),
  ((SELECT id FROM organizations WHERE slug = 'techconsult-pro'), 'Security Audit', 'Cybersecurity assessment', 120, 500.00, '#EF4444'),
  ((SELECT id FROM organizations WHERE slug = 'techconsult-pro'), 'Quick Tech Support', 'Technical support session', 30, 125.00, '#10B981');
