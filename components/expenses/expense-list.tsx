"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useExpenses } from "@/hooks/use-expenses"

interface ExpenseListProps {
  groupId: string
  userMap: { [key: string]: string }
}

export function ExpenseList({ groupId, userMap }: ExpenseListProps) {
  const { expenses, isLoading } = useExpenses(groupId)
  const router = useRouter()
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading expenses...</div>
  }

  if (expenses.length === 0) {
    return <div className="text-center text-muted-foreground">No expenses yet</div>
  }

  const handleDelete = async () => {
    if (!selectedExpense) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/expenses/${selectedExpense._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: localStorage.getItem("userId") }),
      })

      if (response.ok) {
        setSelectedExpense(null)
        // Refresh the page to show updated expenses
        router.refresh()
      } else {
        alert("Failed to delete expense")
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
      alert("Error deleting expense")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
        <CardDescription>All expenses in this group</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.map((expense: any) => (
            <div
              key={expense._id}
              onClick={() => setSelectedExpense(expense)}
              className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-sm text-muted-foreground">
                  {userMap[expense.paidBy]} paid ₹{expense.amount.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">₹{expense.amount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{new Date(expense.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedExpense && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{selectedExpense.description}</CardTitle>
                <CardDescription>Expense Details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-primary">₹{selectedExpense.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid by</p>
                  <p className="font-medium">{userMap[selectedExpense.paidBy]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Split Details</p>
                  <div className="space-y-1">
                    {selectedExpense.splits.map((split: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{userMap[split.userId]}</span>
                        <span className="font-medium">₹{split.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => router.push(`/expenses/${selectedExpense._id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedExpense(null)}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
