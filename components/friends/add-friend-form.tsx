"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AddFriendFormProps {
  userId: string
  allUsers: any[]
  onSuccess?: () => void
}

export function AddFriendForm({ userId, allUsers, onSuccess }: AddFriendFormProps) {
  const [selectedFriend, setSelectedFriend] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFriend) return

    setLoading(true)
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, friendId: selectedFriend }),
      })

      if (response.ok) {
        setSelectedFriend("")
        onSuccess?.()
      }
    } catch (error) {
      console.error("Error adding friend:", error)
    } finally {
      setLoading(false)
    }
  }

  const availableUsers = allUsers.filter((u) => u._id !== userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Friend</CardTitle>
        <CardDescription>Add a friend to your network</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select friend</label>
            <select
              value={selectedFriend}
              onChange={(e) => setSelectedFriend(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              required
            >
              <option value="">Choose a friend...</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Friend"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
