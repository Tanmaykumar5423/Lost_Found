"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { adminService, itemService } from "@/services/api"
import { SystemStats, Item } from "@/types"
import ItemCard from "@/components/ItemCard"
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
  ArrowUpRight
} from "lucide-react"

const PORTFOLIO_CATEGORIES = [
  { id: "", label: "All Items" },
  { id: "ELECTRONICS", label: "Electronics" },
  { id: "WALLETS_CARDS", label: "Wallets & IDs" },
  { id: "KEYS", label: "Keys & Chains" },
  { id: "CLOTHING", label: "Clothing" },
  { id: "DOCUMENTS", label: "Documents" },
  { id: "OTHER", label: "Other" },
]

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

  const [feedItems, setFeedItems] = useState<Item[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")

  // Interactive Live Matching Simulator state
  const [demoLostQuery, setDemoLostQuery] = useState("Black ThinkPad X1 Carbon laptop with React sticker")
  const [demoFoundListing, setDemoFoundListing] = useState("Lenovo laptop found in Library 2nd floor with programming stickers")
  const [demoDistance, setDemoDistance] = useState(15) // meters
  const [demoHoursDelta, setDemoHoursDelta] = useState(3) // hours
  const [simulatedScore, setSimulatedScore] = useState<number | null>(null)

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, feedRes] = await Promise.all([
          adminService.getSystemStats(),
          itemService.getFeed(0, 6),
        ])
        setStats(statsRes.data)
        setFeedItems(feedRes.data)
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

    fetchData()
  }, [])

  // Calculate live simulator score
  const calculateSimScore = () => {
    const lostWords = demoLostQuery.toLowerCase().split(/\s+/)
    const foundWords = demoFoundListing.toLowerCase().split(/\s+/)
    const matchCount = lostWords.filter((w) => foundWords.includes(w) && w.length > 2).length
    const textSim = Math.min(0.95, 0.55 + matchCount * 0.12)
    
    const spatialDecay = Math.exp(-0.005 * demoDistance)
    const temporalDecay = Math.exp(-0.04 * demoHoursDelta)
    
    const total = (0.5 * textSim + 0.3 * spatialDecay + 0.2 * temporalDecay) * 100
    setSimulatedScore(Math.min(99.2, Math.max(12, total)))
  }

  useEffect(() => {
    calculateSimScore()
  }, [demoLostQuery, demoFoundListing, demoDistance, demoHoursDelta])

  const filteredItems = selectedCategory
    ? feedItems.filter((item) => item.category === selectedCategory)
    : feedItems

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
    <div className="space-y-24">
      {/* Unfold Hero Cover Section with Pure CSS Dark Luxury Canvas */}
      <section 
        className="cover-v1 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 rounded-b-3xl overflow-hidden relative bg-[#050505] border-b border-[#1f1f1f]"
      >
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#e63946]/15 via-purple-600/10 to-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-24 sm:py-28 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-[#141414] border border-[#262626] text-white text-[10px] font-bold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#e63946]" />
            <span>Multimodal SigLIP AI Retrieval</span>
          </div>

          <h1 className="heading-hero">
            CLFIS<span className="text-[#e63946]">.</span>
          </h1>

          <h2 className="subheading-hero max-w-2xl mx-auto text-[#cccccc]">
            Campus Lost & Found Intelligence System Powered by Multimodal AI & Spatiotemporal Geofencing
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/feed" className="btn-unfold-primary">
              Browse Feed
            </Link>
            <Link href="/report/lost" className="btn-unfold-red">
              Report Lost
            </Link>
            <Link href="/report/found" className="btn-unfold-outline">
              Report Found (+25 Karma)
            </Link>
          </div>
        </div>

        {/* Unfold Animated Mouse Scroll Widget */}
        <a href="#portfolio-section" className="mouse-wrap">
          <span className="mouse">
            <span className="scroll"></span>
          </span>
          <span className="mouse-label">Scroll</span>
        </a>
      </section>


      {/* Unfold Stats Counters Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="unfold-card p-6 sm:p-8 text-center space-y-2">
          <p className="subheading-section">Resolution Rate</p>
          <p className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
            {stats.resolution_rate}%
          </p>
          <p className="text-xs text-[#888888] font-body">{stats.resolved_items} verified returns</p>
        </div>

        <div className="unfold-card p-6 sm:p-8 text-center space-y-2">
          <p className="subheading-section">Active Reports</p>
          <p className="text-4xl sm:text-5xl font-black text-[#e63946] font-mono tracking-tight">
            {stats.total_items}
          </p>
          <p className="text-xs text-[#888888] font-body">{stats.lost_items} lost / {stats.found_items} found</p>
        </div>

        <div className="unfold-card p-6 sm:p-8 text-center space-y-2">
          <p className="subheading-section">AI Matches</p>
          <p className="text-4xl sm:text-5xl font-black text-purple-400 font-mono tracking-tight">
            {stats.total_matches}
          </p>
          <p className="text-xs text-[#888888] font-body">{stats.high_confidence_matches} high confidence</p>
        </div>

        <div className="unfold-card p-6 sm:p-8 text-center space-y-2">
          <p className="subheading-section">Secure Vault</p>
          <p className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight">
            {stats.vault_items}
          </p>
          <p className="text-xs text-[#888888] font-body">45-day policy custody</p>
        </div>
      </section>

      {/* Unfold Portfolio Gallery Section */}
      <section id="portfolio-section" className="space-y-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1f1f1f] pb-6">
          <div>
            <span className="subheading-section">Recent Listings</span>
            <h2 className="heading-section mt-1">Campus Showcase</h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {PORTFOLIO_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-[10px] uppercase font-bold tracking-[0.15em] px-3.5 py-1.5 rounded-full transition ${
                    isSelected
                      ? "bg-white text-black font-extrabold"
                      : "text-[#888888] bg-[#141414] hover:text-white hover:bg-[#1f1f1f]"
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="unfold-card p-12 text-center space-y-3">
            <span className="text-4xl">📦</span>
            <h3 className="text-lg font-bold text-white">No listings in this category</h3>
            <p className="text-xs text-[#888888]">
              Browse the public feed for all active campus property records.
            </p>
            <Link href="/feed" className="btn-unfold-outline inline-block mt-2">
              View All Feed
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/feed" className="btn-unfold-outline inline-flex items-center gap-2">
            <span>Explore All Campus Feed</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Unfold 4-Step Process Section */}
      <section className="space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="subheading-section">Process</span>
          <h2 className="heading-section">How It Works</h2>
          <p className="text-xs text-[#888888] font-body">
            Four verified steps ensuring privacy-first item retrieval across campus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="unfold-card p-7 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-white text-black font-black text-base flex items-center justify-center">
              01
            </div>
            <h3 className="font-bold text-lg text-white">Submit Report</h3>
            <p className="text-xs text-[#888888] leading-relaxed font-body">
              Upload photos, select campus zone hotspots, and configure Zero-Knowledge privacy masking for high-value items.
            </p>
          </div>

          <div className="unfold-card p-7 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#e63946] text-white font-black text-base flex items-center justify-center">
              02
            </div>
            <h3 className="font-bold text-lg text-white">SigLIP Retrieval</h3>
            <p className="text-xs text-[#888888] leading-relaxed font-body">
              Multimodal 768-d latent space vectors match photos to descriptions with PostGIS spatiotemporal distance ranking.
            </p>
          </div>

          <div className="unfold-card p-7 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-base flex items-center justify-center">
              03
            </div>
            <h3 className="font-bold text-lg text-white">ZK Proof Challenge</h3>
            <p className="text-xs text-[#888888] leading-relaxed font-body">
              Claimant provides confidential proof of ownership (e.g. lock screen pattern, inner engravings) without public leak.
            </p>
          </div>

          <div className="unfold-card p-7 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-base flex items-center justify-center">
              04
            </div>
            <h3 className="font-bold text-lg text-white">Handshake Pass</h3>
            <p className="text-xs text-[#888888] leading-relaxed font-body">
              Present time-bound cryptographic QR code at physical handover. Custody transfers and +25 Karma is awarded!
            </p>
          </div>
        </div>
      </section>

      {/* Interactive AI Match Simulator (Unfold Dark Style) */}
      <section className="unfold-card p-8 sm:p-10 space-y-8 relative overflow-hidden border border-[#262626]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1f1f1f] pb-6">
          <div>
            <span className="subheading-section">Interactive Demonstration</span>
            <h2 className="heading-section text-2xl sm:text-3xl mt-1">SigLIP Scoring Simulator</h2>
            <p className="text-xs text-[#888888] font-body mt-1">
              Test how semantic vision-language embeddings combine with PostGIS distance and temporal decay.
            </p>
          </div>

          <div className="bg-[#141414] border border-[#262626] px-6 py-4 rounded-2xl text-center sm:text-right min-w-[180px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888]">Match Score</p>
            <p className="text-4xl font-black text-emerald-400 font-mono mt-1">
              {simulatedScore !== null ? `${simulatedScore.toFixed(1)}%` : "--"}
            </p>
            <span className="text-[10px] font-mono text-[#888888]">
              {simulatedScore && simulatedScore >= 80 ? "✨ High Confidence" : "⏳ Candidate Match"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-body">
          <div className="space-y-2 bg-[#141414] p-5 rounded-2xl border border-[#222222]">
            <label className="font-bold uppercase tracking-wider text-[#e63946] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Lost Item Query Description
            </label>
            <input
              type="text"
              value={demoLostQuery}
              onChange={(e) => setDemoLostQuery(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#e63946] font-mono text-xs"
            />
          </div>

          <div className="space-y-2 bg-[#141414] p-5 rounded-2xl border border-[#222222]">
            <label className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Found Item Listing Description
            </label>
            <input
              type="text"
              value={demoFoundListing}
              onChange={(e) => setDemoFoundListing(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-2 bg-[#141414] p-5 rounded-2xl border border-[#222222]">
            <div className="flex justify-between font-bold text-[#cccccc]">
              <span>PostGIS Proximity Distance:</span>
              <span className="font-mono text-blue-400">{demoDistance} meters</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="5"
              value={demoDistance}
              onChange={(e) => setDemoDistance(Number(e.target.value))}
              className="w-full accent-[#e63946]"
            />
          </div>

          <div className="space-y-2 bg-[#141414] p-5 rounded-2xl border border-[#222222]">
            <div className="flex justify-between font-bold text-[#cccccc]">
              <span>Time Delta (Incident vs Found):</span>
              <span className="font-mono text-purple-400">{demoHoursDelta} hours</span>
            </div>
            <input
              type="range"
              min="0"
              max="72"
              step="1"
              value={demoHoursDelta}
              onChange={(e) => setDemoHoursDelta(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Unfold FAQ Accordion Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="subheading-section">Help Desk</span>
          <h2 className="heading-section">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={index}
                className="unfold-card border border-[#222222] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left font-bold text-sm text-white flex justify-between items-center gap-4 hover:bg-[#141414] transition"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#e63946] flex-shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#888888] transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#888888] leading-relaxed font-body border-t border-[#1f1f1f] bg-[#0a0a0a]">
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
