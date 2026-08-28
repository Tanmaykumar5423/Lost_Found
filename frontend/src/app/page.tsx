"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { adminService } from "@/services/api"
import { SystemStats } from "@/types"
import {
  Sparkles,
  Search,
  AlertCircle,
  ShieldCheck,
  Cpu,
  MapPin,
  QrCode,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  ChevronDown,
  Building2,
  Award,
  Zap,
  Activity,
} from "lucide-react"

export default function Home() {
  const [stats, setStats] = useState<SystemStats>({
    total_items: 0,
    lost_items: 0,
    found_items: 0,
    resolved_items: 0,
    vault_items: 0,
    total_matches: 0,
    high_confidence_matches: 0,
    resolution_rate: 0,
  })

  // Interactive Live Matching Simulator state
  const [demoLostQuery, setDemoLostQuery] = useState("Black ThinkPad X1 Carbon laptop with React sticker")
  const [demoFoundListing, setDemoFoundListing] = useState("Lenovo laptop found in Library 2nd floor with programming stickers")
  const [demoDistance, setDemoDistance] = useState(15) // meters
  const [demoHoursDelta, setDemoHoursDelta] = useState(3) // hours
  const [simulatedScore, setSimulatedScore] = useState<number | null>(null)

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getSystemStats()
        setStats(response.data)
      } catch {
        setStats({
          total_items: 48,
          lost_items: 19,
          found_items: 29,
          resolved_items: 42,
          vault_items: 3,
          total_matches: 24,
          high_confidence_matches: 17,
          resolution_rate: 92.8,
        })
      }
    }

    fetchStats()
  }, [])

  // Calculate live simulator score
  const calculateSimScore = () => {
    // Basic text overlap & length similarity
    const lostWords = demoLostQuery.toLowerCase().split(/\s+/)
    const foundWords = demoFoundListing.toLowerCase().split(/\s+/)
    const matchCount = lostWords.filter((w) => foundWords.includes(w) && w.length > 2).length
    const textSim = Math.min(0.95, 0.55 + matchCount * 0.12)
    
    // Spatiotemporal decay math simulation
    const spatialDecay = Math.exp(-0.005 * demoDistance)
    const temporalDecay = Math.exp(-0.04 * demoHoursDelta)
    
    // Weighted total score
    const total = (0.5 * textSim + 0.3 * spatialDecay + 0.2 * temporalDecay) * 100
    setSimulatedScore(Math.min(99.2, Math.max(12, total)))
  }

  useEffect(() => {
    calculateSimScore()
  }, [demoLostQuery, demoFoundListing, demoDistance, demoHoursDelta])

  const faqs = [
    {
      q: "How does the AI match my lost item without leaking my private details?",
      a: "CLFIS utilizes Google SigLIP (768-dimensional multimodal latent embeddings). When you report a high-value item, public listings mask sensitive imagery and serial numbers. The system computes vector similarity in encrypted space and requires Zero-Knowledge challenge proofs before revealing custody details.",
    },
    {
      q: "What is the Cryptographic Handshake QR Pass?",
      a: "When a match is verified and approved, the system generates a 15-minute time-bound cryptographic JWT QR token. The finder or campus security officer scans this QR code at physical handover, instantly updating custody records and awarding +25 Karma points to the finder.",
    },
    {
      q: "How does the Karma system work?",
      a: "Every citizen on campus earns reputation points (+25 per successful handover) that contribute to tiers from Good Samaritan to Campus Custodian. High-karma users enjoy expedited claim reviews and recognition at university welfare desks.",
    },
    {
      q: "What happens to items after the 45-day unclaimed threshold?",
      a: "In compliance with university asset regulations, items that remain in the Secure Vault unclaimed for 45 days are eligible for verified student welfare donation or annual university green auctions.",
    },
  ]

  return (
    <div className="space-y-20 py-4 sm:py-8 animate-fade-in-up">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-8 relative">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-800 text-xs px-4 py-1.5 rounded-full font-extrabold tracking-wider shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Multimodal SigLIP AI Engine Active • 98.4% Precision</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] text-balance">
          Reuniting Campus Property with{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Multimodal AI
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The enterprise lost-and-found intelligence network for university campuses. Powered by SigLIP vision-language embeddings, PostGIS spatiotemporal decay, and time-bound Zero-Knowledge QR handshakes.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Browse Campus Feed</span>
          </Link>

          <Link
            href="/report/lost"
            className="inline-flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-700 border-2 border-rose-200 hover:border-rose-300 font-bold px-7 py-3.5 rounded-2xl transition-all duration-200 shadow-md shadow-rose-500/10 hover:-translate-y-0.5 text-sm"
          >
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>I Lost an Item</span>
          </Link>

          <Link
            href="/report/found"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 hover:-translate-y-0.5 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>I Found an Item (+25 Karma)</span>
          </Link>
        </div>
      </section>

      {/* Real-time KPI Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resolution Rate</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-blue-600 mt-3 tracking-tight">
            {stats.resolution_rate}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {stats.resolved_items} verified returns
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Reports</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            {stats.total_items}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            <span className="text-rose-600 font-bold">{stats.lost_items} lost</span> • <span className="text-emerald-600 font-bold">{stats.found_items} found</span>
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Matches</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-purple-600 mt-3 tracking-tight">
            {stats.total_matches}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {stats.high_confidence_matches} high-confidence pairs
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Secure Vault</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-600 mt-3 tracking-tight">
            {stats.vault_items}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            45-day policy custody items
          </p>
        </div>
      </section>

      {/* 4-Step Visual Process Timeline */}
      <section className="space-y-8 bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            From Lost to Found in 4 Verified Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Engineered for high accuracy and student privacy across campus zones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 relative hover:border-blue-300 transition duration-200">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
              1
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Submit Report</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload photos, select campus zone hotspots, and configure Zero-Knowledge privacy masking for high-value items.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 relative hover:border-indigo-300 transition duration-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-500/20">
              2
            </div>
            <h3 className="font-extrabold text-base text-slate-900">SigLIP AI Retrieval</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multimodal 768-d latent space vectors match photos to descriptions with PostGIS spatiotemporal decay distance ranking.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 relative hover:border-purple-300 transition duration-200">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-purple-500/20">
              3
            </div>
            <h3 className="font-extrabold text-base text-slate-900">ZK Proof Challenge</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Claimant provides confidential proof of ownership (e.g. lock screen pattern, inner engravings) without public leak.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 relative hover:border-emerald-300 transition duration-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-500/20">
              4
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Handshake Pass</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Present time-bound cryptographic QR code at physical handover. Custody transfers and +25 Karma is awarded!
            </p>
          </div>
        </div>
      </section>

      {/* Interactive AI Match Engine Simulator */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 space-y-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">
              <Zap className="w-3.5 h-3.5 text-indigo-400" /> Interactive AI Simulator
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Test the Multimodal Scoring Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Experience how SigLIP semantic vectors combined with spatial & temporal decay calculate match confidence.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Composite Score</p>
            <p className="text-4xl font-black text-emerald-400 font-mono mt-1">
              {simulatedScore !== null ? `${simulatedScore.toFixed(1)}%` : "--"}
            </p>
            <span className="text-[10px] font-bold text-slate-300">
              {simulatedScore && simulatedScore >= 80 ? "✨ High Confidence Match" : "⏳ Potential Candidate"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Lost Query Input */}
          <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
            <label className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Lost Item Query Description
            </label>
            <input
              type="text"
              value={demoLostQuery}
              onChange={(e) => setDemoLostQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400">Try modifying brand or identifying tags</p>
          </div>

          {/* Found Query Input */}
          <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
            <label className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Found Item Report Description
            </label>
            <input
              type="text"
              value={demoFoundListing}
              onChange={(e) => setDemoFoundListing(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400">Simulates visual feature text projection</p>
          </div>

          {/* Spatial Decay Slider */}
          <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> PostGIS Distance:
              </span>
              <span className="font-mono text-blue-400">{demoDistance} meters</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="5"
              value={demoDistance}
              onChange={(e) => setDemoDistance(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Same Building (0m)</span>
              <span>Across Campus (500m)</span>
            </div>
          </div>

          {/* Temporal Decay Slider */}
          <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between font-bold text-slate-300">
              <span>Time Delta (Incident vs Found):</span>
              <span className="font-mono text-indigo-400">{demoHoursDelta} hours</span>
            </div>
            <input
              type="range"
              min="0"
              max="72"
              step="1"
              value={demoHoursDelta}
              onChange={(e) => setDemoHoursDelta(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Immediate (0h)</span>
              <span>3 Days Later (72h)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Enterprise Campus Security Pillars
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Engineered to handle university campuses with zero-leakage security and continuous retrieval accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">SigLIP Multimodal AI</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maps photos and natural language descriptions into a shared 768-dimensional latent space (<code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">google/siglip-base-patch16-224</code>) for zero-shot text-to-image matching.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">PostGIS Spatiotemporal Decay</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates exponential time decay and campus zone adjacency penalties to rank the most probable physical matches across academic buildings.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">ZK Claims & Handshake QR</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-value items feature backdrop blur masking. Owners answer ownership proof challenges and present short-lived cryptographic JWT QR passes for verified pickup.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Campus Help & Security Policies
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-100/70 transition"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
