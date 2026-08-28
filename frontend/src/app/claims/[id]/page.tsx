"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { claimService, matchService } from "@/services/api"
import { useAuthStore, showToast } from "@/hooks/useStore"
import { Claim, Match } from "@/types"
import HandshakeQR from "@/components/HandshakeQR"
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lock,
  QrCode,
  Sparkles,
  MapPin,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
  Send
} from "lucide-react"

export default function ClaimDetailPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = Number(params?.id)
  const { user, isAuthenticated } = useAuthStore()

  const [match, setMatch] = useState<Match | null>(null)
  const [claims, setClaims] = useState<Claim[]>([])
  const [question, setQuestion] = useState("Please describe the specific private marks or items contained inside.")
  const [answer, setAnswer] = useState("")
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!matchId) return

    const fetchData = async () => {
      try {
        const [matchRes, claimsRes] = await Promise.all([
          matchService.getMatch(matchId),
          claimService.getClaimsByMatch(matchId),
        ])
        setMatch(matchRes.data)
        setClaims(claimsRes.data)

        // Check if there is an approved claim with active QR token
        const myClaim = claimsRes.data.find((c: Claim) => c.claimant_id === user?.id)
        if (myClaim?.handshake_qr_token) {
          setQrToken(myClaim.handshake_qr_token)
        }
      } catch (err: any) {
        setError("Failed to load match or claim details.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [matchId, user?.id])

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return

    setSubmitting(true)
    setError("")
    try {
      const res = await claimService.createChallenge(matchId, question, answer)
      setClaims([...claims.filter((c) => c.id !== res.data.id), res.data])
      showToast.success("Proof of ownership submitted for cryptographic review!")
      setAnswer("")
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to submit claim challenge response"
      setError(msg)
      showToast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveClaim = async (claimId: number) => {
    setSubmitting(true)
    setError("")
    try {
      const res = await claimService.approveChallenge(claimId)
      setQrToken(res.data.qr_token)
      setShowQR(true)
      showToast.success("Claim approved! Handshake QR pass generated.")
      // Update local claim state
      setClaims((prev) =>
        prev.map((c) =>
          c.id === claimId ? { ...c, is_challenge_approved: true, handshake_qr_token: res.data.qr_token } : c
        )
      )
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to approve claim"
      setError(msg)
      showToast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-3 animate-fade-in-up">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-slate-700">Loading Zero-Knowledge claim portal...</p>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Match Record Not Found</h2>
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-blue-600 underline"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Knowledge Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Claim & Verification Portal
          </h1>
          <p className="text-xs text-slate-500">Case Match #{match.id}</p>
        </div>

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Side-by-Side Match Inspection Card */}
      <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              {(match.total_score * 100).toFixed(1)}% AI Confidence
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {match.status}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Spatial {(match.spatial_decay * 100).toFixed(0)}% • Temporal {(match.temporal_decay * 100).toFixed(0)}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lost Report Card */}
          <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-3">
            <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider bg-rose-100 px-2.5 py-0.5 rounded-md">
              🚨 Lost Item Report
            </span>
            <h3 className="font-extrabold text-base text-slate-900">{match.lost_item?.title || "Lost Item"}</h3>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {match.lost_item?.description}
            </p>
            <div className="text-xs text-slate-500 pt-2 border-t border-rose-200/50 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Zone: {match.lost_item?.campus_zone || "N/A"}</span>
            </div>
          </div>

          {/* Found Report Card */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-3">
            <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-md">
              ✨ Found Item Listing
            </span>
            <h3 className="font-extrabold text-base text-slate-900">{match.found_item?.title || "Found Item"}</h3>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {match.found_item?.description}
            </p>
            <div className="text-xs text-slate-500 pt-2 border-t border-emerald-200/50 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zone: {match.found_item?.campus_zone || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 2-Step Verification Wizard */}
      <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/80 space-y-8">
        <h2 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Verification & Handshake Steps</span>
        </h2>

        {/* Step 1: Submit Challenge Proof */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
              1
            </span>
            <div>
              <h3 className="font-black text-sm text-slate-900">
                Submit Ownership Proof Challenge
              </h3>
              <p className="text-xs text-slate-500">
                Provide private identifying features only the genuine owner would know.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateChallenge} className="ml-10 space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/70">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Verification Question / Prompt:
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Your Confidential Ownership Answer:
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                rows={3}
                placeholder="e.g. Inside the left pocket is a green student bus pass, lock screen is a mountain photo..."
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !answer.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Submitting..." : "Submit Proof of Ownership"}</span>
            </button>
          </form>
        </div>

        {/* Step 2: Review & Handshake Pass Issuance */}
        {claims.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                2
              </span>
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  Claim Submissions & QR Handshake Pass
                </h3>
                <p className="text-xs text-slate-500">
                  Review answers and issue time-bound cryptographic QR passes for verified physical custody handover.
                </p>
              </div>
            </div>

            <div className="ml-10 space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/70 space-y-3 shadow-2xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Claim Record #{claim.id}</span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        claim.is_challenge_approved
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {claim.is_challenge_approved ? "✅ Approved & Pass Issued" : "⏳ Pending Review"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-800">Challenge Prompt:</strong> {claim.challenge_question}
                  </p>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium">
                    {claim.claimant_answer}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {!claim.is_challenge_approved && (
                      <button
                        onClick={() => handleApproveClaim(claim.id)}
                        disabled={submitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Answer & Issue Handshake QR</span>
                      </button>
                    )}

                    {claim.is_challenge_approved && claim.handshake_qr_token && (
                      <button
                        onClick={() => {
                          setQrToken(claim.handshake_qr_token || null)
                          setShowQR(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Display Cryptographic Handshake Pass</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showQR && qrToken && (
        <HandshakeQR
          qrToken={qrToken}
          expiresInMinutes={15}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  )
}
