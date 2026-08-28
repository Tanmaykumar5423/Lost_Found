"use client"

import React, { useState, useEffect } from "react"
import { adminService } from "@/services/api"
import { useAuthStore, showToast } from "@/hooks/useStore"
import { Item, SystemStats } from "@/types"
import { formatDate } from "@/lib/utils"
import QRScannerModal from "@/components/QRScannerModal"
import Link from "next/link"
import {
  Shield,
  Camera,
  Archive,
  HeartHandshake,
  Gavel,
  History,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react"

export default function AdminDeskPage() {
  const { user, isAuthenticated } = useAuthStore()

  const [stats, setStats] = useState<SystemStats | null>(null)
  const [unclaimedItems, setUnclaimedItems] = useState<Item[]>([])
  const [recentScans, setRecentScans] = useState<any[]>([])
  const [showScanner, setShowScanner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processingVault, setProcessingVault] = useState(false)
  const [error, setError] = useState("")

  const loadAdminData = async () => {
    try {
      setLoading(true)
      const [statsRes, vaultRes, scansRes] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getUnclaimedItems().catch(() => ({ data: [] })),
        adminService.getRecentScans().catch(() => ({ data: { scans: [] } })),
      ])
      setStats(statsRes.data)
      setUnclaimedItems(vaultRes.data)
      setRecentScans(scansRes.data.scans || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load security console data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const handleProcessVault = async (action: "donation" | "auction") => {
    setProcessingVault(true)
    try {
      const res = await adminService.processVault(action)
      showToast.success(res.data.message || `Vault items processed for ${action}!`)
      await loadAdminData()
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to process vault items"
      setError(msg)
      showToast.error(msg)
    } finally {
      setProcessingVault(false)
    }
  }

  const handleScanSuccess = (result: any) => {
    showToast.success("Handshake verified! Recorded in audit ledger.")
    loadAdminData()
  }

  const exportAuditCSV = () => {
    if (recentScans.length === 0) {
      showToast.info("No audit logs available to export.")
      return
    }
    const headers = "Claim ID,Claimant Name,Claimant Email,Verified By,Timestamp\n"
    const rows = recentScans
      .map(
        (s) =>
          `"${s.claim_id}","${s.claimant_name || ""}","${s.claimant_email || ""}","${s.verified_by || ""}","${s.resolved_at || ""}"`
      )
      .join("\n")
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `CLFIS_Custody_Audit_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast.success("Audit ledger exported to CSV.")
  }

  const isAdmin = user?.role === "SECURITY_ADMIN" || user?.role === "STAFF"

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-5 animate-fade-in-up">
        <span className="text-5xl">🛑</span>
        <h1 className="text-2xl font-bold text-white">Restricted Security Console</h1>
        <p className="text-xs text-[#888888] font-body max-w-sm mx-auto">
          This portal is restricted to Campus Security Administrators and authorized staff.
        </p>
        <Link href="/login" className="btn-unfold-primary inline-block">
          Sign In with Admin Account
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#1f1f1f] pb-6">
        <div>
          <span className="subheading-section">Campus Security Command</span>
          <h1 className="heading-section mt-1">Security Desk & Vault</h1>
          <p className="text-xs text-[#888888] font-body mt-1">
            Physical handover verification scanner, 45-day vault asset lifecycle & custody audit ledger.
          </p>
        </div>

        <button
          onClick={() => setShowScanner(true)}
          className="btn-unfold-red !py-3 !px-6 !text-xs inline-flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Handshake QR Pass</span>
        </button>
      </div>

      {error && (
        <div className="bg-[#e63946]/10 border border-[#e63946]/30 text-[#e63946] text-xs p-4 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="unfold-card p-6 text-center space-y-1">
            <p className="subheading-section !text-[10px]">Resolution Rate</p>
            <p className="text-3xl sm:text-4xl font-black text-white font-mono">{stats.resolution_rate}%</p>
            <p className="text-[11px] text-[#888888] font-body">{stats.resolved_items} of {stats.total_items} returned</p>
          </div>

          <div className="unfold-card p-6 text-center space-y-1">
            <p className="subheading-section !text-[10px]">Lost Reports</p>
            <p className="text-3xl sm:text-4xl font-black text-[#e63946] font-mono">{stats.lost_items}</p>
            <p className="text-[11px] text-[#888888] font-body">Open lost listings</p>
          </div>

          <div className="unfold-card p-6 text-center space-y-1">
            <p className="subheading-section !text-[10px]">Found Reports</p>
            <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">{stats.found_items}</p>
            <p className="text-[11px] text-[#888888] font-body">Reported by finders</p>
          </div>

          <div className="unfold-card p-6 text-center space-y-1">
            <p className="subheading-section !text-[10px]">AI Matches</p>
            <p className="text-3xl sm:text-4xl font-black text-purple-400 font-mono">{stats.total_matches}</p>
            <p className="text-[11px] text-[#888888] font-body">{stats.high_confidence_matches} high confidence</p>
          </div>
        </div>
      )}

      {/* Unclaimed Asset Vault */}
      <div className="unfold-card p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#1f1f1f] pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-400" />
              <span>Unclaimed Asset Vault (45-Day Lifecycle)</span>
            </h2>
            <p className="text-xs text-[#888888] font-body mt-0.5">
              Items unrecovered after 45 days are eligible for student welfare donation or campus green auction.
            </p>
          </div>

          {unclaimedItems.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleProcessVault("donation")}
                disabled={processingVault}
                className="btn-unfold-outline !py-2 !px-4 !text-[10px] inline-flex items-center gap-1.5"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Donate ({unclaimedItems.length})</span>
              </button>
              <button
                onClick={() => handleProcessVault("auction")}
                disabled={processingVault}
                className="btn-unfold-primary !py-2 !px-4 !text-[10px] inline-flex items-center gap-1.5"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>Auction ({unclaimedItems.length})</span>
              </button>
            </div>
          )}
        </div>

        {unclaimedItems.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">Vault Lifecycle Clear</p>
            <p className="text-xs text-[#888888] font-body">
              No items currently exceed the 45-day unclaimed threshold.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead className="bg-[#050505] text-[#888888] uppercase border-y border-[#262626]">
                <tr>
                  <th className="py-3 px-4 font-bold">Item</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Zone</th>
                  <th className="py-3 px-4 font-bold">Reported Date</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {unclaimedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#141414] transition">
                    <td className="py-3.5 px-4 font-bold text-white">{item.title}</td>
                    <td className="py-3.5 px-4 text-[#cccccc]">{item.category}</td>
                    <td className="py-3.5 px-4 text-[#888888]">{item.campus_zone}</td>
                    <td className="py-3.5 px-4 text-[#888888] font-mono">{formatDate(item.created_at)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      <span className="bg-amber-950 px-2 py-0.5 rounded-md border border-amber-800">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custody Audit Ledger */}
      <div className="unfold-card p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#1f1f1f] pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              <span>Physical Custody & QR Handshake Audit Log</span>
            </h2>
            <p className="text-xs text-[#888888] font-body mt-0.5">
              Immutable ledger tracking verified returns, officer badges, and timestamps.
            </p>
          </div>

          <button
            onClick={exportAuditCSV}
            className="btn-unfold-outline !py-2 !px-4 !text-[10px] inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {recentScans.length === 0 ? (
          <div className="text-center py-10 text-[#666666] text-xs font-body">
            No handshake handovers logged in this session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead className="bg-[#050505] text-[#888888] uppercase border-y border-[#262626]">
                <tr>
                  <th className="py-3 px-4 font-bold">Claim ID</th>
                  <th className="py-3 px-4 font-bold">Claimant</th>
                  <th className="py-3 px-4 font-bold">Verified By</th>
                  <th className="py-3 px-4 font-bold">Handover Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {recentScans.map((scan, idx) => (
                  <tr key={idx} className="hover:bg-[#141414] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">#{scan.claim_id}</td>
                    <td className="py-3.5 px-4 text-white">
                      {scan.claimant_name} <span className="text-[#888888] font-mono">({scan.claimant_email})</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#cccccc] flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      {scan.verified_by}
                    </td>
                    <td className="py-3.5 px-4 text-[#888888] font-mono">{formatDate(scan.resolved_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onSuccess={handleScanSuccess}
      />
    </div>
  )
}
