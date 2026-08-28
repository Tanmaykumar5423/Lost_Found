"use client"

import React, { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { showToast } from "@/hooks/useStore"
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle, 
  X, 
  MapPin, 
  Lock,
} from "lucide-react"

interface HandshakeQRProps {
  qrToken: string
  expiresInMinutes?: number
  onClose?: () => void
}

export default function HandshakeQR({
  qrToken,
  expiresInMinutes = 15,
  onClose,
}: HandshakeQRProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(expiresInMinutes * 60)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const totalSeconds = expiresInMinutes * 60
  const progressPercent = Math.max(0, (secondsRemaining / totalSeconds) * 100)
  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const isExpired = secondsRemaining === 0

  const handleCopy = () => {
    navigator.clipboard.writeText(qrToken)
    setCopied(true)
    showToast.success("Cryptographic Handshake Token copied to clipboard!")
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#262626] space-y-5 animate-fade-in-up relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e63946]/20 text-[#e63946] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                Cryptographic Handshake Pass
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Zero-Knowledge Token</p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-[#888888] hover:text-white p-1.5 rounded-full hover:bg-[#1f1f1f] transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* QR Ticket Container */}
        <div className="relative bg-[#050505] border-2 border-dashed border-[#333333] p-6 rounded-2xl flex flex-col items-center justify-center shadow-inner">
          {isExpired ? (
            <div className="h-52 flex flex-col items-center justify-center text-[#e63946] space-y-2">
              <AlertTriangle className="w-12 h-12 text-[#e63946] animate-bounce" />
              <p className="font-bold text-base">Handshake Pass Expired</p>
              <p className="text-xs text-[#888888] font-body max-w-xs text-center">
                For security, tokens are time-limited to 15 minutes. Please re-generate your pass in the claims portal.
              </p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center">
              <QRCodeSVG
                value={qrToken}
                size={190}
                level="H"
                includeMargin={false}
              />
              <span className="text-[10px] font-mono text-slate-600 mt-2 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> Signed JWT Pass
              </span>
            </div>
          )}

          {/* Progress ring / bar */}
          {!isExpired && (
            <div className="w-full mt-4 space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold text-[#888888]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#e63946]" /> Pass Validity
                </span>
                <span className="text-white text-xs">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
              </div>
              <div className="w-full bg-[#1f1f1f] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 rounded-full ${
                    secondsRemaining < 120 ? "bg-[#e63946]" : "bg-white"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Safety checklist */}
        <div className="bg-[#141414] rounded-2xl p-4 border border-[#222222] space-y-1.5 text-xs font-body text-[#888888]">
          <p className="font-bold text-[#cccccc] flex items-center gap-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#e63946]" /> Handover Protocol:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-[#888888]">
            <li>Present this QR pass to the finder or Campus Security Desk.</li>
            <li>Custody transfer logs immediately upon scan and awards +25 Karma.</li>
            <li>Meet in public campus areas (Library Front Desk / Main Quad).</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="btn-unfold-outline flex-1 !py-2.5 !px-3 !text-[10px] inline-flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Token Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Token String</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="btn-unfold-primary !py-2.5 !px-6 !text-[10px]"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
