"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettlementCard } from "./settlement-card"
import { useSettlements } from "@/hooks/use-settlements"

interface SettlementsListProps {
  groupId: string
  userMap: { [key: string]: string }
}

export function SettlementsList({ groupId, userMap }: SettlementsListProps) {
  const { settlements, isLoading } = useSettlements(groupId)

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Calculating settlements...</div>
  }

  if (settlements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settlements</CardTitle>
          <CardDescription>No settlements needed</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Everyone is settled up!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlements</CardTitle>
        <CardDescription>Who owes whom</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {settlements.map((settlement: any, index: number) => (
            <SettlementCard
              key={index}
              from={settlement.from}
              to={settlement.to}
              amount={settlement.amount}
              userMap={userMap}
              groupId={groupId}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
