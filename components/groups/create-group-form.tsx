"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useGroups } from "@/hooks/use-groups"
import { X } from "lucide-react"

interface CreateGroupFormProps {
  userId: string
  onSuccess?: () => void
}

interface Friend {
  _id: string
  name: string
}

export function CreateGroupForm({ userId, onSuccess }: CreateGroupFormProps) {
  const [groupName, setGroupName] = useState("")
  const [friends, setFriends] = useState<Friend[]>([])
  const [members, setMembers] = useState<{ id: string; name: string }[]>([{ id: userId, name: "You" }])
  const [loading, setLoading] = useState(false)
  const [loadingFriends, setLoadingFriends] = useState(true)
  const { createGroup } = useGroups(userId)

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch(`/api/friends?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setFriends(data)
        }
      } catch (error) {
        console.error("Error fetching friends:", error)
      } finally {
        setLoadingFriends(false)
      }
    }

    fetchFriends()
  }, [userId])

  const handleAddFriend = (friend: Friend) => {
    const alreadyAdded = members.some((m) => m.id === friend._id)
    if (!alreadyAdded) {
      setMembers([...members, { id: friend._id, name: friend.name }])
    }
  }

  const handleRemoveFriend = (id: string) => {
    if (id !== userId) {
      setMembers(members.filter((m) => m.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createGroup(
        groupName,
        members.map((m) => ({ id: m.id, name: m.name })),
      )
      setGroupName("")
      setMembers([{ id: userId, name: "You" }])
      onSuccess?.()
    } catch (error) {
      console.error("Error creating group:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Group</CardTitle>
        <CardDescription>Start a new group to split expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Group name (e.g., Trip to Vegas)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />

          <div>
            <label className="text-sm font-medium mb-2 block">Select members from your friends</label>

            {loadingFriends ? (
              <p className="text-sm text-muted-foreground">Loading friends...</p>
            ) : friends.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-3">
                No friends added yet. Add friends in the Friends tab first.
              </p>
            ) : (
              <div className="mb-3 space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {friends.map((friend) => {
                  const isAdded = members.some((m) => m.id === friend._id)
                  return (
                    <button
                      key={friend._id}
                      type="button"
                      onClick={() => handleAddFriend(friend)}
                      disabled={isAdded}
                      className={`w-full text-left p-2 rounded-md transition-colors ${
                        isAdded
                          ? "bg-green-100 text-green-700 cursor-not-allowed"
                          : "bg-secondary hover:bg-secondary/80 cursor-pointer"
                      }`}
                    >
                      {friend.name} {isAdded && "✓"}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Group members</label>
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                  <span className="text-sm">{member.name}</span>
                  {member.id !== userId && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(member.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
