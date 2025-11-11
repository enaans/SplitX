import { connectToDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const groupsCollection = db.collection("groups")
    const usersCollection = db.collection("users")

    const group = await groupsCollection.findOne({ _id: new ObjectId(params.id) })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Fetch member details
    const members = await usersCollection
      .find({ _id: { $in: group.members.map((id: string) => new ObjectId(id)) } })
      .toArray()

    return NextResponse.json({ ...group, members })
  } catch (error) {
    console.error("Error fetching group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
