import { useState, useEffect } from 'react'
import { fetchTrainerDashboard } from '../api/knack'

export function useTrainer(trainerId) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!trainerId) return
    setLoading(true)
    fetchTrainerDashboard(trainerId)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [trainerId])

  return { data, loading, error }
}
