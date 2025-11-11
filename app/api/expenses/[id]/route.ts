import { connectToDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const expensesCollection = db.collection("expenses")

    const expense = await expensesCollection.findOne({ _id: new ObjectId(params.id) })

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error("Error fetching expense:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { description, amount, splits, userId } = await request.json()

    const { db } = await connectToDatabase()
    const expensesCollection = db.collection("expenses")
    const activityCollection = db.collection("activity")

    // Get the expense to find groupId
    const expense = await expensesCollection.findOne({ _id: new ObjectId(params.id) })
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    // Update the expense
    const result = await expensesCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          description,
          amount: Number(amount),
          splits,
          updatedAt: new Date(),
        },
      },
    )

    // Create activity notification
    await activityCollection.insertOne({
      userId,
      type: "expense_edited",
      description: `Edited expense: ${description}`,
      expenseId: params.id,
      groupId: expense.groupId,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount })
  } catch (error) {
    console.error("Error updating expense:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await request.json()

    const { db } = await connectToDatabase()
    const expensesCollection = db.collection("expenses")
    const activityCollection = db.collection("activity")

    // Get the expense to find groupId and description
    const expense = await expensesCollection.findOne({ _id: new ObjectId(params.id) })
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    await expensesCollection.deleteOne({ _id: new ObjectId(params.id) })

    await activityCollection.insertOne({
      userId,
      type: "expense_deleted",
      description: `Deleted expense: ${expense.description}`,
      expenseId: params.id,
      groupId: expense.groupId,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
