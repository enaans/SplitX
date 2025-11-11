"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Spitify</h1>
          <p className="text-sm text-muted-foreground">Split expenses with friends</p>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="bg-transparent">
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
