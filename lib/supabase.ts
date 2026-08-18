import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Clinic, Patient, UrgencyLevel, ReferralStatus, MatchTier } from './types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if live Supabase is configured with real credentials
const isLiveSupabase = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isLiveSupabase
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// ============================================================
// In-Memory Fallback Store (Used when running in local dev / without Supabase credentials)
// ============================================================

export const INITIAL_CLINICS: Clinic[] = [
  // --- New York Metro Hub ---
  {
    id: 'clinic-ny-01',
    name: 'Manhattan Dermatology Associates',
    clinic_group: 'Metro Derm Partners',
    address: '420 Lexington Ave, Ste 800',
    city: 'New York',
    state: 'NY',
    zip: '10017',
    lat: 40.7527,
    lng: -73.9772,
    phone: '(212) 555-0143',
    fax: '(212) 555-0144',
    email: 'referrals@manhattanderm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Medicare'],
    avg_wait_days: 7,
    guaranteed_availability_weeks: 2,
    rating: 4.9,
    active: true,
  },
  {
    id: 'clinic-ny-02',
    name: 'Brooklyn Heights Skin & Laser Center',
    clinic_group: 'Metro Derm Partners',
    address: '142 Joralemon St',
    city: 'Brooklyn',
    state: 'NY',
    zip: '11201',
    lat: 40.6931,
    lng: -73.9926,
    phone: '(718) 555-0182',
    fax: '(718) 555-0183',
    email: 'intake@brooklynhsderm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'Humana', 'Oxford', 'Medicare'],
    avg_wait_days: 10,
    guaranteed_availability_weeks: 2,
    rating: 4.8,
    active: true,
  },
  {
    id: 'clinic-ny-03',
    name: 'Queens Advanced Dermatology Clinic',
    clinic_group: 'Metro Derm Partners',
    address: '108-18 Queens Blvd',
    city: 'Forest Hills',
    state: 'NY',
    zip: '11375',
    lat: 40.7208,
    lng: -73.8451,
    phone: '(718) 555-0199',
    fax: '(718) 555-0198',
    email: 'care@queensderm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'UnitedHealthcare', 'Cigna', 'Medicare', 'EmblemHealth'],
    avg_wait_days: 12,
    guaranteed_availability_weeks: 2,
    rating: 4.7,
    active: true,
  },
  {
    id: 'clinic-ny-04',
    name: 'Hudson Valley Dermatology Group',
    clinic_group: 'Metro Derm Partners',
    address: '19 Bradhurst Ave',
    city: 'Hawthorne',
    state: 'NY',
    zip: '10532',
    lat: 41.0998,
    lng: -73.8051,
    phone: '(914) 555-0120',
    fax: '(914) 555-0121',
    email: 'referral@hudsonderm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna'],
    avg_wait_days: 8,
    guaranteed_availability_weeks: 2,
    rating: 4.8,
    active: true,
  },
  {
    id: 'clinic-ny-fallback',
    name: 'Gotham Regional Skin Center (Tier 2 Fallback)',
    clinic_group: 'Area Independent Directory',
    address: '550 5th Ave',
    city: 'New York',
    state: 'NY',
    zip: '10036',
    lat: 40.7562,
    lng: -73.9798,
    phone: '(212) 555-0900',
    fax: '(212) 555-0901',
    email: 'info@gothamderm.example.com',
    is_partner: false,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Medicare', 'Humana', 'Kaiser Permanente'],
    avg_wait_days: 14,
    guaranteed_availability_weeks: 3,
    rating: 4.5,
    active: true,
  },

  // --- Los Angeles & California Hub ---
  {
    id: 'clinic-ca-01',
    name: 'Beverly Hills Dermatology Institute',
    clinic_group: 'Pacific Skin Health',
    address: '9033 Wilshire Blvd',
    city: 'Beverly Hills',
    state: 'CA',
    zip: '90211',
    lat: 34.0668,
    lng: -118.3908,
    phone: '(310) 555-0131',
    fax: '(310) 555-0132',
    email: 'intake@beverlyhillsderm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Kaiser Permanente'],
    avg_wait_days: 6,
    guaranteed_availability_weeks: 2,
    rating: 4.9,
    active: true,
  },
  {
    id: 'clinic-ca-02',
    name: 'Santa Monica Coastal Dermatology',
    clinic_group: 'Pacific Skin Health',
    address: '2001 Santa Monica Blvd',
    city: 'Santa Monica',
    state: 'CA',
    zip: '90404',
    lat: 34.0322,
    lng: -118.4831,
    phone: '(310) 555-0155',
    fax: '(310) 555-0156',
    email: 'referrals@coastalderm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'Medicare'],
    avg_wait_days: 9,
    guaranteed_availability_weeks: 2,
    rating: 4.8,
    active: true,
  },
  {
    id: 'clinic-ca-03',
    name: 'Pasadena Precision Skin Care',
    clinic_group: 'Pacific Skin Health',
    address: '50 Alessandro Pl',
    city: 'Pasadena',
    state: 'CA',
    zip: '91105',
    lat: 34.1381,
    lng: -118.1565,
    phone: '(626) 555-0188',
    fax: '(626) 555-0189',
    email: 'triage@pasadenaskin.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'UnitedHealthcare', 'Humana', 'Medicare'],
    avg_wait_days: 11,
    guaranteed_availability_weeks: 2,
    rating: 4.7,
    active: true,
  },
  {
    id: 'clinic-ca-fallback',
    name: 'SoCal General Dermatology Network (Tier 2 Fallback)',
    clinic_group: 'Area Independent Directory',
    address: '1100 S Flower St',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90015',
    lat: 34.0410,
    lng: -118.2642,
    phone: '(213) 555-0720',
    fax: '(213) 555-0721',
    email: 'referrals@socalgeneralderm.example.com',
    is_partner: false,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Medicare', 'Kaiser Permanente', 'Humana'],
    avg_wait_days: 15,
    guaranteed_availability_weeks: 3,
    rating: 4.4,
    active: true,
  },

  // --- Chicago / Midwest Hub ---
  {
    id: 'clinic-il-01',
    name: 'Magnificent Mile Dermatology',
    clinic_group: 'Midwest Derm Alliance',
    address: '676 N Michigan Ave',
    city: 'Chicago',
    state: 'IL',
    zip: '60611',
    lat: 41.8951,
    lng: -87.6242,
    phone: '(312) 555-0145',
    fax: '(312) 555-0146',
    email: 'care@magmilederm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Humana', 'Medicare'],
    avg_wait_days: 7,
    guaranteed_availability_weeks: 2,
    rating: 4.9,
    active: true,
  },
  {
    id: 'clinic-il-02',
    name: 'North Shore Skin & Surgery Center',
    clinic_group: 'Midwest Derm Alliance',
    address: '1000 Central St',
    city: 'Evanston',
    state: 'IL',
    zip: '60201',
    lat: 42.0638,
    lng: -87.6974,
    phone: '(847) 555-0112',
    fax: '(847) 555-0113',
    email: 'referrals@northshorederm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'UnitedHealthcare', 'Cigna', 'Medicare'],
    avg_wait_days: 10,
    guaranteed_availability_weeks: 2,
    rating: 4.8,
    active: true,
  },

  // --- Texas / Southern Hub ---
  {
    id: 'clinic-tx-01',
    name: 'Houston Medical Center Dermatology',
    clinic_group: 'Lonestar Skin Specialists',
    address: '6560 Fannin St',
    city: 'Houston',
    state: 'TX',
    zip: '77030',
    lat: 29.7118,
    lng: -95.3986,
    phone: '(713) 555-0130',
    fax: '(713) 555-0131',
    email: 'intake@houstondermmed.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Humana', 'Medicare'],
    avg_wait_days: 6,
    guaranteed_availability_weeks: 2,
    rating: 4.9,
    active: true,
  },
  {
    id: 'clinic-tx-02',
    name: 'Dallas Uptown Dermatology Center',
    clinic_group: 'Lonestar Skin Specialists',
    address: '3600 McKinney Ave',
    city: 'Dallas',
    state: 'TX',
    zip: '75204',
    lat: 32.8021,
    lng: -96.7997,
    phone: '(214) 555-0174',
    fax: '(214) 555-0175',
    email: 'referrals@dallasuptownderm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare'],
    avg_wait_days: 9,
    guaranteed_availability_weeks: 2,
    rating: 4.8,
    active: true,
  },

  // --- Florida / Southeast Hub ---
  {
    id: 'clinic-fl-01',
    name: 'Miami Beach Comprehensive Skin Clinic',
    clinic_group: 'SunState Dermatology',
    address: '4300 Alton Rd',
    city: 'Miami Beach',
    state: 'FL',
    zip: '33140',
    lat: 25.8152,
    lng: -80.1384,
    phone: '(305) 555-0166',
    fax: '(305) 555-0167',
    email: 'intake@miamibeachderm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Humana', 'Medicare', 'Florida Blue'],
    avg_wait_days: 8,
    guaranteed_availability_weeks: 2,
    rating: 4.9,
    active: true,
  },

  // --- Pacific Northwest Hub ---
  {
    id: 'clinic-wa-01',
    name: 'Seattle First Hill Dermatology',
    clinic_group: 'Cascadia Skin Health',
    address: '1229 Madison St',
    city: 'Seattle',
    state: 'WA',
    zip: '98104',
    lat: 47.6105,
    lng: -122.3242,
    phone: '(206) 555-0177',
    fax: '(206) 555-0178',
    email: 'referrals@seattlederm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Premera', 'Medicare', 'Kaiser Permanente'],
    avg_wait_days: 7,
    guaranteed_availability_weeks: 2,
    rating: 4.9,
    active: true,
  },
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-101',
    first_name: 'Eleanor',
    last_name: 'Vance',
    email: 'eleanor.vance@example.com',
    phone: '(212) 555-8910',
    zip: '10001',
    search_radius_miles: 25,
    insurance_carrier: 'Blue Cross Blue Shield',
    insurance_plan: 'Preferred Gold PPO',
    urgency_level: 'URGENT_RED',
    screening_notes: 'Asymmetrical pigmented lesion on left shoulder with border irregularity (6mm). Patient reports rapid darkening over past 4 weeks.',
    status: 'TRIAGED',
    consent_token: 'tok_eleanor_8f92',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'pat-102',
    first_name: 'Marcus',
    last_name: 'Chen',
    email: 'marcus.chen@example.com',
    phone: '(310) 555-4321',
    zip: '90210',
    search_radius_miles: 20,
    insurance_carrier: 'Aetna',
    insurance_plan: 'Choice POS II',
    urgency_level: 'URGENT_RED',
    screening_notes: 'Nodular erythematous lesion on nasal bridge with central ulceration. High suspicion of basal cell or squamous cell carcinoma.',
    status: 'MATCH_FOUND',
    matched_clinic_id: 'clinic-ca-01',
    match_tier: 'TIER_1',
    match_distance_miles: 2.1,
    consent_token: 'tok_marcus_3a1b',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'pat-103',
    first_name: 'Sophia',
    last_name: 'Rodriguez',
    email: 'sophia.rodriguez@example.com',
    phone: '(312) 555-7744',
    zip: '60601',
    search_radius_miles: 25,
    insurance_carrier: 'UnitedHealthcare',
    insurance_plan: 'Choice Plus',
    urgency_level: 'URGENT_RED',
    screening_notes: 'Evolving melanocytic nevus on lower back. Dermoscopy shows atypical network and regression structures.',
    status: 'CONSENT_GRANTED',
    matched_clinic_id: 'clinic-il-01',
    match_tier: 'TIER_1',
    match_distance_miles: 1.2,
    consent_token: 'tok_sophia_9c4d',
    consent_date: new Date(Date.now() - 3600000 * 2).toISOString(),
    consent_signature: 'Sophia Rodriguez',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'pat-104',
    first_name: 'David',
    last_name: 'Miller',
    email: 'david.miller@example.com',
    phone: '(713) 555-6612',
    zip: '77002',
    search_radius_miles: 30,
    insurance_carrier: 'Humana',
    insurance_plan: 'National PPO',
    urgency_level: 'URGENT_RED',
    screening_notes: 'Suspected amelanotic melanoma right forearm. Dermoscopy recommended within 2 weeks.',
    status: 'COMPLETED',
    matched_clinic_id: 'clinic-tx-01',
    match_tier: 'TIER_1',
    match_distance_miles: 3.4,
    consent_token: 'tok_david_7e2a',
    consent_date: new Date(Date.now() - 3600000 * 40).toISOString(),
    consent_signature: 'David Miller',
    dispatched_at: new Date(Date.now() - 3600000 * 38).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

