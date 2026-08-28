"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { itemService } from "@/services/api"

export default function ReportLostPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "ELECTRONICS",
    campus_zone: "Library Zone",
    incident_time: new Date().toISOString().slice(0, 16),
    is_high_value: false,
  })
  const [images, setImages] = useState<File[]>([])
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

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).slice(0, 3)
    setImages([...images, ...files])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const form = new FormData()
      form.append("type", "LOST")
      form.append("title", formData.title)
      form.append("description", formData.description)
      form.append("category", formData.category)
      form.append("campus_zone", formData.campus_zone)
      form.append("incident_time", formData.incident_time)
      form.append("is_high_value", String(formData.is_high_value))

      images.forEach((img) => form.append("images", img))

      await itemService.reportItem(form)
      router.push("/dashboard")
    } catch (err: any) {
      setError("Failed to report item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Report Lost Item</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Black iPhone 14"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="Detailed description including identifying marks..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="ELECTRONICS">Electronics</option>
              <option value="WALLETS_CARDS">Wallets & Cards</option>
              <option value="KEYS">Keys</option>
              <option value="CLOTHING">Clothing</option>
              <option value="DOCUMENTS">Documents</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Campus Zone *</label>
            <select
              name="campus_zone"
              value={formData.campus_zone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Library Zone">Library Zone</option>
              <option value="Engineering Block">Engineering Block</option>
              <option value="Science Block">Science Block</option>
              <option value="Hostel">Hostel</option>
              <option value="Sports Complex">Sports Complex</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            When did you lose it? *
          </label>
          <input
            type="datetime-local"
            name="incident_time"
            value={formData.incident_time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_high_value"
            checked={formData.is_high_value}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm font-medium">
            High-value item (will require verification to view)
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Add Photos (up to 3)
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
          >
            <p className="text-gray-600">Drag and drop images here</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setImages(
                  Array.from(e.target.files || []).slice(0, 3)
                )
              }
              className="hidden"
            />
          </div>
          {images.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {images.length} image(s) selected
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Report Lost Item"}
        </button>
      </form>
    </div>
  )
}
