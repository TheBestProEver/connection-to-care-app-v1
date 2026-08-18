# Connection to Care Referral & Matching System

Automated referral and matching pipeline for patients flagged as **Urgent (Red)** during dermatology screenings, eliminating manual search bottlenecks before peak season.

---

## Key Features & Business Logic

1. **Urgent Triage (Red Flag)**:
   - Immediately dispatches automated priority email alert to patient upon intake.
   - Sets clinical expectations for a 2–3 week evaluation window.

2. **Flexible Data Intake**:
   - **Individual Web Form**: Direct input with instant triage indicators.
   - **Batch CSV Spreadsheet Ingestion**: Powered by PapaParse with live validation and downloadable sample templates (`sample_dermatology_patients.csv`).

3. **Two-Tier Matching Algorithm (`lib/matchingEngine.ts`)**:
   - **Tier 1 (In-Network Partner Network)**: Searches active partner practice database (~220 clinics) filtering by location radius, insurance acceptance, and guaranteed appointment availability within 2–3 weeks.
   - **Tier 2 (Fallback Area Search)**: If Tier 1 yields zero results, automatically expands search to all area dermatologists matching insurance and 2–3 week availability window.

4. **Automated Patient Permission & Dispatch**:
   - **Consent Portal (`app/consent/page.tsx`)**: Displays matched clinic card, distance, and wait time. Collects digital signature for record release.
   - **Dispatch Engine (`app/api/dispatch/route.ts`)**: Securely transmits patient clinical summary to clinic inbox/fax and sends "All Clear, Best Wishes" completion email to patient.

---

## Project Structure

```
c2c-fullstack/
├── app/
│   ├── api/
│   │   ├── triage/route.ts       # Dispatches immediate urgent alert email
│   │   ├── match/route.ts        # 2-Tier matching algorithm & consent email
│   │   ├── dispatch/route.ts     # Clinic file transmission & patient all-clear
│   │   ├── patients/route.ts     # CRUD, batch ingestion & KPI metrics
│   │   └── clinics/route.ts      # 2-Tier clinic directory search
│   ├── consent/
│   │   └── page.tsx              # Patient-facing HIPAA authorization portal
│   ├── layout.tsx                # Clinical root navigation & layout
│   ├── page.tsx                  # Main referral command center & Kanban board
│   └── globals.css               # Tailwind CSS & design tokens
├── components/
│   ├── BatchUpload.tsx           # PapaParse CSV upload & batch runner
│   ├── ManualIntakeForm.tsx      # Single patient triage form
│   ├── ReferralPipelineDashboard.tsx # 4-Stage visual referral Kanban
│   ├── ClinicDirectoryModal.tsx  # ~220 Practice network inspector
│   └── EmailPreviewModal.tsx     # Live HTML email template inspector
├── lib/
│   ├── matchingEngine.ts         # 2-Tier algorithm + Haversine distance
│   ├── zipCoordinates.ts         # US ZIP centroid coordinates database
│   ├── emailTemplates.ts         # 4 Responsive HTML email templates
│   ├── resend.ts                 # Resend API client + dev simulation
│   ├── supabase.ts               # Supabase client + in-memory store
│   └── types.ts                  # TypeScript interfaces & models
├── supabase/
│   └── schema.sql                # PostgreSQL DDL with ~220 clinic seed dataset
├── public/
│   └── sample_dermatology_patients.csv
├── package.json
└── tsconfig.json
```

---

## Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Supabase & Vercel Deployment

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the SQL script from `supabase/schema.sql` in the **Supabase SQL Editor**.
3. Add the following environment variables in Vercel / `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=re_your_resend_api_key
   ```
