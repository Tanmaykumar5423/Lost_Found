"use client"

import React, { useState } from "react"
import { jsPDF } from "jspdf"
import { Item } from "@/types"
import { formatDate } from "@/lib/utils"
import { showToast } from "@/hooks/useStore"
import { Printer, Download, X } from "lucide-react"

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

      // Header Banner
      doc.setFillColor(230, 57, 70) // Red
      doc.rect(0, 0, 210, 38, "F")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(26)
      doc.setTextColor(255, 255, 255)
      doc.text("LOST ITEM NOTICE", 105, 24, { align: "center" })

      // Title
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(18)
      doc.text(item.title, 105, 52, { align: "center" })

      // Metadata
      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(20, 60, 170, 36, 4, 4, "FD")

      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(51, 65, 85)
      doc.text(`Category: ${item.category}`, 28, 70)
      doc.text(`Campus Zone: ${item.campus_zone}`, 28, 78)
      doc.text(`Date Lost: ${formatDate(item.incident_time)}`, 28, 86)

      // Reward Banner
      if (rewardAmount) {
        doc.setFillColor(254, 243, 199)
        doc.setDrawColor(245, 158, 11)
        doc.roundedRect(20, 102, 170, 14, 3, 3, "FD")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(180, 83, 9)
        doc.text(`★ REWARD / KARMA BOUNTY: ${rewardAmount}`, 105, 111, { align: "center" })
      }

      // Description
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

      // Instructions
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

      // Footer
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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] text-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#262626] space-y-5 animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e63946]/20 text-[#e63946] flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                Printable Bulletin Flyer Generator
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">PDF Notice for Notice Boards</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1.5 rounded-full hover:bg-[#1f1f1f] transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="border border-[#262626] rounded-2xl p-5 bg-[#0a0a0a] space-y-3">
          <div className="bg-[#e63946] text-white font-bold text-center py-2.5 rounded-xl uppercase tracking-[0.15em] text-xs">
            Lost Item Bulletin Notice
          </div>

          <div>
            <h4 className="font-bold text-white text-base">{item.title}</h4>
            <p className="text-xs text-[#888888] font-body mt-0.5">
              Zone: <span className="text-white font-semibold">{item.campus_zone}</span> | Category: <span className="text-white font-semibold">{item.category}</span>
            </p>
          </div>

          <p className="text-xs text-[#cccccc] bg-[#141414] p-3 rounded-xl border border-[#222222] font-body italic line-clamp-3">
            "{item.description}"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                Reward / Bounty
              </label>
              <input
                type="text"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                className="w-full text-xs font-body bg-[#141414] border border-[#262626] rounded-lg px-3 py-2 text-white"
                placeholder="e.g. $20 / Coffee treat"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                Contact Desk
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full text-xs font-body bg-[#141414] border border-[#262626] rounded-lg px-3 py-2 text-white"
                placeholder="e.g. Security ext. 4400"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onClose}
            className="btn-unfold-outline flex-1 !py-2.5 !text-[10px]"
          >
            Cancel
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            className="btn-unfold-primary flex-1 !py-2.5 !text-[10px] inline-flex items-center justify-center gap-1.5"
          >
            {generating ? (
              <span>Generating PDF...</span>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Flyer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
