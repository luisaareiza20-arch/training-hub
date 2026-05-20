import { useState, useEffect, useCallback } from 'react'
import { fetchProcessor, updateTaskStatus } from '../api/knack'

export function useProcessor(processorId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!processorId) {
      setError('No processor ID in the URL.')
      setLoading(false)
      return
    }
    fetchProcessor(processorId)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [processorId])

  const updateTask = useCallback(async (taskCompletionId, status, note = '') => {
    const original = data?.completions.find(c => c.id === taskCompletionId)

    // Optimistic update
    setData(prev => ({
      ...prev,
      completions: prev.completions.map(c =>
        c.id === taskCompletionId ? { ...c, status, notes: note || c.notes } : c
      ),
    }))

    try {
      await updateTaskStatus(taskCompletionId, status, note)
    } catch (err) {
      // Revert on failure
      if (original) {
        setData(prev => ({
          ...prev,
          completions: prev.completions.map(c =>
            c.id === taskCompletionId ? original : c
          ),
        }))
      }
      throw err
    }
  }, [data])

  return { data, loading, error, updateTask }
}
