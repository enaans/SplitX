"use client"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useGroups(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `/api/groups?userId=${userId}` : null, fetcher)

  const createGroup = async (name: string, members: string[]) => {
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, members, createdBy: userId }),
    })

    if (!response.ok) throw new Error("Failed to create group")

    const newGroup = await response.json()
    mutate()
    return newGroup
  }

  return {
    groups: data || [],
    isLoading,
    error,
    createGroup,
    mutate,
  }
}
