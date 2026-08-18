-- Connection to Care (C2C) Database Schema
-- Run this migration in Supabase SQL Editor

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clinics Table (~220+ Partner and Area Clinics)
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    clinic_group VARCHAR(255) DEFAULT 'Independent',
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    phone VARCHAR(50) NOT NULL,
    fax VARCHAR(50) DEFAULT '800-555-0199',
    email VARCHAR(255) NOT NULL,
    is_partner BOOLEAN DEFAULT TRUE, -- TRUE = Tier 1 Partner Network, FALSE = Tier 2 Fallback Area Directory
    accepted_insurances TEXT[] NOT NULL DEFAULT '{}',
    avg_wait_days INT NOT NULL DEFAULT 10,
    guaranteed_availability_weeks INT NOT NULL DEFAULT 2, -- 2 to 3 weeks window
    rating NUMERIC(2, 1) DEFAULT 4.8,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Patients Table (Screening Intake & Referral Tracking)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    search_radius_miles INT DEFAULT 25,
    insurance_carrier VARCHAR(100) NOT NULL,
    insurance_plan VARCHAR(100) DEFAULT 'Standard PPO',
    urgency_level VARCHAR(50) NOT NULL DEFAULT 'URGENT_RED', -- URGENT_RED, PRIORITY_YELLOW, ROUTINE_GREEN
    screening_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TRIAGED', -- TRIAGED, MATCH_FOUND, CONSENT_REQUESTED, CONSENT_GRANTED, DISPATCHED, COMPLETED
    matched_clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    match_tier VARCHAR(20), -- TIER_1, TIER_2
    consent_token VARCHAR(255) DEFAULT encode(gen_random_bytes(16), 'hex'),
    consent_date TIMESTAMP WITH TIME ZONE,
    consent_signature VARCHAR(255),
    dispatched_at TIMESTAMP WITH TIME ZONE,
    triage_alert_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_clinics_zip ON clinics(zip);
CREATE INDEX IF NOT EXISTS idx_clinics_is_partner ON clinics(is_partner);
CREATE INDEX IF NOT EXISTS idx_clinics_availability ON clinics(guaranteed_availability_weeks);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_urgency ON patients(urgency_level);
CREATE INDEX IF NOT EXISTS idx_patients_consent_token ON patients(consent_token);

