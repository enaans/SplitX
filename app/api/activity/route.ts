import { connectToDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, type, description, expenseId, groupId } = await request.json()

    if (!userId || !type || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const activityCollection = db.collection("activity")

    const result = await activityCollection.insertOne({
      userId,
      type,
      description,
      expenseId,
      groupId,
      createdAt: new Date(),
    })

    return NextResponse.json({ activityId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const activityCollection = db.collection("activity")

    const activities = await activityCollection.find({ userId }).sort({ createdAt: -1 }).limit(50).toArray()

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
