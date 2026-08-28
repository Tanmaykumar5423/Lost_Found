"use client"

import React, { useState, useEffect, useRef } from "react"
import { claimService } from "@/services/api"
import { showToast } from "@/hooks/useStore"
import { 
  Camera, 
  ScanLine, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  ShieldCheck, 
  Sparkles,
  RefreshCw
} from "lucide-react"

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (result: any) => void
}

export default function QRScannerModal({ isOpen, onClose, onSuccess }: QRScannerModalProps) {
  const [manualToken, setManualToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)
  const scannerRef = useRef<any>(null)

  useEffect(() => {
    let html5QrCode: any = null

    if (isOpen) {
      import("html5-qrcode")
        .then((module) => {
          const Html5Qrcode = module.Html5Qrcode
          html5QrCode = new Html5Qrcode("qr-reader")
          scannerRef.current = html5QrCode

          const config = { fps: 10, qrbox: { width: 220, height: 220 } }
          html5QrCode
            .start(
              { facingMode: "environment" },
              config,
              (decodedText: string) => {
                handleVerifyToken(decodedText)
              },
              () => {}
            )
            .then(() => setScannerActive(true))
            .catch(() => {
              setError("Camera access is currently unavailable on this device. You can paste the signed handshake token below.")
            })
        })
        .catch(() => {
          setError("QR scanner library failed to initialize.")
        })
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        scannerRef.current.clear()
      }
    }
  }, [isOpen])

  const handleVerifyToken = async (token: string) => {
    if (!token.trim()) return
    setLoading(true)
    setError("")

    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {})
      }
      const res = await claimService.verifyHandshake(token.trim())
      showToast.success("✅ Handshake Pass successfully verified! Custody updated & Karma awarded.")
      onSuccess(res.data)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid, already redeemed, or expired cryptographic token.")
      showToast.error("Handshake verification failed.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Handshake QR Scanner
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">Campus Custody Verification</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Video Camera Scan Viewport */}
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden min-h-[240px] flex items-center justify-center border-2 border-slate-800 shadow-inner">
          <div id="qr-reader" className="w-full"></div>
          
          {scannerActive && (
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-36 border-2 border-blue-500/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
              {/* Animated laser line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 shadow-lg shadow-blue-500/50 animate-laser-scan"></div>
            </div>
          )}

          {!scannerActive && !error && (
            <div className="text-center p-6 space-y-2 text-slate-300">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-400" />
              <p className="text-xs font-semibold">Starting camera feed...</p>
            </div>
          )}
        </div>

        {/* Manual Token String Input */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-blue-600" /> Manual Token Paste
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste signed JWT token here..."
              className="flex-1 text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              onClick={() => handleVerifyToken(manualToken)}
              disabled={loading || !manualToken.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              {loading ? "Verifying..." : "Verify Pass"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
