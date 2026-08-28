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
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lock,
  Search,
  Download,
  Calendar,
  Building2,
  RefreshCw
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
      setError(err.response?.data?.detail || "Failed to load administrative security console data")
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
    showToast.success("Handshake verified! Item marked resolved and recorded in audit ledger.")
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
      <div className="max-w-md mx-auto text-center py-16 space-y-4 animate-fade-in-up">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-3xl font-black">
          🛡️
        </div>
        <h1 className="text-2xl font-black text-slate-900">Restricted Security Console</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          This portal is restricted to Campus Security Administrators and verified Staff.
        </p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md shadow-blue-500/25"
        >
          Sign In with Admin Account
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Campus Security Console</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Security Desk & Asset Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical handover verification scanner, 45-day vault asset lifecycle & custody audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowScanner(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition text-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Handshake QR Pass</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real-time KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resolution Rate</p>
            <p className="text-3xl font-black text-blue-600 mt-1.5 font-mono">{stats.resolution_rate}%</p>
            <p className="text-[11px] text-slate-400 mt-1">{stats.resolved_items} of {stats.total_items} items returned</p>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lost Reports</p>
            <p className="text-3xl font-black text-rose-600 mt-1.5 font-mono">{stats.lost_items}</p>
            <p className="text-[11px] text-slate-400 mt-1">Open lost listings</p>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Found Reports</p>
            <p className="text-3xl font-black text-emerald-600 mt-1.5 font-mono">{stats.found_items}</p>
            <p className="text-[11px] text-slate-400 mt-1">Reported by finders</p>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Matches</p>
            <p className="text-3xl font-black text-purple-600 mt-1.5 font-mono">{stats.total_matches}</p>
            <p className="text-[11px] text-slate-400 mt-1">{stats.high_confidence_matches} high confidence</p>
          </div>
        </div>
      )}

      {/* Unclaimed Asset Vault (45-Day Policy Table) */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-600" />
              <span>Unclaimed Asset Vault (45-Day Lifecycle)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Items unrecovered after 45 days are eligible for verified student welfare donation or campus green auction.
            </p>
          </div>

          {unclaimedItems.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleProcessVault("donation")}
                disabled={processingVault}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-emerald-500/20"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Donate ({unclaimedItems.length})</span>
              </button>
              <button
                onClick={() => handleProcessVault("auction")}
                disabled={processingVault}
                className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-purple-500/20"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>Auction ({unclaimedItems.length})</span>
              </button>
            </div>
          )}
        </div>

        {unclaimedItems.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">Vault Lifecycle Clear</p>
            <p className="text-xs text-slate-400">
              No items currently exceed the 45-day unclaimed threshold.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Item</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Zone</th>
                  <th className="py-3 px-4 font-bold">Reported Date</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unclaimedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.title}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{item.category}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.campus_zone}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(item.created_at)}</td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-700">
                      <span className="bg-amber-100 px-2 py-0.5 rounded-md">
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
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <span>Physical Custody & QR Handshake Audit Log</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable ledger tracking verified returns, officer badges, and timestamps.
            </p>
          </div>

          <button
            onClick={exportAuditCSV}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>

        {recentScans.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No handshake handovers recorded in this session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Claim ID</th>
                  <th className="py-3 px-4 font-bold">Claimant</th>
                  <th className="py-3 px-4 font-bold">Verified By Officer</th>
                  <th className="py-3 px-4 font-bold">Handover Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentScans.map((scan, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-black text-blue-600 font-mono">#{scan.claim_id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {scan.claimant_name} <span className="text-slate-400 font-normal">({scan.claimant_email})</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-amber-500" />
                      {scan.verified_by}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{formatDate(scan.resolved_at)}</td>
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
