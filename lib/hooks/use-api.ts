"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(apiCall: () => Promise<any>, dependencies: any[] = []): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        const response = await apiCall()
        if (!response.success) {
          throw new Error(response.error || "API call failed")
        }

        if (isMounted) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  return state
}

// Specific hooks for common operations
export function useGrantMatches(profile: any, goal: string) {
  return useApi(() => api.sme.matchGrants(profile, goal), [profile, goal])
}

export function useProfile() {
  return useApi(() => api.sme.getProfile())
}

export function useApplications() {
  return useApi(() => api.applications.getAll())
}

export function useFunderGrants() {
  return useApi(() => api.funder.getGrants())
}

export function useApiMutation<T, P>(apiCall: (params: P) => Promise<any>) {
  const [state, setState] = useState<UseApiState<T> & { mutate: (params: P) => Promise<void> }>({
    data: null,
    loading: false,
    error: null,
    mutate: async (params: P) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        const response = await apiCall(params)
        if (!response.success) {
          throw new Error(response.error || "API call failed")
        }

        setState((prev) => ({
          ...prev,
          data: response.data,
          loading: false,
          error: null,
        }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }))
      }
    },
  })

  return state
}
