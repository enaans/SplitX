import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  name: string
  password: string
  friends?: string[]
  createdAt: Date
}

export interface Expense {
  _id?: ObjectId
  groupId: string
  description: string
  amount: number
  paidBy: string
  splits: {
    userId: string
    amount: number
    splitType?: "equal" | "percentage" | "unequal"
    percentage?: number
  }[]
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  isEdited?: boolean
}

export interface Group {
  _id?: ObjectId
  name: string
  members: string[]
  createdBy: string
  createdAt: Date
}

export interface Settlement {
  _id?: ObjectId
  from: string
  to: string
  amount: number
  groupId: string
  settled: boolean
  createdAt: Date
}

export interface Activity {
  _id?: ObjectId
  userId: string
  type: "expense_added" | "expense_edited" | "expense_settled"
  description: string
  expenseId?: string
  groupId?: string
  createdAt: Date
}
