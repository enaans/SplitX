import { connectToDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { groupId, description, amount, paidBy, splits, createdBy } = await request.json()

    if (!groupId || !description || !amount || !paidBy || !splits) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const expensesCollection = db.collection("expenses")
    const activityCollection = db.collection("activity")

    const result = await expensesCollection.insertOne({
      groupId,
      description,
      amount,
      paidBy,
      splits,
      createdAt: new Date(),
      createdBy,
    })

    await activityCollection.insertOne({
      userId: createdBy,
      type: "expense_added",
      description: `Added expense: ${description} (₹${amount})`,
      expenseId: result.insertedId.toString(),
      groupId,
      createdAt: new Date(),
    })

    return NextResponse.json({ expenseId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const groupId = request.nextUrl.searchParams.get("groupId")

    if (!groupId) {
      return NextResponse.json({ error: "groupId is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const expensesCollection = db.collection("expenses")

    const expenses = await expensesCollection.find({ groupId }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { expenseId, description, amount, splits, userId } = await request.json()

    if (!expenseId || !description || !amount || !splits) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const expensesCollection = db.collection("expenses")
    const activityCollection = db.collection("activity")

    await expensesCollection.updateOne(
      { _id: new ObjectId(expenseId) },
      {
        $set: {
          description,
          amount,
          splits,
          updatedAt: new Date(),
          isEdited: true,
        },
      },
    )

    // Create activity notification for expense edited
    await activityCollection.insertOne({
      userId,
      type: "expense_edited",
      description: `Edited expense: ${description} (₹${amount})`,
      expenseId,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error updating expense:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
