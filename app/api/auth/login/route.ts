import { connectToDatabase } from "@/lib/mongodb"
import { signToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    const user = await usersCollection.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    return NextResponse.json({ token, user: { id: user._id, email: user.email, name: user.name } })
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
