import { useState, useCallback } from 'react'
import { pickupApiErrors } from './enums.js'

export default function getPickups() {
  const [pickups, setPickups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(undefined)

  const fetchPickups = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/pickups', {
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
    fetchPickups,
  }
}
