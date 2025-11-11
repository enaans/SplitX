"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ActivityPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.id) return
      try {
        const response = await fetch(`/api/activity?userId=${user.id}`)
        const data = await response.json()
        setActivities(data)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [user?.id])

  const handleActivityClick = (activity: any) => {
    if (activity.expenseId && activity.groupId) {
      router.push(`/groups/${activity.groupId}?expenseId=${activity.expenseId}`)
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
              <h2 className="text-3xl font-bold text-foreground">Activity</h2>
              <p className="text-muted-foreground mt-1">Recent expenses and transactions</p>
            </div>

            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading activity...</div>
            ) : activities.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Activity Yet</CardTitle>
                  <CardDescription>Your expense activity will appear here</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-4">
                {activities.map((activity: any) => (
                  <Card
                    key={activity._id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{activity.description}</CardTitle>
                          <CardDescription className="capitalize">{activity.type.replace(/_/g, " ")}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
