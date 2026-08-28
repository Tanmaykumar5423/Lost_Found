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
  Sparkles
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
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-fade-in-up relative overflow-hidden">
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Cryptographic Handshake Pass
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">Zero-Knowledge Verification</p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* QR Ticket Container */}
        <div className="relative bg-gradient-to-b from-slate-50 to-blue-50/40 border-2 border-dashed border-blue-200 p-6 rounded-2xl flex flex-col items-center justify-center shadow-inner">
          {isExpired ? (
            <div className="h-52 flex flex-col items-center justify-center text-rose-600 space-y-2">
              <AlertTriangle className="w-12 h-12 text-rose-500 animate-bounce" />
              <p className="font-extrabold text-base">Handshake Pass Expired</p>
              <p className="text-xs text-slate-500 max-w-xs text-center">
                For security, tokens are time-limited to 15 minutes. Please re-generate your pass in the claims portal.
              </p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center">
              <QRCodeSVG
                value={qrToken}
                size={190}
                level="H"
                includeMargin={false}
              />
              <span className="text-[10px] font-mono text-slate-400 mt-2 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> Signed JWT Pass
              </span>
            </div>
          )}

          {/* Progress ring / bar */}
          {!isExpired && (
            <div className="w-full mt-4 space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Pass Validity
                </span>
                <span className="font-mono text-blue-600 text-xs">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 rounded-full ${
                    secondsRemaining < 120 ? "bg-rose-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Handover Safety Checklist */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 space-y-1.5 text-xs text-slate-600">
          <p className="font-bold text-slate-800 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" /> Safe Handover Instructions:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
            <li>Present this QR code to the finder or Campus Security Desk.</li>
            <li>Once scanned, custody will transfer and +25 Karma will be awarded.</li>
            <li>Meet in public campus areas (Library Front Desk / Main Quad).</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Token Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Token String</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-sm"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
