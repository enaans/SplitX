import { connectToDatabase } from "@/lib/mongodb"
import { signToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await usersCollection.insertOne({
      email,
      name,
      password: hashedPassword,
      createdAt: new Date(),
    })

    const token = await signToken({
      userId: result.insertedId.toString(),
      email,
      name,
    })

    return NextResponse.json({ token, user: { id: result.insertedId, email, name } }, { status: 201 })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
