"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { adminService } from "@/services/api"

export default function Home() {
  const [stats, setStats] = useState({
    total_items: 0,
    lost_items: 0,
    found_items: 0,
    resolved_items: 0,
    resolution_rate: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getSystemStats()
        setStats(response.data)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4">Campus Lost & Found</h1>
        <p className="text-xl text-gray-600 mb-8">
          Smart AI-powered matching system for university campuses
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/feed"
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-600"
          >
            Browse Items
          </Link>
          <Link
            href="/report/lost"
            className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-blue-50"
          >
            Report Lost Item
          </Link>
          <Link
            href="/report/found"
            className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-blue-50"
          >
            Report Found Item
          </Link>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium">Total Items</h3>
          <p className="text-4xl font-bold text-primary mt-2">
            {stats.total_items}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium">Lost Items</h3>
          <p className="text-4xl font-bold text-warning mt-2">
            {stats.lost_items}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium">Found Items</h3>
          <p className="text-4xl font-bold text-success mt-2">
            {stats.found_items}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium">Resolution Rate</h3>
          <p className="text-4xl font-bold text-secondary mt-2">
            {stats.resolution_rate}%
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-3">🔍 Smart Matching</h3>
          <p className="text-gray-600">
            AI-powered multimodal matching using SigLIP embeddings to find lost
            and found items
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-3">🛡️ Secure Handoff</h3>
          <p className="text-gray-600">
            Cryptographic QR codes for secure in-person item handovers with
            verification
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-3">🗺️ Location Aware</h3>
          <p className="text-gray-600">
            Campus-aware scoring using geofences and PostGIS for accurate
            matching
          </p>
        </div>
      </section>
    </div>
  )
}
