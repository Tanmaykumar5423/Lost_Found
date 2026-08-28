import React from "react"
import Navbar from "@/components/Navbar"
import ToastContainer from "@/components/Toast"
import "./globals.css"
import { Building2, ShieldCheck, Cpu, MapPin, HeartHandshake, ExternalLink } from "lucide-react"

export const metadata = {
  title: "CLFIS - Campus Lost & Found Intelligence System",
  description: "Enterprise multimodal AI lost and found retrieval platform for university campuses",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        <ToastContainer />

        <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/80 py-10 mt-16 text-slate-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand Col */}
              <div className="space-y-3 md:col-span-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    🏛️
                  </div>
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">CLFIS Engine</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Campus Lost-and-Found Intelligence System powered by SigLIP Vision-Language AI, PostGIS spatiotemporal decay functions, and Zero-Knowledge cryptographic verification.
                </p>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  All Campus Systems Operational
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Campus Discovery
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <a href="/feed" className="hover:text-blue-600 transition">🔍 Public Listings Feed</a>
                  </li>
                  <li>
                    <a href="/report/lost" className="hover:text-blue-600 transition">🚨 Report Lost Property</a>
                  </li>
                  <li>
                    <a href="/report/found" className="hover:text-blue-600 transition">✨ Report Found Item (+Karma)</a>
                  </li>
                  <li>
                    <a href="/dashboard" className="hover:text-blue-600 transition">📊 AI Match Dashboard</a>
                  </li>
                </ul>
              </div>

              {/* Security & Policies */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Trust & Security
                </h4>
                <ul className="space-y-2 text-xs text-slate-500">
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Zero-Knowledge Claim Proofs
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" /> SigLIP 768-d Vector Matching
                  </li>
                  <li className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> PostGIS Geofencing
                  </li>
                  <li className="flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-600" /> 45-Day Unclaimed Asset Vault
                  </li>
                </ul>
              </div>

              {/* Campus Desk Help */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Security Hub & Help
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                  Campus Security Desk (Main Admin Building, Ground Floor). Available 24/7 for emergency lost reports & physical verification.
                </p>
                <div className="text-xs font-semibold text-blue-700 bg-blue-50/80 p-2.5 rounded-xl border border-blue-200/80">
                  📞 Security Desk: ext. 4400 / help@college.edu
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <p>© {new Date().getFullYear()} Campus Lost-and-Found Intelligence System (CLFIS). All rights reserved.</p>
              <p className="flex items-center gap-1 text-[11px]">
                Protected under University Student Privacy Charter & ZK Protocol
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
