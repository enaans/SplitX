"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpenses } from "@/hooks/use-expenses"

interface GroupBalancesProps {
  groupId: string
  members: any[]
  userMap: { [key: string]: string }
}

export function GroupBalances({ groupId, members, userMap }: GroupBalancesProps) {
  const { expenses } = useExpenses(groupId)

  // Calculate balances
  const balances: { [key: string]: number } = {}

  expenses.forEach((expense: any) => {
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount

    expense.splits.forEach((split: any) => {
      balances[split.userId] = (balances[split.userId] || 0) - split.amount
    })
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Balances</CardTitle>
        <CardDescription>Balance for each member</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => {
            const balance = balances[member._id] || 0
            return (
              <div key={member._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span className="font-medium">{member.name}</span>
                <span
                  className={`font-semibold ${balance > 0 ? "text-accent" : balance < 0 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {balance > 0 ? "+" : ""}₹{balance.toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
