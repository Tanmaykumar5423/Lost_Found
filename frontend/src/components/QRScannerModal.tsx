"use client"

import React, { useState, useEffect, useRef } from "react"
import { claimService } from "@/services/api"
import { showToast } from "@/hooks/useStore"
import { 
  Camera, 
  X, 
  AlertCircle, 
  Key, 
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
      showToast.success("✅ Handshake Pass verified! Custody updated & Karma awarded.")
      onSuccess(res.data)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid or expired cryptographic token.")
      showToast.error("Handshake verification failed.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#262626] space-y-5 animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e63946]/20 text-[#e63946] flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                Handshake QR Scanner
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Campus Security Pass</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1.5 rounded-full hover:bg-[#1f1f1f] transition"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-[#e63946]/10 border border-[#e63946]/30 text-[#e63946] text-xs p-3.5 rounded-2xl flex items-start gap-2.5 font-body">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Video scan area */}
        <div className="relative bg-[#050505] rounded-2xl overflow-hidden min-h-[240px] flex items-center justify-center border-2 border-[#262626] shadow-inner">
          <div id="qr-reader" className="w-full"></div>
          
          {scannerActive && (
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-36 border-2 border-[#e63946]/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
              <div className="w-full h-0.5 bg-gradient-to-r from-[#e63946] via-purple-400 to-[#e63946] shadow-lg shadow-[#e63946]/50 animate-laser-scan"></div>
            </div>
          )}

          {!scannerActive && !error && (
            <div className="text-center p-6 space-y-2 text-[#888888]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#e63946]" />
              <p className="text-xs font-mono">Initializing camera feed...</p>
            </div>
          )}
        </div>

        {/* Manual Token Paste */}
        <div className="space-y-2 pt-2 border-t border-[#1f1f1f]">
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-[#e63946]" /> Manual Token Paste
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste signed JWT token string..."
              className="flex-1 text-xs font-mono bg-[#050505] border border-[#262626] rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-[#e63946]"
            />
            <button
              onClick={() => handleVerifyToken(manualToken)}
              disabled={loading || !manualToken.trim()}
              className="btn-unfold-primary !py-2 !px-4 !text-[10px]"
            >
              {loading ? "..." : "Verify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
