import { useState, useCallback } from 'react'
import { pickupApiErrors } from './enums.js'

export default function getPickup(id) {
  const [pickup, setPickup] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(undefined)

  const fetchPickup = useCallback(async () => {
    try {
      setLoading(true)
      const URL = `http://localhost:3000/pickups/${id}`
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
