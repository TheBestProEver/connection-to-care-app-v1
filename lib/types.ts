export type UrgencyLevel = 'URGENT_RED' | 'PRIORITY_YELLOW' | 'ROUTINE_GREEN';

export type ReferralStatus = 
  | 'TRIAGED'
  | 'MATCH_FOUND'
  | 'CONSENT_REQUESTED'
  | 'CONSENT_GRANTED'
  | 'DISPATCHED'
  | 'COMPLETED';

export type MatchTier = 'TIER_1' | 'TIER_2';

export interface Clinic {
  id: string;
  name: string;
  clinic_group?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  fax: string;
  email: string;
  is_partner: boolean; // true = Tier 1 Partner Network (~220 clinics), false = Tier 2 Area Fallback
  accepted_insurances: string[];
  avg_wait_days: number;
  guaranteed_availability_weeks: number; // <= 2-3 weeks requirement
  rating: number;
  active: boolean;
  created_at?: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zip: string;
  lat?: number;
  lng?: number;
  search_radius_miles: number;
  insurance_carrier: string;
  insurance_plan: string;
  urgency_level: UrgencyLevel;
  screening_notes?: string;
  status: ReferralStatus;
  matched_clinic_id?: string;
  matched_clinic?: Clinic;
  match_tier?: MatchTier;
  match_distance_miles?: number;
  consent_token: string;
  consent_date?: string;
  consent_signature?: string;
  dispatched_at?: string;
  triage_alert_sent_at?: string;
  created_at: string;
}

export interface MatchScoreResult {
  clinic: Clinic;
  distanceMiles: number;
  tier: MatchTier;
  matchScore: number;
  reason: string;
  isInsuranceMatch: boolean;
  isAvailabilityMatch: boolean;
  isWithinRadius: boolean;
}

export interface MatchOutput {
  patientId: string;
  matchedClinic: Clinic | null;
  tier: MatchTier | null;
  distanceMiles: number | null;
  allCandidates: MatchScoreResult[];
  success: boolean;
  message: string;
}

export interface BatchPatientRow {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zip: string;
  search_radius_miles?: number | string;
  insurance_carrier: string;
  insurance_plan?: string;
  urgency_level?: UrgencyLevel | string;
  screening_notes?: string;
}
