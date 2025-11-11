"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useSettlements(groupId: string | null) {
  const { data, error, isLoading } = useSWR(groupId ? `/api/settlements?groupId=${groupId}` : null, fetcher)

  return {
    settlements: data || [],
    isLoading,
    error,
  }
}
