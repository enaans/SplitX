"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { CreateGroupForm } from "@/components/groups/create-group-form"

export default function NewGroupPage() {
  const { user, loading } = useAuth()
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
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Create New Group</h2>
            <CreateGroupForm userId={user.id} allUsers={allUsers} onSuccess={() => router.push("/dashboard")} />
          </div>
        </main>
      </div>
    </div>
  )
}
