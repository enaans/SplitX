import { connectToDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, members, createdBy } = await request.json()

    if (!name || !members || !createdBy) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const groupsCollection = db.collection("groups")

    const result = await groupsCollection.insertOne({
      name,
      members: members.map((m: any) => ({
        id: m.id,
        name: m.name,
      })),
      createdBy,
      createdAt: new Date(),
    })

    return NextResponse.json({ groupId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating group:", error)
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
    const groupsCollection = db.collection("groups")

    const groups = await groupsCollection
      .find({
        $or: [{ "members.id": userId }, { createdBy: userId }],
      })
      .toArray()

    return NextResponse.json(groups)
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