// Global in-memory storage (shared across API routes during local runtime)
class MemoryDatabase {
  private clinics: Map<string, Clinic> = new Map();
  private patients: Map<string, Patient> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    this.clinics.clear();
    INITIAL_CLINICS.forEach((c) => this.clinics.set(c.id, { ...c }));

    this.patients.clear();
    INITIAL_PATIENTS.forEach((p) => {
      const clone = { ...p };
      if (clone.matched_clinic_id) {
        clone.matched_clinic = this.clinics.get(clone.matched_clinic_id);
      }
      this.patients.set(clone.id, clone);
    });
  }

  getAllClinics(): Clinic[] {
    return Array.from(this.clinics.values());
  }

  getClinicById(id: string): Clinic | undefined {
    return this.clinics.get(id);
  }

  getAllPatients(): Patient[] {
    const list = Array.from(this.patients.values());
    return list.map((p) => {
      if (p.matched_clinic_id && !p.matched_clinic) {
        p.matched_clinic = this.clinics.get(p.matched_clinic_id);
      }
      return p;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getPatientById(id: string): Patient | undefined {
    const patient = this.patients.get(id);
    if (patient && patient.matched_clinic_id) {
      patient.matched_clinic = this.clinics.get(patient.matched_clinic_id);
    }
    return patient;
  }

  getPatientByToken(token: string): Patient | undefined {
    const patient = Array.from(this.patients.values()).find((p) => p.consent_token === token);
    if (patient && patient.matched_clinic_id) {
      patient.matched_clinic = this.clinics.get(patient.matched_clinic_id);
    }
    return patient;
  }

  savePatient(patient: Patient): Patient {
    this.patients.set(patient.id, { ...patient });
    return patient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const existing = this.patients.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    if (updated.matched_clinic_id) {
      updated.matched_clinic = this.clinics.get(updated.matched_clinic_id);
    }
    this.patients.set(id, updated);
    return updated;
  }

  deletePatient(id: string): boolean {
    return this.patients.delete(id);
  }
}

// Singleton in global scope for Next.js hot reloading
const globalForMemory = globalThis as unknown as { dbInstance?: MemoryDatabase };
export const db = globalForMemory.dbInstance || new MemoryDatabase();
if (process.env.NODE_ENV !== 'production') globalForMemory.dbInstance = db;
