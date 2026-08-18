import { Clinic, MatchOutput, MatchScoreResult, MatchTier, Patient } from './types';
import { getCoordinatesForZip } from './zipCoordinates';

/**
 * Calculates distance between two coordinates in miles using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Normalizes insurance carrier names for robust matching
 */
export function normalizeInsurance(insurance: string): string {
  return insurance
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Checks if a clinic accepts the patient's insurance
 */
export function doesClinicAcceptInsurance(clinic: Clinic, patientInsurance: string): boolean {
  if (!patientInsurance) return false;
  const normalizedPatient = normalizeInsurance(patientInsurance);

  return clinic.accepted_insurances.some((ins) => {
    const normalizedClinic = normalizeInsurance(ins);
    return (
      normalizedClinic.includes(normalizedPatient) ||
      normalizedPatient.includes(normalizedClinic) ||
      (normalizedPatient.includes('bcbs') && normalizedClinic.includes('bluecross')) ||
      (normalizedPatient.includes('bluecross') && normalizedClinic.includes('bcbs')) ||
      (normalizedPatient.includes('united') && normalizedClinic.includes('united')) ||
      (normalizedPatient.includes('aetna') && normalizedClinic.includes('aetna')) ||
      (normalizedPatient.includes('cigna') && normalizedClinic.includes('cigna')) ||
      (normalizedPatient.includes('medicare') && normalizedClinic.includes('medicare')) ||
      (normalizedPatient.includes('kaiser') && normalizedClinic.includes('kaiser')) ||
      (normalizedPatient.includes('humana') && normalizedClinic.includes('humana'))
    );
  });
}

/**
 * Evaluates clinic suitability and computes a weighted match score
 */
function evaluateClinic(
  clinic: Clinic,
  patientLat: number,
  patientLng: number,
  searchRadius: number,
  patientInsurance: string,
  targetTier: MatchTier
): MatchScoreResult {
  const distance = calculateHaversineDistance(patientLat, patientLng, clinic.lat, clinic.lng);
  const isInsuranceMatch = doesClinicAcceptInsurance(clinic, patientInsurance);
  
  // Availability criteria: guaranteed within 2-3 weeks (avg_wait_days <= 21 or guaranteed_availability_weeks <= 3)
  const isAvailabilityMatch = clinic.guaranteed_availability_weeks <= 3 && clinic.avg_wait_days <= 21;
  const isWithinRadius = distance <= searchRadius;

  let matchScore = 0;
  const reasons: string[] = [];

  if (isInsuranceMatch) {
    matchScore += 40;
  } else {
    reasons.push('Insurance not in-network');
  }

  if (isAvailabilityMatch) {
    matchScore += 30;
    // Extra bonus for very fast availability (<= 7-10 days)
    if (clinic.avg_wait_days <= 10) {
      matchScore += 10;
    }
  } else {
    reasons.push('Wait time exceeds 2-3 weeks window');
  }

  if (isWithinRadius) {
    // Proximity score: closer clinics score higher
    const distanceFactor = Math.max(0, (searchRadius - distance) / searchRadius);
    matchScore += Math.round(distanceFactor * 20);
  } else {
    reasons.push(`Distance (${distance} mi) exceeds radius (${searchRadius} mi)`);
  }

  // Clinic rating bonus (up to 10 points)
  matchScore += Math.round((clinic.rating || 4.5) * 2);

  const reason =
    reasons.length === 0
      ? `Full match (${distance} mi, wait ~${clinic.avg_wait_days}d, accepts ${patientInsurance})`
      : reasons.join('; ');

  return {
    clinic,
    distanceMiles: distance,
    tier: targetTier,
    matchScore,
    reason,
    isInsuranceMatch,
    isAvailabilityMatch,
    isWithinRadius,
  };
}

/**
 * 2-Tier Referral Matching Algorithm
 * Tier 1: Searches active partner practice database (~220 clinics) filtering by location radius,
 *         insurance acceptance, and guaranteed appointment availability within 2-3 weeks.
 * Tier 2 (Fallback Area Search): If Tier 1 yields zero results, automatically expands search to all area
 *         dermatologists matching the insurance and 2-3 week availability window.
 */
export function executeTwoTierMatch(
  patient: Patient,
  clinicsDatabase: Clinic[]
): MatchOutput {
  // 1. Determine patient coordinates
  let patientLat = patient.lat;
  let patientLng = patient.lng;

  if (patientLat === undefined || patientLng === undefined || (patientLat === 0 && patientLng === 0)) {
    const coords = getCoordinatesForZip(patient.zip);
    patientLat = coords.lat;
    patientLng = coords.lng;
  }

  const radius = patient.search_radius_miles || 25;
  const insurance = patient.insurance_carrier || '';

  // ----------------------------------------------------
  // TIER 1: In-Network Partner Network Search (~220 clinics)
  // ----------------------------------------------------
  const partnerClinics = clinicsDatabase.filter((c) => c.active && c.is_partner);
  
  const tier1Evaluations = partnerClinics
    .map((clinic) => evaluateClinic(clinic, patientLat!, patientLng!, radius, insurance, 'TIER_1'))
    .filter((evalResult) => evalResult.isInsuranceMatch && evalResult.isAvailabilityMatch && evalResult.isWithinRadius)
    .sort((a, b) => {
      // Sort primarily by matchScore descending, then distance ascending, then wait days
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (a.distanceMiles !== b.distanceMiles) return a.distanceMiles - b.distanceMiles;
      return a.clinic.avg_wait_days - b.clinic.avg_wait_days;
    });

  if (tier1Evaluations.length > 0) {
    const bestMatch = tier1Evaluations[0];
    return {
      patientId: patient.id,
      matchedClinic: bestMatch.clinic,
      tier: 'TIER_1',
      distanceMiles: bestMatch.distanceMiles,
      allCandidates: tier1Evaluations,
      success: true,
      message: `Tier 1 In-Network Partner matched: ${bestMatch.clinic.name} (${bestMatch.distanceMiles} miles, est. wait ${bestMatch.clinic.avg_wait_days} days).`,
    };
  }

  // ----------------------------------------------------
  // TIER 2: Fallback Area Search (Expanded network / Area directories)
  // ----------------------------------------------------
  // When Tier 1 yields 0 results, expand search to all area clinics (both non-partner and expanded radius up to 60 miles)
  const expandedRadius = Math.max(radius * 1.5, 45);
  const areaClinics = clinicsDatabase.filter((c) => c.active);

  const tier2Evaluations = areaClinics
    .map((clinic) => evaluateClinic(clinic, patientLat!, patientLng!, expandedRadius, insurance, 'TIER_2'))
    .filter((evalResult) => evalResult.isInsuranceMatch && evalResult.isAvailabilityMatch && evalResult.isWithinRadius)
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (a.distanceMiles !== b.distanceMiles) return a.distanceMiles - b.distanceMiles;
      return a.clinic.avg_wait_days - b.clinic.avg_wait_days;
    });

  if (tier2Evaluations.length > 0) {
    const bestFallback = tier2Evaluations[0];
    return {
      patientId: patient.id,
      matchedClinic: bestFallback.clinic,
      tier: 'TIER_2',
      distanceMiles: bestFallback.distanceMiles,
      allCandidates: tier2Evaluations,
      success: true,
      message: `Tier 2 Fallback Area Search matched: ${bestFallback.clinic.name} (${bestFallback.distanceMiles} miles, est. wait ${bestFallback.clinic.avg_wait_days} days).`,
    };
  }

  // ----------------------------------------------------
  // No strict match found: Return closest clinic accepting insurance as emergency fallback
  // ----------------------------------------------------
  const relaxedEvaluations = clinicsDatabase
    .filter((c) => c.active)
    .map((clinic) => evaluateClinic(clinic, patientLat!, patientLng!, 100, insurance, 'TIER_2'))
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  if (relaxedEvaluations.length > 0) {
    const fallbackClosest = relaxedEvaluations[0];
    return {
      patientId: patient.id,
      matchedClinic: fallbackClosest.clinic,
      tier: 'TIER_2',
      distanceMiles: fallbackClosest.distanceMiles,
      allCandidates: relaxedEvaluations,
      success: true,
      message: `Tier 2 Regional Fallback matched: ${fallbackClosest.clinic.name} (${fallbackClosest.distanceMiles} miles).`,
    };
  }

  return {
    patientId: patient.id,
    matchedClinic: null,
    tier: null,
    distanceMiles: null,
    allCandidates: [],
    success: false,
    message: 'No suitable dermatology clinic found matching insurance and availability criteria.',
  };
}
