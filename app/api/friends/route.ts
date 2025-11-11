import { connectToDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { userId, friendId, friendName } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const friendsCollection = db.collection("friends")

    if (friendName) {
      const newFriend = {
        userId,
        name: friendName,
        createdAt: new Date(),
      }
      const result = await friendsCollection.insertOne(newFriend)
      return NextResponse.json({ _id: result.insertedId, ...newFriend }, { status: 201 })
    }

    if (!friendId) {
      return NextResponse.json({ error: "Missing friendId or friendName" }, { status: 400 })
    }

    const usersCollection = db.collection("users")

    // Add friend to both users
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $addToSet: { friends: friendId } })

    await usersCollection.updateOne({ _id: new ObjectId(friendId) }, { $addToSet: { friends: userId } })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error adding friend:", error)
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
    const friendsCollection = db.collection("friends")

    const friends = await friendsCollection.find({ userId }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(friends)
  } catch (error) {
    console.error("Error fetching friends:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
