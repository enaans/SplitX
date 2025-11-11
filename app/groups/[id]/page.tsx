"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useGroups } from "@/hooks/use-groups"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { AddExpenseForm } from "@/components/expenses/add-expense-form"
import { ExpenseList } from "@/components/expenses/expense-list"
import { SettlementsList } from "@/components/settlements/settlements-list"
import { GroupBalances } from "@/components/settlements/group-balances"
import { BalanceSummary } from "@/components/settlements/balance-summary"
import { useExpenses } from "@/hooks/use-expenses"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GroupPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string
  const { groups } = useGroups(user?.id || null)
  const { expenses } = useExpenses(groupId)
  const [currentGroup, setCurrentGroup] = useState<any>(null)
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({})
  const [balances, setBalances] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    const group = groups.find((g: any) => g._id === groupId)
    setCurrentGroup(group)
  }, [groups, groupId])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [usersResponse, friendsResponse] = await Promise.all([fetch("/api/users"), fetch("/api/friends")])
        const users = await usersResponse.json()
        const friends = await friendsResponse.json()

        const map: { [key: string]: string } = {}

        users.forEach((u: any) => {
          map[u._id] = u.name
        })

        friends.forEach((f: any) => {
          map[f._id] = f.name
        })

        if (user && !map[user.id]) {
          map[user.id] = user.name
        }
        setUserMap(map)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    if (user) {
      fetchUsers()
    }
  }, [user])

  useEffect(() => {
    // Calculate balances
    const newBalances: { [key: string]: number } = {}

    expenses.forEach((expense: any) => {
      newBalances[expense.paidBy] = (newBalances[expense.paidBy] || 0) + expense.amount

      expense.splits.forEach((split: any) => {
        newBalances[split.userId] = (newBalances[split.userId] || 0) - split.amount
      })
    })

    setBalances(newBalances)
  }, [expenses])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || !currentGroup) {
    return null
  }

  const groupMembers = currentGroup.members.map((member: any) => ({
    _id: typeof member === "string" ? member : member.id,
    name: typeof member === "string" ? userMap[member] || `User ${member.slice(0, 8)}` : member.name,
  }))

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-2">{currentGroup.name}</h2>
            <p className="text-muted-foreground mb-8">{groupMembers.length} members</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Tabs defaultValue="expenses" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    <TabsTrigger value="settlements">Settlements</TabsTrigger>
                  </TabsList>

                  <TabsContent value="expenses" className="space-y-6">
                    <AddExpenseForm groupId={groupId} members={groupMembers} userId={user.id} />
                    <ExpenseList groupId={groupId} userMap={userMap} />
                  </TabsContent>

                  <TabsContent value="settlements" className="space-y-6">
                    <SettlementsList groupId={groupId} userMap={userMap} />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-6">
                <BalanceSummary balances={balances} userMap={userMap} currentUserId={user.id} />
                <GroupBalances groupId={groupId} members={groupMembers} userMap={userMap} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
