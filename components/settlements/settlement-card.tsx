"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SettlementCardProps {
  from: string
  to: string
  amount: number
  userMap: { [key: string]: string }
  groupId?: string
}

export function SettlementCard({ from, to, amount, userMap, groupId }: SettlementCardProps) {
  const router = useRouter()
  const [isMarking, setIsMarking] = useState(false)

  const handleMarkPaid = async () => {
    setIsMarking(true)
    try {
      const response = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, amount, groupId }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error marking settlement as paid:", error)
    } finally {
      setIsMarking(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-secondary/50 transition-colors">
      <div className="flex-1">
        <p className="font-medium">
          <span className="text-accent">{userMap[from] || `User ${from.slice(0, 8)}`}</span>
          <span className="text-muted-foreground mx-2">owes</span>
          <span className="text-primary">{userMap[to] || `User ${to.slice(0, 8)}`}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">Settlement amount</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-accent">₹{amount.toFixed(2)}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 bg-transparent"
          onClick={handleMarkPaid}
          disabled={isMarking}
        >
          {isMarking ? "Marking..." : "Mark Paid"}
        </Button>
      </div>
    </div>
  )
}
