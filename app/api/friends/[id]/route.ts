import { connectToDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await request.json()

    if (!userId || !params.id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const friendsCollection = db.collection("friends")

    const result = await friendsCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting friend:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
