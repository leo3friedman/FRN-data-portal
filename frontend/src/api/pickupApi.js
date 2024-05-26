import { useState, useCallback } from 'react'

const pickupApiErrors = {
  NOT_SIGNED_IN: new Error('User is not signed in!'),
  UNKNOWN_ERROR: new Error('Unknown Error'),
}

function usePickups() {
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
          setError(pickupApiErrors.NOT_SIGNED_IN)
          return
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

export { pickupApiErrors, usePickups }
