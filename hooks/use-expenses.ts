"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useExpenses(groupId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(groupId ? `/api/expenses?groupId=${groupId}` : null, fetcher)

  const addExpense = async (description: string, amount: number, paidBy: string, splits: any[], createdBy: string) => {
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        description,
        amount,
        paidBy,
        splits,
        createdBy,
      }),
    })

    if (!response.ok) throw new Error("Failed to add expense")

    mutate()
  }

  return {
    expenses: data || [],
    isLoading,
    error,
    addExpense,
    mutate,
  }
}
