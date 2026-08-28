"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useAuthStore } from "@/hooks/useStore"
import { itemService, matchService } from "@/services/api"
import { Item, Match } from "@/types"
import { formatDate } from "@/lib/utils"
import ItemCard from "@/components/ItemCard"
import {
  Sparkles,
  Trophy,
  Package,
  Cpu,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  TrendingUp,
  Award,
  Layers
} from "lucide-react"

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore()

  const [activeTab, setActiveTab] = useState<"items" | "matches">("items")
  const [items, setItems] = useState<Item[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [itemsRes, matchesRes] = await Promise.all([
          itemService.getUserItems().catch(() => ({ data: [] })),
          matchService.getUserMatches().catch(() => ({ data: [] })),
        ])
        setItems(itemsRes.data)
        setMatches(matchesRes.data)
      } catch (err) {
        console.error("Error loading dashboard data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4 animate-fade-in-up">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-3xl font-black">
          🔐
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign In Required</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please log in to manage your reported items and view automated SigLIP AI matches.
        </p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md shadow-blue-500/25"
        >
          Sign In to Your Account
        </Link>
      </div>
    )
  }

  const karma = user?.karma_score ?? 100
  const nextKarmaTier = karma < 150 ? 150 : karma < 200 ? 200 : 300
  const karmaProgress = Math.min(100, (karma / nextKarmaTier) * 100)

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Profile & Karma Banner */}
      {user && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-900/60 px-3 py-0.5 rounded-full border border-indigo-700/50">
                  Campus Citizen Profile
                </span>
                <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-md">
                  {user.role}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user.full_name}</h1>
              <p className="text-xs text-slate-300">{user.email}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-6 py-4 rounded-2xl text-center sm:text-right min-w-[200px]">
              <p className="text-xs uppercase font-bold text-indigo-200">Reputation Karma</p>
              <p className="text-3xl font-black text-amber-400 flex items-center justify-center sm:justify-end gap-1.5 mt-1 font-mono">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>{karma} pts</span>
              </p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full"
                  style={{ width: `${karmaProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-indigo-200 mt-1">
                {nextKarmaTier - karma} pts to next tier unlock
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-4 text-slate-300">
              <span>📦 <strong className="text-white">{items.length}</strong> Reports Active</span>
              <span>🤖 <strong className="text-white">{matches.length}</strong> AI Matches Found</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/report/lost"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>New Lost Report</span>
              </Link>
              <Link
                href="/report/found"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Found Report</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("items")}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "items"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Reported Items ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("matches")}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "matches"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-600" />
          <span>AI Candidate Matches ({matches.length})</span>
          {matches.length > 0 && (
            <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-black">
              {matches.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 font-bold text-xs space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto"></div>
          <p>Retrieving your records & calculating latent matches...</p>
        </div>
      ) : activeTab === "items" ? (
        items.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 text-center border border-slate-200/80 space-y-4 max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl font-black">
              📦
            </div>
            <h3 className="text-lg font-black text-slate-900">No Items Reported Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If you lost an item or found someone else's property on campus, submit a report to initiate automated matching.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/report/lost"
                className="bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-rose-700 shadow-md shadow-rose-500/20"
              >
                Report Lost Item
              </Link>
              <Link
                href="/report/found"
                className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
              >
                Report Found Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )
      ) : matches.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 text-center border border-slate-200/80 space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl font-black">
            🤖
          </div>
          <h3 className="text-lg font-black text-slate-900">No Candidate Matches Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our multimodal SigLIP matching algorithm continuously runs in the background. As soon as a corresponding item report is registered in your campus zone, it will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-200 space-y-4"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-800 ring-1 ring-blue-200">
                      {(match.total_score * 100).toFixed(1)}% Match Confidence
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        match.status === "HIGH_CONFIDENCE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {match.status}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900">
                    Lost: <span className="text-rose-600">{match.lost_item?.title || `Item #${match.lost_item_id}`}</span> ↔ Found: <span className="text-emerald-600">{match.found_item?.title || `Item #${match.found_item_id}`}</span>
                  </h3>

                  <p className="text-xs text-slate-500">
                    Lost at: {match.lost_item?.campus_zone || "N/A"} • Found at: {match.found_item?.campus_zone || "N/A"}
                  </p>
                </div>

                <Link
                  href={`/claims/${match.id}`}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl transition shadow-md shadow-blue-500/20 hover:shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Claim Handshake</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Similarity Metric Meters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-[11px]">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block font-semibold">Visual Sim (SigLIP)</span>
                  <span className="font-extrabold text-blue-700 text-xs">
                    {(match.visual_score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block font-semibold">Text Semantic</span>
                  <span className="font-extrabold text-indigo-700 text-xs">
                    {(match.text_score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block font-semibold">Spatial Proximity</span>
                  <span className="font-extrabold text-emerald-700 text-xs">
                    {(match.spatial_decay * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block font-semibold">Temporal Delta</span>
                  <span className="font-extrabold text-amber-700 text-xs">
                    {(match.temporal_decay * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
