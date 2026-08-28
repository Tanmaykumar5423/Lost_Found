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
      <div className="max-w-md mx-auto text-center py-20 space-y-5 animate-fade-in-up">
        <span className="text-5xl">🔐</span>
        <h1 className="text-2xl font-bold text-white">Sign In Required</h1>
        <p className="text-xs text-[#888888] font-body max-w-sm mx-auto">
          Please log in to manage your reported items and view automated SigLIP AI matches.
        </p>
        <Link href="/login" className="btn-unfold-primary inline-block">
          Sign In to Account
        </Link>
      </div>
    )
  }

  const karma = user?.karma_score ?? 100
  const nextKarmaTier = karma < 150 ? 150 : karma < 200 ? 200 : 300
  const karmaProgress = Math.min(100, (karma / nextKarmaTier) * 100)

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Profile Banner */}
      {user && (
        <div className="unfold-card p-6 sm:p-8 space-y-6 relative overflow-hidden border border-[#262626]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="subheading-section !text-[10px]">
                  Campus Citizen Profile
                </span>
                <span className="text-[10px] font-mono font-bold text-white bg-[#1f1f1f] px-2.5 py-0.5 rounded-md">
                  {user.role}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{user.full_name}</h1>
              <p className="text-xs font-mono text-[#888888]">{user.email}</p>
            </div>

            <div className="bg-[#141414] border border-[#262626] px-6 py-4 rounded-2xl text-center sm:text-right min-w-[200px]">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#888888]">Reputation Karma</p>
              <p className="text-3xl font-black text-amber-400 flex items-center justify-center sm:justify-end gap-1.5 mt-1 font-mono">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>{karma} pts</span>
              </p>
              <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${karmaProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-[#777777] mt-1 font-body">
                {nextKarmaTier - karma} pts to next tier
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#1a1a1a] text-xs font-body">
            <div className="flex items-center gap-4 text-[#888888]">
              <span>📦 <strong className="text-white">{items.length}</strong> Reports Active</span>
              <span>🤖 <strong className="text-white">{matches.length}</strong> AI Matches Found</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/report/lost" className="btn-unfold-red !py-2 !px-4 !text-[10px]">
                New Lost Report
              </Link>
              <Link href="/report/found" className="btn-unfold-outline !py-2 !px-4 !text-[10px]">
                New Found Report
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#1f1f1f] gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("items")}
          className={`pb-3 text-xs font-bold uppercase tracking-[0.15em] transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "items"
              ? "border-[#e63946] text-white"
              : "border-transparent text-[#666666] hover:text-[#cccccc]"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Reported Items ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("matches")}
          className={`pb-3 text-xs font-bold uppercase tracking-[0.15em] transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "matches"
              ? "border-[#e63946] text-white"
              : "border-transparent text-[#666666] hover:text-[#cccccc]"
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>AI Suggested Matches ({matches.length})</span>
          {matches.length > 0 && (
            <span className="bg-purple-950 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-purple-800">
              {matches.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#888888] font-bold text-xs space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#e63946] border-t-transparent animate-spin mx-auto"></div>
          <p>Retrieving your records & calculating matches...</p>
        </div>
      ) : activeTab === "items" ? (
        items.length === 0 ? (
          <div className="unfold-card p-14 text-center space-y-4 max-w-md mx-auto">
            <span className="text-4xl">📭</span>
            <h3 className="text-lg font-bold text-white">No Items Reported Yet</h3>
            <p className="text-xs text-[#888888] font-body">
              Submit a lost or found report to activate continuous multimodal AI retrieval.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/report/lost" className="btn-unfold-red !py-2.5 !px-5 !text-[10px]">
                Report Lost Item
              </Link>
              <Link href="/report/found" className="btn-unfold-outline !py-2.5 !px-5 !text-[10px]">
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
        <div className="unfold-card p-14 text-center space-y-4 max-w-md mx-auto">
          <span className="text-4xl">🤖</span>
          <h3 className="text-lg font-bold text-white">No Candidate Matches Yet</h3>
          <p className="text-xs text-[#888888] font-body leading-relaxed">
            Our SigLIP matching algorithm runs continuously in the background. As soon as a corresponding report is detected, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="unfold-card p-6 border border-[#222222] hover:border-[#444444] space-y-4"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800">
                      {(match.total_score * 100).toFixed(1)}% Confidence
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        match.status === "HIGH_CONFIDENCE"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {match.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white">
                    Lost: <span className="text-[#e63946]">{match.lost_item?.title || `Item #${match.lost_item_id}`}</span> ↔ Found: <span className="text-emerald-400">{match.found_item?.title || `Item #${match.found_item_id}`}</span>
                  </h3>

                  <p className="text-xs text-[#888888] font-body">
                    Lost at: {match.lost_item?.campus_zone || "N/A"} • Found at: {match.found_item?.campus_zone || "N/A"}
                  </p>
                </div>

                <Link
                  href={`/claims/${match.id}`}
                  className="btn-unfold-primary !py-2.5 !px-5 !text-[10px] inline-flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify & Claim Handshake</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Metric meters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-body">
                <div className="bg-[#0a0a0a] p-3 rounded-xl border border-[#1f1f1f]">
                  <span className="text-[#666666] block text-[10px] uppercase font-mono">Visual Sim (SigLIP)</span>
                  <span className="font-mono font-bold text-blue-400 text-xs">
                    {(match.visual_score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="bg-[#0a0a0a] p-3 rounded-xl border border-[#1f1f1f]">
                  <span className="text-[#666666] block text-[10px] uppercase font-mono">Text Semantic</span>
                  <span className="font-mono font-bold text-purple-400 text-xs">
                    {(match.text_score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="bg-[#0a0a0a] p-3 rounded-xl border border-[#1f1f1f]">
                  <span className="text-[#666666] block text-[10px] uppercase font-mono">Spatial Decay</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {(match.spatial_decay * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="bg-[#0a0a0a] p-3 rounded-xl border border-[#1f1f1f]">
                  <span className="text-[#666666] block text-[10px] uppercase font-mono">Temporal Delta</span>
                  <span className="font-mono font-bold text-amber-400 text-xs">
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
