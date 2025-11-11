"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

export default function FriendsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [friends, setFriends] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [friendInput, setFriendInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.id) return
      try {
        const response = await fetch(`/api/friends?userId=${user.id}`)
        const data = await response.json()
        setFriends(data)
      } catch (error) {
        console.error("Error fetching friends:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFriends()
  }, [user?.id])

  const handleAddFriend = async () => {
    if (!friendInput.trim() || !user?.id) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          friendName: friendInput.trim(),
        }),
      })

      if (response.ok) {
        const newFriend = await response.json()
        setFriends([...friends, newFriend])
        setFriendInput("")
      }
    } catch (error) {
      console.error("Error adding friend:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!user?.id) return

    try {
      await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      setFriends(friends.filter((f) => f._id !== friendId))
    } catch (error) {
      console.error("Error removing friend:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground">Friends</h2>
              <p className="text-muted-foreground mt-1">Manage your friends and connections</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Friend</CardTitle>
                    <CardDescription>Add a new friend by name</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Input
                        type="text"
                        placeholder="Friend's name"
                        value={friendInput}
                        onChange={(e) => setFriendInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddFriend()
                          }
                        }}
                      />
                      <Button onClick={handleAddFriend} disabled={isSaving} className="w-full">
                        {isSaving ? "Adding..." : "Add Friend"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {isLoading ? (
                  <div className="text-center text-muted-foreground">Loading friends...</div>
                ) : friends.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Friends Yet</CardTitle>
                      <CardDescription>Add friends to start tracking shared expenses</CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Friends</CardTitle>
                      <CardDescription>{friends.length} friend(s)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {friends.map((friend: any) => (
                          <div
                            key={friend._id}
                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{friend.name}</p>
                              <p className="text-sm text-muted-foreground">{friend.email || "No email"}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveFriend(friend._id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
