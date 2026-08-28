"use client"

import React, { useState } from "react"
import { jsPDF } from "jspdf"
import { Item } from "@/types"
import { formatDate } from "@/lib/utils"
import { showToast } from "@/hooks/useStore"
import { Printer, Download, X, FileText, CheckCircle2, ShieldCheck } from "lucide-react"

interface PosterGeneratorModalProps {
  item: Item
  onClose: () => void
}

export default function PosterGeneratorModal({ item, onClose }: PosterGeneratorModalProps) {
  const [generating, setGenerating] = useState(false)
  const [rewardAmount, setRewardAmount] = useState("$20 Karma / Reward")
  const [contactInfo, setContactInfo] = useState("Campus Security Desk (ext. 4400) / CLFIS Portal")

  const handleDownloadPDF = () => {
    setGenerating(true)
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Top Red Warning Header
      doc.setFillColor(225, 29, 72) // Rose-600
      doc.rect(0, 0, 210, 38, "F")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(26)
      doc.setTextColor(255, 255, 255)
      doc.text("LOST ITEM NOTICE", 105, 24, { align: "center" })

      // Title Subheading
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(18)
      doc.text(item.title, 105, 52, { align: "center" })

      // Metadata Info Box
      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(20, 60, 170, 36, 4, 4, "FD")

      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(51, 65, 85)
      doc.text(`Category: ${item.category}`, 28, 70)
      doc.text(`Campus Zone: ${item.campus_zone}`, 28, 78)
      doc.text(`Date Lost: ${formatDate(item.incident_time)}`, 28, 86)

      // Reward Banner (if provided)
      if (rewardAmount) {
        doc.setFillColor(254, 243, 199) // amber-100
        doc.setDrawColor(245, 158, 11) // amber-500
        doc.roundedRect(20, 102, 170, 14, 3, 3, "FD")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(180, 83, 9)
        doc.text(`★ REWARD / KARMA BOUNTY: ${rewardAmount}`, 105, 111, { align: "center" })
      }

      // Description Box
      const descStartY = rewardAmount ? 124 : 104
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.setTextColor(15, 23, 42)
      doc.text("Description & Identifying Marks:", 20, descStartY)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10.5)
      doc.setTextColor(71, 85, 105)
      const splitDesc = doc.splitTextToSize(item.description, 170)
      doc.text(splitDesc, 20, descStartY + 8)

      // Return & Handover Instructions
      const instructStartY = descStartY + 48
      doc.setFillColor(239, 246, 255)
      doc.setDrawColor(191, 219, 254)
      doc.roundedRect(20, instructStartY, 170, 48, 4, 4, "FD")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(30, 64, 175)
      doc.text("HOW TO RETURN OR REPORT FOUND:", 28, instructStartY + 10)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(51, 65, 85)
      doc.text("1. Go to Campus Lost & Found portal or scan QR at Security Desk.", 28, instructStartY + 18)
      doc.text("2. Hand over item directly to Campus Security Office or submit a report.", 28, instructStartY + 26)
      doc.text(`3. Contact: ${contactInfo}`, 28, instructStartY + 34)
      doc.text("4. Instant +25 Karma Points rewarded upon cryptographic QR handover!", 28, instructStartY + 42)

      // Official Footer
      doc.setFontSize(9)
      doc.setTextColor(148, 163, 184)
      doc.text(
        `Official Notice generated via CLFIS Engine • Case #${item.id} • Verified Campus Portal`,
        105,
        282,
        { align: "center" }
      )

      doc.save(`CLFIS_Lost_Notice_${item.id}_${item.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`)
      showToast.success("Printable Notice Flyer PDF downloaded successfully!")
      onClose()
    } catch (err) {
      console.error("PDF generation error", err)
      showToast.error("Failed to generate PDF flyer.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Printable Bulletin Flyer Generator
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">PDF Notice for Campus Notice Boards</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Poster Preview Box */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3 shadow-inner">
          <div className="bg-rose-600 text-white font-black text-center py-2.5 rounded-xl uppercase tracking-wider text-xs shadow-sm">
            🚨 Lost Item Bulletin Notice
          </div>

          <div>
            <h4 className="font-black text-slate-900 text-base">{item.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Zone: <span className="font-semibold text-slate-700">{item.campus_zone}</span> | Category: <span className="font-semibold text-slate-700">{item.category}</span>
            </p>
          </div>

          <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/70 italic line-clamp-3">
            "{item.description}"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Reward / Karma Offer
              </label>
              <input
                type="text"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="e.g. $20 / Coffee treat"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Contact Info / Desk
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                placeholder="e.g. Security ext. 4400"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition shadow-md shadow-blue-500/20"
          >
            {generating ? (
              <span>Generating PDF...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF Flyer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
