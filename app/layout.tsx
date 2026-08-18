import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Connection to Care | Urgent Referral & Matching Pipeline',
  description: 'Automated referral and matching pipeline for Urgent (Red) dermatology screening patients.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans flex flex-col">
        {/* Top Clinical Navigation Bar */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                C2C
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-lg tracking-tight">Connection to Care</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                    Urgent Referral Engine
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">Automated Screening Triage &amp; 2-Tier Matching Pipeline</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Partner Network: <strong>~220 Clinics</strong></span>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 transition"
              >
                Docs / API
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>&copy; {new Date().getFullYear()} Connection to Care System. HIPAA Compliant Referral Automation.</p>
            <p className="text-slate-400">Powered by Next.js 14, Supabase, Resend &amp; 2-Tier Matching Engine</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