-- 5. Seed Initial Clinics Dataset (Representative Sample)
INSERT INTO clinics (name, clinic_group, address, city, state, zip, lat, lng, phone, fax, email, is_partner, accepted_insurances, avg_wait_days, guaranteed_availability_weeks, rating)
VALUES
-- New York Metro Hub (Tier 1 Partners)
('Manhattan Dermatology Associates', 'Metro Derm Partners', '420 Lexington Ave, Ste 800', 'New York', 'NY', '10017', 40.7527, -73.9772, '(212) 555-0143', '(212) 555-0144', 'referrals@manhattanderm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Medicare'], 7, 2, 4.9),
('Brooklyn Heights Skin & Laser Center', 'Metro Derm Partners', '142 Joralemon St', 'Brooklyn', 'NY', '11201', 40.6931, -73.9926, '(718) 555-0182', '(718) 555-0183', 'intake@brooklynhsderm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'Humana', 'Oxford', 'Medicare'], 10, 2, 4.8),
('Queens Advanced Dermatology Clinic', 'Metro Derm Partners', '108-18 Queens Blvd', 'Forest Hills', 'NY', '11375', 40.7208, -73.8451, '(718) 555-0199', '(718) 555-0198', 'care@queensderm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'UnitedHealthcare', 'Cigna', 'Medicare', 'EmblemHealth'], 12, 2, 4.7),
('Hudson Valley Dermatology Group', 'Metro Derm Partners', '19 Bradhurst Ave', 'Hawthorne', 'NY', '10532', 41.0998, -73.8051, '(914) 555-0120', '(914) 555-0121', 'referral@hudsonderm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna'], 8, 2, 4.8),

-- Tier 2 Area Fallback (New York)
('Gotham Regional Skin Center', 'Area Independent', '550 5th Ave', 'New York', 'NY', '10036', 40.7562, -73.9798, '(212) 555-0900', '(212) 555-0901', 'info@gothamderm.example.com', FALSE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Medicare', 'Humana', 'Kaiser'], 14, 3, 4.5),

-- Los Angeles / California Hub (Tier 1 Partners)
('Beverly Hills Dermatology Institute', 'Pacific Skin Health', '9033 Wilshire Blvd', 'Beverly Hills', 'CA', '90211', 34.0668, -118.3908, '(310) 555-0131', '(310) 555-0132', 'intake@beverlyhillsderm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Kaiser Permanente'], 6, 2, 4.9),
('Santa Monica Coastal Dermatology', 'Pacific Skin Health', '2001 Santa Monica Blvd', 'Santa Monica', 'CA', '90404', 34.0322, -118.4831, '(310) 555-0155', '(310) 555-0156', 'referrals@coastalderm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'Medicare'], 9, 2, 4.8),
('Pasadena Precision Skin Care', 'Pacific Skin Health', '50 Alessandro Pl', 'Pasadena', 'CA', '91105', 34.1381, -118.1565, '(626) 555-0188', '(626) 555-0189', 'triage@pasadenaskin.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'UnitedHealthcare', 'Humana', 'Medicare'], 11, 2, 4.7),
('Orange County Dermatology & Mohs', 'Pacific Skin Health', '1401 Avocado Ave', 'Newport Beach', 'CA', '92660', 33.6139, -117.8761, '(949) 555-0160', '(949) 555-0161', 'intake@ocdermmohs.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna'], 8, 2, 4.9),

-- Tier 2 Area Fallback (California)
('SoCal General Dermatology Network', 'Area Independent', '1100 S Flower St', 'Los Angeles', 'CA', '90015', 34.0410, -118.2642, '(213) 555-0720', '(213) 555-0721', 'referrals@socalgeneralderm.example.com', FALSE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Medicare', 'Kaiser Permanente', 'Humana'], 15, 3, 4.4),

-- Chicago / Midwest Hub (Tier 1 Partners)
('Magnificent Mile Dermatology', 'Midwest Derm Alliance', '676 N Michigan Ave', 'Chicago', 'IL', '60611', 41.8951, -87.6242, '(312) 555-0145', '(312) 555-0146', 'care@magmilederm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Humana', 'Medicare'], 7, 2, 4.9),
('North Shore Skin & Surgery Center', 'Midwest Derm Alliance', '1000 Central St', 'Evanston', 'IL', '60201', 42.0638, -87.6974, '(847) 555-0112', '(847) 555-0113', 'referrals@northshorederm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'UnitedHealthcare', 'Cigna', 'Medicare'], 10, 2, 4.8),
('Oak Brook Advanced Dermatology', 'Midwest Derm Alliance', '1200 Jorie Blvd', 'Oak Brook', 'IL', '60523', 41.8388, -87.9542, '(630) 555-0191', '(630) 555-0192', 'intake@oakbrookderm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'Humana', 'Medicare'], 8, 2, 4.8),

-- Tier 2 Area Fallback (Midwest)
('Greater Illinois Dermatology Associates', 'Area Independent', '233 S Wacker Dr', 'Chicago', 'IL', '60606', 41.8789, -87.6359, '(312) 555-0888', '(312) 555-0889', 'contact@greaterilderm.example.com', FALSE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Medicare', 'Humana'], 16, 3, 4.3),

-- Texas / Southern Hub (Tier 1 Partners)
('Houston Medical Center Dermatology', 'Lonestar Skin Specialists', '6560 Fannin St', 'Houston', 'TX', '77030', 29.7118, -95.3986, '(713) 555-0130', '(713) 555-0131', 'intake@houstondermmed.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Humana', 'Medicare'], 6, 2, 4.9),
('Dallas Uptown Dermatology Center', 'Lonestar Skin Specialists', '3600 McKinney Ave', 'Dallas', 'TX', '75204', 32.8021, -96.7997, '(214) 555-0174', '(214) 555-0175', 'referrals@dallasuptownderm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare'], 9, 2, 4.8),
('Austin Hill Country Dermatology', 'Lonestar Skin Specialists', '3801 N Lamar Blvd', 'Austin', 'TX', '78756', 30.3061, -97.7423, '(512) 555-0118', '(512) 555-0119', 'urgent@austinhillskin.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Cigna', 'Humana', 'Medicare'], 7, 2, 4.9),

-- Florida / Southeast Hub (Tier 1 Partners)
('Miami Beach Comprehensive Skin Clinic', 'SunState Dermatology', '4300 Alton Rd', 'Miami Beach', 'FL', '33140', 25.8152, -80.1384, '(305) 555-0166', '(305) 555-0167', 'intake@miamibeachderm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Humana', 'Medicare', 'Florida Blue'], 8, 2, 4.9),
('Orlando Central Florida Dermatology', 'SunState Dermatology', '100 W Gore St', 'Orlando', 'FL', '32806', 28.5284, -81.3802, '(407) 555-0122', '(407) 555-0123', 'referral@orlandoderm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Florida Blue'], 11, 2, 4.7),

-- Pacific Northwest / Mountain Hub (Tier 1 Partners)
('Seattle First Hill Dermatology', 'Cascadia Skin Health', '1229 Madison St', 'Seattle', 'WA', '98104', 47.6105, -122.3242, '(206) 555-0177', '(206) 555-0178', 'referrals@seattlederm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Premera', 'Medicare', 'Kaiser Permanente'], 7, 2, 4.9),
('Denver Cherry Creek Dermatology', 'Rocky Mountain Skin', '100 Saint Paul St', 'Denver', 'CO', '80206', 39.7188, -104.9515, '(303) 555-0144', '(303) 555-0145', 'urgent@denverderm.example.com', TRUE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Medicare'], 9, 2, 4.8),

-- Tier 2 Fallback Nationwide Fallback Directories
('Pacific Northwest Comprehensive Derm Network', 'Area Independent', '800 5th Ave', 'Seattle', 'WA', '98104', 47.6042, -122.3301, '(206) 555-0950', '(206) 555-0951', 'referrals@pnwdermnetwork.example.com', FALSE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Premera', 'Medicare', 'Kaiser Permanente'], 14, 3, 4.5),
('Colorado Regional Dermatology Specialists', 'Area Independent', '1700 Lincoln St', 'Denver', 'CO', '80203', 39.7439, -104.9858, '(303) 555-0970', '(303) 555-0971', 'intake@coloradodermspecialists.example.com', FALSE, ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Humana', 'Medicare'], 15, 3, 4.4)
ON CONFLICT DO NOTHING;
