"use client"

import React, { useState } from "react"
import { MapPin, Building, Navigation } from "lucide-react"

interface LocationPickerProps {
  selectedZone: string
  onChange: (zone: string, lat?: number, lng?: number) => void
}

export const CAMPUS_ZONES = [
  { name: "Library Zone", desc: "Central Library, Reading Halls, Study Desks, 2nd Fl.", lat: 12.9716, lng: 77.5946, icon: "📚" },
  { name: "Engineering Block B", desc: "Computer Labs, Lecture Halls, Robotics Workshop", lat: 12.9720, lng: 77.5950, icon: "💻" },
  { name: "Science Block", desc: "Physics & Chemistry Labs, Main Auditoriums", lat: 12.9712, lng: 77.5940, icon: "🔬" },
  { name: "Hostel 3", desc: "Residential Quad, Dining Hall, Common Lounges", lat: 12.9705, lng: 77.5935, icon: "🏢" },
  { name: "Sports Complex", desc: "Gymnasium, Indoor Courts, Main Pavilion", lat: 12.9730, lng: 77.5960, icon: "⚽" },
  { name: "Administration Block", desc: "Registrar Desk, Security Office, Main Gate foyer", lat: 12.9710, lng: 77.5955, icon: "🏛️" },
  { name: "Main Cafeteria", desc: "Food Court, Open Patio, Student Plaza", lat: 12.9718, lng: 77.5948, icon: "☕" },
  { name: "Student Activity Center", desc: "Clubs Room, Amphitheatre, Music Hub", lat: 12.9725, lng: 77.5942, icon: "🎨" },
]

export default function LocationPicker({ selectedZone, onChange }: LocationPickerProps) {
  const activeZoneObj = CAMPUS_ZONES.find((z) => z.name === selectedZone) || CAMPUS_ZONES[0]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#e63946]" />
          <span>Campus Zone & Location *</span>
        </label>
        <span className="text-[11px] text-[#666666] font-mono flex items-center gap-1">
          <Navigation className="w-3 h-3 text-[#555555]" />
          {activeZoneObj.lat.toFixed(4)}, {activeZoneObj.lng.toFixed(4)}
        </span>
      </div>

      {/* Select Dropdown */}
      <div className="relative">
        <select
          value={selectedZone}
          onChange={(e) => {
            const zoneObj = CAMPUS_ZONES.find((z) => z.name === e.target.value)
            onChange(e.target.value, zoneObj?.lat, zoneObj?.lng)
          }}
          className="w-full appearance-none border border-[#262626] rounded-xl px-4 py-3 bg-[#0a0a0a] text-white text-xs font-body focus:ring-2 focus:ring-[#e63946] pr-10"
        >
          {CAMPUS_ZONES.map((zone) => (
            <option key={zone.name} value={zone.name}>
              {zone.icon} {zone.name} — {zone.desc}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666]">
          <Building className="w-4 h-4" />
        </div>
      </div>

      {/* Quick Select Zone Pills */}
      <div className="space-y-1.5 pt-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">Quick Hotspots:</p>
        <div className="flex flex-wrap gap-1.5">
          {CAMPUS_ZONES.map((zone) => {
            const isSelected = selectedZone === zone.name
            return (
              <button
                key={zone.name}
                type="button"
                onClick={() => onChange(zone.name, zone.lat, zone.lng)}
                className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border transition ${
                  isSelected
                    ? "bg-white text-black border-white font-extrabold"
                    : "bg-[#0a0a0a] text-[#888888] border-[#222222] hover:text-white hover:border-[#444444]"
                }`}
              >
                <span>{zone.icon}</span>{" "}
                <span>{zone.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
