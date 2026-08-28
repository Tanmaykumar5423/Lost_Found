"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { itemService } from "@/services/api"
import { useAuthStore, showToast } from "@/hooks/useStore"
import LocationPicker from "@/components/LocationPicker"
import Link from "next/link"
import {
  Sparkles,
  Trophy,
  UploadCloud,
  X,
  Lock,
  Clock,
  ShieldCheck,
  Tag,
  FileText,
  Camera,
  ArrowRight,
  AlertCircle,
} from "lucide-react"

const CATEGORIES = [
  { id: "ELECTRONICS", label: "Electronics", icon: "💻", desc: "Laptops, phones, headphones, chargers" },
  { id: "WALLETS_CARDS", label: "Wallets & IDs", icon: "💳", desc: "Purses, campus badges, bank cards" },
  { id: "KEYS", label: "Keys & Chains", icon: "🔑", desc: "Dorm keys, bike locks, keyrings" },
  { id: "CLOTHING", label: "Clothing", icon: "👕", desc: "Jackets, hoodies, caps, umbrellas" },
  { id: "DOCUMENTS", label: "Documents", icon: "📄", desc: "Notebooks, textbooks, IDs" },
  { id: "OTHER", label: "Other Items", icon: "📦", desc: "Water bottles, sports gear, bags" },
]

export default function ReportFoundPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "ELECTRONICS",
    campus_zone: "Library Zone",
    latitude: 12.9716,
    longitude: 77.5946,
    incident_time: new Date().toISOString().slice(0, 16),
    is_high_value: false,
    private_details: "",
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    })
  }

  const handleTimePreset = (offsetHours: number) => {
    const d = new Date()
    d.setHours(d.getHours() - offsetHours)
    setFormData((prev) => ({ ...prev, incident_time: d.toISOString().slice(0, 16) }))
  }

  const handleZoneChange = (zone: string, lat?: number, lng?: number) => {
    setFormData((prev) => ({
      ...prev,
      campus_zone: zone,
      latitude: lat ?? prev.latitude,
      longitude: lng ?? prev.longitude,
    }))
  }

  const handleFiles = (filesList: FileList | null) => {
    if (!filesList) return
    const newFiles = Array.from(filesList).slice(0, 3 - images.length)
    const updatedImages = [...images, ...newFiles]
    setImages(updatedImages)

    const previews = updatedImages.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    setImages(updated)
    setImagePreviews(updated.map((f) => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isAuthenticated) {
      setError("Please sign in with your campus account before reporting a found item.")
      showToast.warning("Sign in required to earn karma and submit a report.")
      return
    }

    setLoading(true)
    try {
      const form = new FormData()
      form.append("type", "FOUND")
      form.append("title", formData.title.trim())
      form.append("description", formData.description.trim())
      form.append("category", formData.category)
      form.append("campus_zone", formData.campus_zone)
      form.append("incident_time", formData.incident_time)
      form.append("is_high_value", String(formData.is_high_value))
      if (formData.private_details.trim()) {
        form.append("private_details", formData.private_details.trim())
      }
      if (formData.latitude) form.append("latitude", String(formData.latitude))
      if (formData.longitude) form.append("longitude", String(formData.longitude))

      images.forEach((img) => form.append("images", img))

      const res = await itemService.reportItem(form)
      showToast.success("Found item reported! +25 Karma pending verification.")
      router.push(`/dashboard?item=${res.data.id}&reported_found=true`)
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to submit found item report"
      setError(msg)
      showToast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Earn +25 Karma Reputation Upon Handover</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Report a Found Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Thank you for being a good campus citizen! Our multimodal AI will match this with student reports and notify the rightful owner.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <span className="font-semibold">⚠️ Please sign in so you can receive +25 Karma points upon cryptographic QR handover.</span>
          <Link href="/login" className="font-bold underline text-blue-600 hover:text-blue-700">
            Sign In Now
          </Link>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-sm">
        {/* Section 1: Item Basic Details */}
        <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80 space-y-5">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <span>Found Item Title & Category</span>
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Found Item Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full text-sm border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
              placeholder="e.g. Set of Dorm Room Keys with Blue Yale Keychain"
            />
          </div>

          {/* Category Visual Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-3.5 rounded-2xl border text-left transition duration-150 flex flex-col justify-between space-y-1 ${
                      isSelected
                        ? "bg-emerald-50/80 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-2xl">{cat.icon}</div>
                    <span className="font-extrabold text-xs block">{cat.label}</span>
                    <span className="text-[10px] text-slate-500 leading-tight block line-clamp-1">{cat.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Location & Timestamp */}
        <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80 space-y-5">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <span>Where & When Did You Find It?</span>
          </h3>

          <LocationPicker
            selectedZone={formData.campus_zone}
            onChange={handleZoneChange}
          />

          {/* Date/Time with Quick Presets */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Found Date/Time *</span>
              </label>
              <div className="flex gap-1.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => handleTimePreset(0)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Just Now
                </button>
                <button
                  type="button"
                  onClick={() => handleTimePreset(2)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  2h ago
                </button>
                <button
                  type="button"
                  onClick={() => handleTimePreset(24)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Yesterday
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              name="incident_time"
              value={formData.incident_time}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Section 3: Description & Photos */}
        <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl shadow-xs border border-slate-200/80 space-y-5">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <span>Item Description & Photos</span>
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Public Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 font-medium text-xs sm:text-sm"
              placeholder="Describe condition, exact spot where discovered (e.g. under library table 4B), color, and visible details..."
            />
          </div>

          {/* Photos Dropzone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Upload Photos of Found Item (Up to 3)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleFiles(e.dataTransfer.files)
              }}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/60 hover:bg-slate-50"
              onClick={() => document.getElementById("found-file-input")?.click()}
            >
              <Camera className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">
                Click to take/select photos or drop here
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Photos enable instant multimodal visual matching with lost reports
              </p>
              <input
                id="found-file-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 h-24 shadow-2xs">
                    <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: High Value / Challenge Secret */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  Mark as High-Value / Sensitive Item
                </h3>
                <p className="text-[11px] text-slate-400">Blurs image to require ownership challenge</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="is_high_value_found"
                name="is_high_value"
                checked={formData.is_high_value}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Private Detail to Challenge Claimants
            </label>
            <input
              type="text"
              name="private_details"
              value={formData.private_details}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Specific cash denomination, student ID name on card, keychain charms count"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl transition shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              Indexing Found Item & Matching...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>🌟 Submit Found Item (+25 Karma Pending)</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>
    </div>
  )
}
