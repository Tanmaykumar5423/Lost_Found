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
      showToast.success("Proof of ownership submitted for review!")
      setAnswer("")
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to submit challenge response"
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
        <div className="w-8 h-8 rounded-full border-2 border-[#e63946] border-t-transparent animate-spin mx-auto"></div>
        <p className="text-xs uppercase font-mono tracking-widest text-[#888888]">Loading Zero-Knowledge portal...</p>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-[#e63946] mx-auto" />
        <h2 className="text-xl font-bold text-white">Match Record Not Found</h2>
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-[#e63946] underline"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-6">
        <div>
          <span className="subheading-section">Zero-Knowledge Verification</span>
          <h1 className="heading-section text-2xl sm:text-3xl mt-1">Claim & Verification Portal</h1>
          <p className="text-xs font-mono text-[#888888]">Case Match #{match.id}</p>
        </div>

        <button
          onClick={() => router.back()}
          className="btn-unfold-outline !py-2 !px-4 !text-[10px] inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {error && (
        <div className="bg-[#e63946]/10 border border-[#e63946]/30 text-[#e63946] text-xs p-4 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Side-by-Side Match Inspection Card */}
      <div className="unfold-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#1f1f1f] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              {(match.total_score * 100).toFixed(1)}% AI Confidence
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
              {match.status}
            </span>
          </div>
          <span className="text-xs text-[#888888] font-mono">
            Spatial {(match.spatial_decay * 100).toFixed(0)}% • Temporal {(match.temporal_decay * 100).toFixed(0)}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-3">
            <span className="text-[10px] font-bold text-[#e63946] uppercase tracking-wider bg-[#e63946]/10 px-2.5 py-0.5 rounded-md border border-[#e63946]/20">
              Lost Item Report
            </span>
            <h3 className="font-bold text-base text-white">{match.lost_item?.title || "Lost Item"}</h3>
            <p className="text-xs text-[#888888] font-body leading-relaxed line-clamp-3">
              {match.lost_item?.description}
            </p>
            <div className="text-xs text-[#666666] pt-2 border-t border-[#1f1f1f] flex items-center gap-1 font-body">
              <MapPin className="w-3.5 h-3.5 text-[#e63946]" />
              <span>Zone: {match.lost_item?.campus_zone || "N/A"}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-3">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-800/30">
              Found Item Listing
            </span>
            <h3 className="font-bold text-base text-white">{match.found_item?.title || "Found Item"}</h3>
            <p className="text-xs text-[#888888] font-body leading-relaxed line-clamp-3">
              {match.found_item?.description}
            </p>
            <div className="text-xs text-[#666666] pt-2 border-t border-[#1f1f1f] flex items-center gap-1 font-body">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zone: {match.found_item?.campus_zone || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Step Verification Wizard */}
      <div className="unfold-card p-6 sm:p-8 space-y-8">
        <h2 className="font-bold text-lg text-white border-b border-[#1f1f1f] pb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#e63946]" />
          <span>Verification & Handshake Steps</span>
        </h2>

        {/* Step 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-xl bg-white text-black font-black text-xs flex items-center justify-center font-mono">
              01
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">
                Submit Ownership Proof Challenge
              </h3>
              <p className="text-xs text-[#888888] font-body">
                Provide private identifying features known only to the genuine owner.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateChallenge} className="ml-10 space-y-3 bg-[#0a0a0a] p-5 rounded-2xl border border-[#222222]">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-1">
                Challenge Prompt:
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full text-xs font-body bg-[#141414] border border-[#262626] rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-[#e63946]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-1">
                Your Confidential Ownership Answer:
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                rows={3}
                placeholder="e.g. Inside the left pocket is a green student bus pass, lock screen is a mountain photo..."
                className="w-full text-xs font-body bg-[#141414] border border-[#262626] rounded-xl p-3 text-white focus:ring-2 focus:ring-[#e63946]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !answer.trim()}
              className="btn-unfold-primary !py-2.5 !px-5 !text-[10px] inline-flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>{submitting ? "Submitting..." : "Submit Proof of Ownership"}</span>
            </button>
          </form>
        </div>

        {/* Step 2 */}
        {claims.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#1f1f1f]">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-[#e63946] text-white font-black text-xs flex items-center justify-center font-mono">
                02
              </span>
              <div>
                <h3 className="font-bold text-sm text-white">
                  Claim Submissions & QR Handshake Pass
                </h3>
                <p className="text-xs text-[#888888] font-body">
                  Review challenge answers and issue time-bound cryptographic QR passes for verified physical custody handover.
                </p>
              </div>
            </div>

            <div className="ml-10 space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="border border-[#222222] rounded-2xl p-5 bg-[#0a0a0a] space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-[#888888]">Claim Record #{claim.id}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-3 py-0.5 rounded-full ${
                        claim.is_challenge_approved
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {claim.is_challenge_approved ? "Approved & Pass Issued" : "Pending Review"}
                    </span>
                  </div>

                  <p className="text-xs text-[#888888] font-body">
                    <strong className="text-white">Prompt:</strong> {claim.challenge_question}
                  </p>

                  <div className="bg-[#141414] p-3 rounded-xl border border-[#222222] text-xs text-[#cccccc] font-body">
                    {claim.claimant_answer}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {!claim.is_challenge_approved && (
                      <button
                        onClick={() => handleApproveClaim(claim.id)}
                        disabled={submitting}
                        className="btn-unfold-primary !py-2 !px-4 !text-[10px] inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Answer & Issue Pass</span>
                      </button>
                    )}

                    {claim.is_challenge_approved && claim.handshake_qr_token && (
                      <button
                        onClick={() => {
                          setQrToken(claim.handshake_qr_token || null)
                          setShowQR(true)
                        }}
                        className="btn-unfold-red !py-2 !px-4 !text-[10px] inline-flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Display Handshake Pass</span>
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
