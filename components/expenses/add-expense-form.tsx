"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpenses } from "@/hooks/use-expenses"
import { X } from "lucide-react"

interface AddExpenseFormProps {
  groupId: string
  members: any[]
  userId: string
  onSuccess?: () => void
}

export function AddExpenseForm({ groupId, members, userId, onSuccess }: AddExpenseFormProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [paidBy, setPaidBy] = useState(userId)
  const [selectedMembers, setSelectedMembers] = useState<{ id: string; name: string }[]>(
    members.map((m) => ({ id: m._id || m.id, name: m.name })),
  )
  const [splitType, setSplitType] = useState<"equal" | "percentage" | "unequal">("equal")
  const [splitValues, setSplitValues] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(false)
  const { addExpense } = useExpenses(groupId)

  const handleToggleFriend = (member: { id: string; name: string }) => {
    const isSelected = selectedMembers.some((m) => m.id === member.id)
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter((m) => m.id !== member.id))
    } else {
      setSelectedMembers([...selectedMembers, member])
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid()) {
      alert(splitType === "percentage" ? "Percentages must add up to 100%" : "Amounts must add up to the total expense")
      return
    }

    setLoading(true)

    try {
      const splits = calculateSplits()
      await addExpense(description, Number.parseFloat(amount), paidBy, splits, userId)

      setDescription("")
      setAmount("")
      setPaidBy(userId)
      setSelectedMembers(members.map((m) => ({ id: m._id || m.id, name: m.name })))
      setSplitType("equal")
      setSplitValues({})
      onSuccess?.()
    } catch (error) {
      console.error("Error adding expense:", error)
    } finally {
      setLoading(false)
    }
  }

  const percentageTotal = getPercentageTotal()
  const unequalTotal = getUnequalTotal()
  const numAmount = Number.parseFloat(amount) || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
        <CardDescription>Record a new expense for this group</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Description (e.g., Dinner)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Input
            type="text"
            placeholder="Amount (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            required
          />

          <div>
            <label className="text-sm font-medium mb-2 block">Paid by</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              {selectedMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

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

            {members.length > 0 && (
              <div className="mb-3 p-3 border border-border rounded-md bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">Group members:</p>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => {
                    const memberId = member._id || member.id
                    const isSelected = selectedMembers.some((m) => m.id === memberId)
                    return (
                      <button
                        key={memberId}
                        type="button"
                        onClick={() => handleToggleFriend({ id: memberId, name: member.name })}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {member.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {members.length === 0 && (
              <div className="mb-3 p-3 border border-border rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  No members in this group. Add members when creating the group.
                </p>
              </div>
            )}

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

                  <button
                    type="button"
                    onClick={() => handleToggleFriend(member)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X size={16} />
                  </button>
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
                <span className={Math.abs(unequalTotal - numAmount) < 0.01 ? "text-green-600" : "text-orange-600"}>
                  Total: ₹{unequalTotal.toFixed(2)}{" "}
                  {Math.abs(unequalTotal - numAmount) < 0.01 ? "✓" : `(must be ₹${numAmount.toFixed(2)})`}
                </span>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || !isFormValid()}>
            {loading ? "Adding..." : "Add Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
