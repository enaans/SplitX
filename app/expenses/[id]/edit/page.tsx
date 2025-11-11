"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditExpensePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const expenseId = params.id as string

  const [expense, setExpense] = useState<any>(null)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [splitType, setSplitType] = useState<"equal" | "percentage" | "unequal">("equal")
  const [splitValues, setSplitValues] = useState<{ [key: string]: number }>({})
  const [members, setMembers] = useState<any[]>([])
  const [selectedMembers, setSelectedMembers] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchExpense = async () => {
      if (!expenseId) return
      try {
        const response = await fetch(`/api/expenses/${expenseId}`)
        const data = await response.json()
        setExpense(data)
        setDescription(data.description)
        setAmount(data.amount.toString())

        // Fetch group members
        const groupResponse = await fetch(`/api/groups/${data.groupId}`)
        const groupData = await groupResponse.json()
        setMembers(groupData.members)

        // Set selected members and split type from splits
        const membersList = data.splits.map((s: any) => ({
          id: s.userId,
          name: groupData.members.find((m: any) => (m._id || m.id) === s.userId)?.name || s.userId,
        }))
        setSelectedMembers(membersList)

        if (data.splits[0]?.splitType) {
          setSplitType(data.splits[0].splitType)
        }

        // Set split values
        const values: { [key: string]: number } = {}
        data.splits.forEach((split: any) => {
          if (split.splitType === "percentage") {
            values[split.userId] = split.percentage || 0
          } else if (split.splitType === "unequal") {
            values[split.userId] = split.amount
          }
        })
        setSplitValues(values)
      } catch (error) {
        console.error("Error fetching expense:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpense()
  }, [expenseId])

  const getPercentageTotal = () => {
    return selectedMembers.reduce((sum, member) => sum + (splitValues[member.id] || 0), 0)
  }

  const getUnequalTotal = () => {
    return selectedMembers.reduce((sum, member) => sum + (splitValues[member.id] || 0), 0)
  }

  const calculateSplits = () => {
    const numAmount = Number.parseFloat(amount)
    const splits = []

    if (splitType === "equal") {
      const splitAmount = numAmount / selectedMembers.length
      splits.push(
        ...selectedMembers.map((member) => ({
          userId: member.id,
          amount: splitAmount,
          splitType: "equal" as const,
        })),
      )
    } else if (splitType === "percentage") {
      splits.push(
        ...selectedMembers.map((member) => {
          const percentage = splitValues[member.id] || 0
          return {
            userId: member.id,
            amount: (numAmount * percentage) / 100,
            splitType: "percentage" as const,
            percentage,
          }
        }),
      )
    } else if (splitType === "unequal") {
      splits.push(
        ...selectedMembers.map((member) => ({
          userId: member.id,
          amount: splitValues[member.id] || 0,
          splitType: "unequal" as const,
        })),
      )
    }

    return splits
  }

  const isFormValid = () => {
    if (!description || !amount || selectedMembers.length === 0) return false

    const numAmount = Number.parseFloat(amount)
    if (numAmount <= 0) return false

    if (splitType === "percentage") {
      const total = getPercentageTotal()
      return total === 100
    }

    if (splitType === "unequal") {
      const total = getUnequalTotal()
      return Math.abs(total - numAmount) < 0.01
    }

    return true
  }

  const handleSave = async () => {
    if (!isFormValid()) {
      alert(splitType === "percentage" ? "Percentages must add up to 100%" : "Amounts must add up to the total expense")
      return
    }

    setIsSaving(true)
    try {
      const splits = calculateSplits()
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenseId,
          description,
          amount: Number.parseFloat(amount),
          splits,
          userId: user?.id,
        }),
      })

      if (response.ok) {
        router.push("/activity")
      }
    } catch (error) {
      console.error("Error saving expense:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || !expense) {
    return null
  }

  const percentageTotal = getPercentageTotal()
  const unequalTotal = getUnequalTotal()
  const numAmount = Number.parseFloat(amount) || 0

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Edit Expense</h2>

            <Card>
              <CardHeader>
                <CardTitle>Update Expense Details</CardTitle>
                <CardDescription>Modify the expense information and split</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  <Input
                    type="text"
                    placeholder="Amount (₹)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Split type</label>
                    <select
                      value={splitType}
                      onChange={(e) => setSplitType(e.target.value as "equal" | "percentage" | "unequal")}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="equal">Equal Split</option>
                      <option value="percentage">By Percentage</option>
                      <option value="unequal">Unequal Split (Custom Amounts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Split between</label>
                    <div className="space-y-3">
                      {selectedMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 p-2 border border-border rounded">
                          <span className="text-sm flex-1 font-medium">{member.name}</span>

                          {splitType === "equal" && (
                            <span className="text-sm text-muted-foreground">
                              ₹{(numAmount / selectedMembers.length).toFixed(2)}
                            </span>
                          )}

                          {splitType === "percentage" && (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                placeholder="%"
                                value={splitValues[member.id] || ""}
                                onChange={(e) =>
                                  setSplitValues({
                                    ...splitValues,
                                    [member.id]: Number.parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-16"
                                min="0"
                                max="100"
                                step="0.01"
                              />
                              <span className="text-xs text-muted-foreground">%</span>
                            </div>
                          )}

                          {splitType === "unequal" && (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                placeholder="₹"
                                value={splitValues[member.id] || ""}
                                onChange={(e) =>
                                  setSplitValues({
                                    ...splitValues,
                                    [member.id]: Number.parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-20"
                                min="0"
                                step="0.01"
                              />
                              <span className="text-xs text-muted-foreground">₹</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {splitType === "percentage" && (
                      <div className="mt-2 text-sm">
                        <span className={percentageTotal === 100 ? "text-green-600" : "text-orange-600"}>
                          Total: {percentageTotal.toFixed(2)}% {percentageTotal === 100 ? "✓" : "(must be 100%)"}
                        </span>
                      </div>
                    )}

                    {splitType === "unequal" && (
                      <div className="mt-2 text-sm">
                        <span
                          className={Math.abs(unequalTotal - numAmount) < 0.01 ? "text-green-600" : "text-orange-600"}
                        >
                          Total: ₹{unequalTotal.toFixed(2)}{" "}
                          {Math.abs(unequalTotal - numAmount) < 0.01 ? "✓" : `(must be ₹${numAmount.toFixed(2)})`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={isSaving || !isFormValid()} className="flex-1">
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => router.back()} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
