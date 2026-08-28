"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { itemService } from "@/services/api"
import { useAuthStore, showToast } from "@/hooks/useStore"
import LocationPicker from "@/components/LocationPicker"
import Link from "next/link"
import {
  AlertCircle,
  Sparkles,
  UploadCloud,
  X,
  Lock,
  Clock,
  ShieldCheck,
  Tag,
  FileText,
  Camera,
  ArrowRight,
} from "lucide-react"

const CATEGORIES = [
  { id: "ELECTRONICS", label: "Electronics", icon: "💻", desc: "Laptops, phones, headphones, chargers" },
  { id: "WALLETS_CARDS", label: "Wallets & IDs", icon: "💳", desc: "Purses, campus badges, bank cards" },
  { id: "KEYS", label: "Keys & Chains", icon: "🔑", desc: "Dorm keys, bike locks, keyrings" },
  { id: "CLOTHING", label: "Clothing", icon: "👕", desc: "Jackets, hoodies, caps, umbrellas" },
  { id: "DOCUMENTS", label: "Documents", icon: "📄", desc: "Notebooks, textbooks, passports" },
  { id: "OTHER", label: "Other Items", icon: "📦", desc: "Water bottles, sports gear, bags" },
]

export default function ReportLostPage() {
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])

  const hasToken = () => Boolean(localStorage.getItem("token"))

  useEffect(() => {
    const nextPreviews = images.map((image) => URL.createObjectURL(image))
    setPreviews(nextPreviews)
    return () => nextPreviews.forEach((preview) => URL.revokeObjectURL(preview))
  }, [images])

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login?redirect=/report/lost")
    }
  }, [router])

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addImages(Array.from(e.target.files || []))
    e.target.value = ""
  }

  const removeImage = (index: number) => setImages((current) => current.filter((_, fileIndex) => fileIndex !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isAuthenticated) {
      setError("Please sign in with your campus account before reporting a lost item.")
      showToast.warning("Sign in required to submit a report.")
      return
    }

    setLoading(true)
    try {
      const form = new FormData()
      form.append("type", "LOST")
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
      showToast.success("Lost item report submitted! AI matching active.")
      router.push(`/dashboard?item=${res.data.id}&reported=true`)
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to submit lost item report"
      setError(msg)
      showToast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-[#1f1f1f] pb-6">
        <span className="subheading-section">Lost Property Wizard</span>
        <h1 className="heading-section mt-1">Report a Lost Item</h1>
        <p className="text-xs text-[#888888] font-body mt-1">
          Provide accurate visual & location details. Our multimodal SigLIP AI engine will scan all matching campus reports continuously.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="unfold-card p-4 flex items-center justify-between text-xs text-amber-300 border-amber-500/30">
          <span>⚠️ You need to sign in to submit a report and track AI candidate matches.</span>
          <Link href="/login" className="font-bold underline text-white hover:text-amber-400">
            Sign In Now
          </Link>
        </div>
      )}

      {error && (
        <div className="bg-[#e63946]/10 border border-[#e63946]/30 text-[#e63946] text-xs p-4 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-sm">
        {/* Section 1 */}
        <div className="unfold-card p-6 sm:p-7 space-y-5">
          <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-[#1f1f1f] pb-3">
            <span className="w-6 h-6 rounded-lg bg-[#e63946] text-white font-bold text-xs flex items-center justify-center font-mono">
              01
            </span>
            <span>Item Details & Title</span>
          </h3>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full text-xs font-body bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#e63946]"
              placeholder="e.g. Midnight Blue ThinkPad X1 Carbon Laptop"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-2">
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
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-1.5 ${
                      isSelected
                        ? "bg-white text-black border-white shadow-xl"
                        : "bg-[#0a0a0a] border-[#222222] text-[#888888] hover:text-white hover:border-[#444444]"
                    }`}
                  >
                    <div className="text-2xl">{cat.icon}</div>
                    <span className="font-bold text-xs block">{cat.label}</span>
                    <span className={`text-[10px] block line-clamp-1 ${isSelected ? "text-[#555555]" : "text-[#666666]"}`}>
                      {cat.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="unfold-card p-6 sm:p-7 space-y-5">
          <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-[#1f1f1f] pb-3">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">
              02
            </span>
            <span>Location & Estimated Time</span>
          </h3>

          <LocationPicker
            selectedZone={formData.campus_zone}
            onChange={handleZoneChange}
          />

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Estimated Time Lost *</span>
              </label>
              <div className="flex gap-1.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => handleTimePreset(0)}
                  className="px-2 py-0.5 rounded bg-[#141414] hover:bg-[#1f1f1f] text-[#888888]"
                >
                  Just Now
                </button>
                <button
                  type="button"
                  onClick={() => handleTimePreset(4)}
                  className="px-2 py-0.5 rounded bg-[#141414] hover:bg-[#1f1f1f] text-[#888888]"
                >
                  4h ago
                </button>
                <button
                  type="button"
                  onClick={() => handleTimePreset(24)}
                  className="px-2 py-0.5 rounded bg-[#141414] hover:bg-[#1f1f1f] text-[#888888]"
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
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Section 3 */}
        <div className="unfold-card p-6 sm:p-7 space-y-5">
          <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-[#1f1f1f] pb-3">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center font-mono">
              03
            </span>
            <span>Description & Reference Photos</span>
          </h3>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-1.5">
              Public Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl p-4 text-xs font-body text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Describe brand, stickers, keychains, scratches, color shades, or exact room/desk area..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-1.5">
              Upload Photos / Reference Images (Up to 3)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleFiles(e.dataTransfer.files)
              }}
              className="border-2 border-dashed border-[#262626] hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition bg-[#0a0a0a]"
              onClick={() => document.getElementById("lost-file-input")?.click()}
            >
              <UploadCloud className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">
                Click to select or drag and drop reference photos
              </p>
              <p className="text-[11px] text-[#666666] mt-0.5 font-body">PNG, JPG, JPEG up to 10MB each</p>
              <input
                id="lost-file-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-[#222222] h-24">
                    <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1.5 right-1.5 bg-[#e63946] text-white rounded-full p-1 hover:bg-rose-700 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 4 */}
        <div className="unfold-card p-6 sm:p-7 space-y-4 border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  Zero-Knowledge High-Value Shield
                </h3>
                <p className="text-[11px] text-[#888888] font-body">Mask public preview for high-value items</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="is_high_value"
                name="is_high_value"
                checked={formData.is_high_value}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#1f1f1f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-1.5">
              Private Ownership Secret (Verified during challenge)
            </label>
            <input
              type="text"
              name="private_details"
              value={formData.private_details}
              onChange={handleChange}
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#555555] focus:ring-2 focus:ring-amber-500 font-mono"
              placeholder="e.g. Phone wallpaper image, engraved initials inside wallet, exact cash bills, serial suffix"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-unfold-red w-full !py-4 !text-xs flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Analyzing & Submitting...</span>
          ) : (
            <span>Submit Lost Report & Initiate AI Matching</span>
          )}
        </button>
      </form>
    </div>
  )
}
