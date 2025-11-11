"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useGroups } from "@/hooks/use-groups"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { groups, isLoading: groupsLoading } = useGroups(user?.id || null)
  const router = useRouter()
  const [allUsers, setAllUsers] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        const data = await response.json()
        setAllUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [])

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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                <p className="text-muted-foreground mt-1">Welcome back, {user.name}!</p>
              </div>
              <Link href="/groups/new">
                <Button className="bg-primary hover:bg-primary/90">Create Group</Button>
              </Link>
            </div>

            {groupsLoading ? (
              <div className="text-center text-muted-foreground">Loading groups...</div>
            ) : groups.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Groups Yet</CardTitle>
                  <CardDescription>Create a group to start splitting expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/groups/new">
                    <Button className="bg-primary hover:bg-primary/90">Create Your First Group</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group: any) => (
                  <Link key={group._id} href={`/groups/${group._id}`}>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.members.length} members</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(group.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
