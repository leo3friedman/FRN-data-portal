import { useState, useCallback } from 'react'
import { pickupApiErrors } from './enums.js'
import samplePickups from '../assets/samplePickups.json'

export default function getPickups() {
  const [pickups, setPickups] = useState([])

  // set loading default to true to prevent flash, TODO: is there a better way?
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(undefined)

  const mockFetch = useCallback(() => {
    const mockLoadingTime = 500
    setLoading(true)
    setTimeout(() => {
      setPickups(samplePickups ?? [])
      setLoading(false)
    }, mockLoadingTime)
  })

  const realFetch = useCallback(async () => {
    try {
      setLoading(true)
      const expressUrl = import.meta.env.VITE_EXPRESS_URL
      const response = await fetch(`${expressUrl}/pickups`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          return setError(pickupApiErrors.NOT_SIGNED_IN)
        } else {
          return setError(pickupApiErrors.UNKNOWN_ERROR)
        }
      }

      const result = await response.json()
      setPickups(result)
    } catch (error) {
      setError(pickupApiErrors.UNKNOWN_ERROR)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    pickups,
    pickupsLoading: loading,
    pickupsError: error,
    fetchPickups: import.meta.env.VITE_MOCK_BACKEND ? mockFetch : realFetch,
  }
}
