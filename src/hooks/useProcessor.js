import { useState, useEffect, useCallback } from 'react'
import { fetchProcessor, updateTaskStatus } from '../api/knack'

const N8N_WEBHOOK = 'https://n8n.srv1118356.hstgr.cloud/webhook/94f6cd2d-8102-439f-827b-34a292099dc1'

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

      if (status === 'Blocked') {
        const task = data.completions.find(c => c.id === taskCompletionId)
        const daysIn = data.startDate
          ? Math.max(0, Math.floor((Date.now() - data.startDate.getTime()) / 86400000))
          : 0
        fetch(N8N_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            processor_name: data.fullName,
            processor_email: data.email || 'luisa.areiza20@gmail.com',
            task_name: task?.name || 'Unknown task',
            block_reason: note || 'No reason provided',
            days_in_program: daysIn,
            trainer_email: data.trainer?.email || 'luisa.areiza20@gmail.com',
          }),
        }).catch(() => {})
      }
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
