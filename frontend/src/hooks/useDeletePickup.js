import { useState, useCallback } from 'react'
import { pickupApiErrors } from './enums.js'

/**
 * @typedef {Object} DeleteStatus
 * @property {boolean} deleteLoading
 * @property {string|undefined} error
 * @property {boolean} success
 */

/**
 *
 * @param {String} pickupId
 * @returns {DeleteStatus}
 */
export function useDeletePickup(pickupId) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(undefined)
  const [success, setSuccess] = useState(false)

  const mockDelete = useCallback(() => {
    const mockLoadingTime = 500
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, mockLoadingTime)
  }, [])

  const realDelete = useCallback(async () => {
    try {
      setLoading(true)
      const expressUrl = import.meta.env.VITE_EXPRESS_URL
      const URL = `${expressUrl}/api/pickups/delete/${pickupId}`
      const response = await fetch(URL, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        if (response.status === 401) {
          return setError(pickupApiErrors.NOT_SIGNED_IN)
        } else {
          return setError(pickupApiErrors.UNKNOWN_ERROR)
        }
      }
      setSuccess(true)
    } catch (error) {
      console.log(error)
      return setError(pickupApiErrors.UNKNOWN_ERROR)
    } finally {
      setLoading(false)
    }
  }, [pickupId])

  return {
    deleteSuccess: success,
    deleteLoading: loading,
    deleteError: error,
    deletePickup: import.meta.env.VITE_MOCK_BACKEND ? mockDelete : realDelete,
  }
}
