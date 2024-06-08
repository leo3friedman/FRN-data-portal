import { useState, useCallback } from 'react'
import { pickupApiErrors } from './enums.js'

export function usePutPickup(pickupId) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(undefined)
  const [success, setSuccess] = useState(false)

  const mockSubmit = () => {
    const mockLoadingTime = 500
    setLoading(true)
    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
    }, mockLoadingTime)
  }

  const realSubmit = useCallback(async (pickup) => {
    try {
      const pickupList = Object.entries(pickup).map(([key, value]) => {
        return { "Form Label": key, "Value": value };
      })
      setLoading(true)
      const expressUrl = import.meta.env.VITE_EXPRESS_URL
      const response = await fetch(`${expressUrl}/api/pickups/${pickupId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pickupList),
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError(pickupApiErrors.NOT_SIGNED_IN)
        } else {
          setError(pickupApiErrors.UNKNOWN_ERROR)
        }
        return setSuccess(false)
      }
      return setSuccess(true)
    } catch (error) {
      console.log(error)
      setError(pickupApiErrors.UNKNOWN_ERROR)
      return setSuccess(false)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    submitLoading: loading,
    submitError: error,
    submitSuccess: success,
    submitPickup: import.meta.env.VITE_MOCK_BACKEND ? mockSubmit : realSubmit,
  }
}
