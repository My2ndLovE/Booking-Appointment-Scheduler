-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  logo_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  business_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "17:00", "enabled": true},
    "tuesday": {"open": "09:00", "close": "17:00", "enabled": true},
    "wednesday": {"open": "09:00", "close": "17:00", "enabled": true},
    "thursday": {"open": "09:00", "close": "17:00", "enabled": true},
    "friday": {"open": "09:00", "close": "17:00", "enabled": true},
    "saturday": {"open": "10:00", "close": "14:00", "enabled": false},
    "sunday": {"enabled": false}
  }'::jsonb,
  settings JSONB DEFAULT '{
    "booking_buffer_minutes": 15,
    "max_advance_booking_days": 30,
    "min_advance_booking_hours": 2,
    "cancellation_hours": 24,
    "timezone": "UTC"
  }'::jsonb,
  stripe_account_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_slug ON organizations(slug);
CREATE INDEX idx_org_active ON organizations(is_active);

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{
    "timezone": "UTC",
    "email_notifications": true,
    "sms_notifications": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_org ON users(organization_id);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  buffer_time_minutes INTEGER DEFAULT 0,
  max_advance_booking_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_org ON services(organization_id);
CREATE INDEX idx_service_active ON services(organization_id, is_active);

-- Staff members table
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(100),
  bio TEXT,
  working_hours JSONB DEFAULT '{
    "monday": [{"start": "09:00", "end": "17:00"}],
    "tuesday": [{"start": "09:00", "end": "17:00"}],
    "wednesday": [{"start": "09:00", "end": "17:00"}],
    "thursday": [{"start": "09:00", "end": "17:00"}],
    "friday": [{"start": "09:00", "end": "17:00"}],
    "saturday": [],
    "sunday": [],
    "exceptions": {}
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_staff_org ON staff_members(organization_id);
CREATE INDEX idx_staff_user ON staff_members(user_id);
CREATE INDEX idx_staff_active ON staff_members(organization_id, is_active);

-- Staff services junction table
CREATE TABLE staff_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, service_id)
);

CREATE INDEX idx_staff_services_staff ON staff_services(staff_id);
CREATE INDEX idx_staff_services_service ON staff_services(service_id);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  staff_id UUID NOT NULL REFERENCES staff_members(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  price DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  payment_intent_id VARCHAR(255),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_org ON bookings(organization_id);
CREATE INDEX idx_booking_staff_date ON bookings(staff_id, booking_date);
CREATE INDEX idx_booking_customer ON bookings(customer_id);
CREATE INDEX idx_booking_status ON bookings(status);
CREATE INDEX idx_booking_date ON bookings(booking_date);

-- Prevent double booking (unique constraint for same staff, date, and time)
CREATE UNIQUE INDEX idx_booking_no_overlap
ON bookings(staff_id, booking_date, start_time)
WHERE status IN ('pending', 'confirmed');

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Availability check function
CREATE OR REPLACE FUNCTION check_staff_availability(
  p_staff_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
  v_conflict_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM bookings
  WHERE staff_id = p_staff_id
    AND booking_date = p_date
    AND status IN ('pending', 'confirmed')
    AND (start_time, end_time) OVERLAPS (p_start_time, p_end_time);

  RETURN v_conflict_count = 0;
END;
$$ LANGUAGE plpgsql;
