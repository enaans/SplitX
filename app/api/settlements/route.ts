import { connectToDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const groupId = request.nextUrl.searchParams.get("groupId")

    if (!groupId) {
      return NextResponse.json({ error: "groupId is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const expensesCollection = db.collection("expenses")

    const expenses = await expensesCollection.find({ groupId }).toArray()

    // Calculate balances
    const balances: { [key: string]: number } = {}

    expenses.forEach((expense) => {
      // Add amount to paidBy
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount

      // Subtract split amounts from each person
      expense.splits.forEach((split: any) => {
        balances[split.userId] = (balances[split.userId] || 0) - split.amount
      })
    })

    // Generate settlements
    const settlements = []
    const debtors = Object.entries(balances)
      .filter(([_, balance]) => balance < 0)
      .map(([userId, balance]) => ({ userId, balance: Math.abs(balance) }))

    const creditors = Object.entries(balances)
      .filter(([_, balance]) => balance > 0)
      .map(([userId, balance]) => ({ userId, balance }))

    for (const debtor of debtors) {
      for (const creditor of creditors) {
        if (debtor.balance > 0 && creditor.balance > 0) {
          const amount = Math.min(debtor.balance, creditor.balance)
          settlements.push({
            from: debtor.userId,
            to: creditor.userId,
            amount,
          })
          debtor.balance -= amount
          creditor.balance -= amount
        }
      }
    }

    return NextResponse.json(settlements)
  } catch (error) {
    console.error("Error calculating settlements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
