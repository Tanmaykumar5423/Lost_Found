import React from "react"
import Navbar from "@/components/Navbar"
import ToastContainer from "@/components/Toast"
import "./globals.css"
import { Building2, ShieldCheck, Cpu, MapPin, HeartHandshake, ArrowUpRight } from "lucide-react"

export const metadata = {
  title: "CLFIS — Campus Lost & Found Intelligence System",
  description: "Enterprise multimodal AI lost and found retrieval platform for university campuses",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css?family=Arimo:400|Raleway:300,400,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-black text-[#f0f0f0] flex flex-col font-sans antialiased relative selection:bg-[#e63946] selection:text-white">
        {/* Unfold Ambient Grid Lines Background */}
        <div className="lines-wrap">
          <div className="lines-inner">
            <div className="lines"></div>
          </div>
        </div>

        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          {children}
        </main>

        <ToastContainer />

        {/* Unfold Luxury Dark Footer */}
        <footer className="relative z-10 bg-[#0a0a0a] border-t border-[#1a1a1a] py-14 mt-20 text-[#888888]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
              {/* Logo Column */}
              <div className="space-y-4 md:col-span-1">
                <a href="/" className="unslate_co--site-logo inline-block">
                  CLFIS<span>.</span>
                </a>
                <p className="text-xs text-[#888888] leading-relaxed font-body">
                  Campus Lost-and-Found Intelligence System powered by SigLIP Vision-Language AI, PostGIS spatiotemporal decay functions, and Zero-Knowledge cryptographic verification.
                </p>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AI Matching Engine Active
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffffff] mb-4">
                  Navigation
                </h4>
                <ul className="space-y-2.5 text-xs font-body">
                  <li>
                    <a href="/feed" className="hover:text-white transition">Public Feed & Search</a>
                  </li>
                  <li>
                    <a href="/report/lost" className="hover:text-[#e63946] transition">Report Lost Property</a>
                  </li>
                  <li>
                    <a href="/report/found" className="hover:text-emerald-400 transition">Report Found Item (+Karma)</a>
                  </li>
                  <li>
                    <a href="/dashboard" className="hover:text-white transition">AI Match Dashboard</a>
                  </li>
                </ul>
              </div>

              {/* Security & Intelligence */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffffff] mb-4">
                  Architecture
                </h4>
                <ul className="space-y-2.5 text-xs text-[#888888] font-body">
                  <li className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-[#e63946]" /> SigLIP 768-d Vector Retrieval
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> PostGIS Spatiotemporal Decay
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Zero-Knowledge Proofs
                  </li>
                  <li className="flex items-center gap-2">
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-400" /> 45-Day Unclaimed Vault
                  </li>
                </ul>
              </div>

              {/* Campus Desk Support */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffffff] mb-4">
                  Security Hub
                </h4>
                <p className="text-xs text-[#888888] leading-relaxed font-body mb-3">
                  Main Security Desk, Central Administration Ground Floor. Open 24/7 for emergency handover & QR scanning.
                </p>
                <div className="text-xs font-mono text-white bg-[#141414] p-3 rounded-xl border border-[#222222]">
                  security@college.edu • ext. 4400
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666] font-body">
              <p>© {new Date().getFullYear()} Campus Lost-and-Found Intelligence System (CLFIS). Replicating Unfold template by Colorlib.</p>
              <p className="text-[11px] tracking-wider uppercase text-[#555555]">
                University Privacy Charter & ZK Protocol
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
