import { useState, useCallback } from 'react'
import { pickupApiErrors } from './enums.js'

export function useGetNewPickup() {
  const [pickup, setPickup] = useState([])

  // set loading default to true to prevent flash, TODO: is there a better way?
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(undefined)

  const fetchPickup = useCallback(async () => {
    try {
      setLoading(true)
      const expressUrl = import.meta.env.VITE_EXPRESS_URL
      const URL = `${expressUrl}/api/pickups/new`
      const response = await fetch(URL, {
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
      setPickup(result)
    } catch (error) {
      console.log(error)
      return setError(pickupApiErrors.UNKNOWN_ERROR)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    pickup,
    pickupLoading: loading,
    pickupError: error,
    fetchPickup,
  }
}
