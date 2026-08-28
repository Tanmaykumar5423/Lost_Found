"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/hooks/useStore"
import { itemService } from "@/services/api"

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const fetchItems = async () => {
      try {
        const response = await itemService.getUserItems()
        setItems(response.data)
      } catch (error) {
        console.error("Failed to fetch items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [isAuthenticated])

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">My Dashboard</h1>

      {/* User Profile */}
      {user && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="text-xl font-semibold">{user.full_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="text-xl font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Role</p>
              <p className="text-xl font-semibold">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-600">Karma Score</p>
              <p className="text-xl font-semibold text-purple-600">
                {user.karma_score} ⭐
              </p>
            </div>
          </div>
        </div>
      )}

      {/* My Items */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">My Items</h2>

        {loading ? (
          <p>Loading your items...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-600">You haven't reported any items yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item: any) => (
              <div key={item.id} className="border rounded-lg p-4">
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-600">
                  {item.type} - {item.category}
                </p>
                <p className="text-sm text-gray-600">Zone: {item.campus_zone}</p>
                <p className="text-sm mt-2">Status: {item.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
