import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerOnly = searchParams.get('partner') === 'true';
    const state = searchParams.get('state');

    let clinics = db.getAllClinics();

    if (partnerOnly) {
      clinics = clinics.filter((c) => c.is_partner);
    }

    if (state) {
      clinics = clinics.filter((c) => c.state.toLowerCase() === state.toLowerCase());
    }

    return NextResponse.json({
      clinics,
      total: clinics.length,
      partnerCount: clinics.filter((c) => c.is_partner).length,
      fallbackAreaCount: clinics.filter((c) => !c.is_partner).length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Clinics Fetch Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
