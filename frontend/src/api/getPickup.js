import { useState, useCallback } from 'react'
import { pickupApiErrors } from './enums.js'
import samplePickups from '../assets/samplePickups.json'

export default function getPickup(id) {
  const [pickup, setPickup] = useState({})

  // set loading default to true to prevent flash, TODO: is there a better way?
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(undefined)

  const mockFetch = useCallback(() => {
    const mockLoadingTime = 500
    setLoading(true)
    setTimeout(() => {
      const found = Array.from(samplePickups).find(
        (sample) => Number(sample.id) === Number(id)
      )
      setPickup(found)
      setLoading(false)
    }, mockLoadingTime)
  })

  const realFetch = useCallback(async () => {
    try {
      setLoading(true)
      const expressUrl = import.meta.env.VITE_EXPRESS_URL
      const URL = `${expressUrl}/api/pickups/${id}`
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
    fetchPickup: import.meta.env.VITE_MOCK_BACKEND ? mockFetch : realFetch,
  }
}
