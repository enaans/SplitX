"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BalanceSummaryProps {
  balances: { [key: string]: number }
  userMap: { [key: string]: string }
  currentUserId: string
}

export function BalanceSummary({ balances, userMap, currentUserId }: BalanceSummaryProps) {
  const userBalance = balances[currentUserId] || 0

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <CardTitle>Your Balance</CardTitle>
        <CardDescription>How much you owe or are owed</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          {userBalance > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">You are owed</p>
              <p className="text-4xl font-bold text-accent">₹{userBalance.toFixed(2)}</p>
            </div>
          ) : userBalance < 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">You owe</p>
              <p className="text-4xl font-bold text-destructive">₹{Math.abs(userBalance).toFixed(2)}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2">You are all settled up</p>
              <p className="text-4xl font-bold text-primary">₹0.00</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
