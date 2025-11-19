-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ======================
-- ORGANIZATIONS POLICIES
-- ======================

-- Public can view active organizations
CREATE POLICY "Public organizations are viewable"
  ON organizations FOR SELECT
  USING (is_active = true);

-- Owners can manage their organization
CREATE POLICY "Owners can manage own organization"
  ON organizations FOR ALL
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ======================
-- USERS POLICIES
-- ======================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Owners/staff can view users in their organization
CREATE POLICY "Owners/staff can view org users"
  ON users FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'staff')
    )
  );

-- Anyone can insert (for signup)
CREATE POLICY "Anyone can signup"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- ======================
-- SERVICES POLICIES
-- ======================

-- Public can view active services
CREATE POLICY "Public services are viewable"
  ON services FOR SELECT
  USING (
    is_active = true
    AND organization_id IN (
      SELECT id FROM organizations WHERE is_active = true
    )
  );

-- Owners can manage services
CREATE POLICY "Owners can manage org services"
  ON services FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ======================
-- STAFF MEMBERS POLICIES
-- ======================

-- Public can view active staff
CREATE POLICY "Public staff are viewable"
  ON staff_members FOR SELECT
  USING (
    is_active = true
    AND organization_id IN (
      SELECT id FROM organizations WHERE is_active = true
    )
  );

-- Owners can manage staff
CREATE POLICY "Owners can manage org staff"
  ON staff_members FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Staff can view/update their own profile
CREATE POLICY "Staff can manage own profile"
  ON staff_members FOR ALL
  USING (user_id = auth.uid());

-- ======================
-- STAFF SERVICES POLICIES
-- ======================

-- Anyone can view staff services
CREATE POLICY "Public staff_services are viewable"
  ON staff_services FOR SELECT
  USING (true);

-- Owners can manage staff services
CREATE POLICY "Owners can manage staff_services"
  ON staff_services FOR ALL
  USING (
    staff_id IN (
      SELECT id FROM staff_members
      WHERE organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'owner'
      )
    )
  );

-- ======================
-- BOOKINGS POLICIES
-- ======================

-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  USING (customer_id = auth.uid());

-- Staff can view org bookings
CREATE POLICY "Staff can view org bookings"
  ON bookings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'staff')
    )
  );

-- Customers can create bookings
CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Staff can update org bookings
CREATE POLICY "Staff can update org bookings"
  ON bookings FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'staff')
    )
  );

-- Customers can update their own bookings (for cancellation)
CREATE POLICY "Customers can update own bookings"
  ON bookings FOR UPDATE
  USING (
    customer_id = auth.uid()
    AND status IN ('pending', 'confirmed')
  );
