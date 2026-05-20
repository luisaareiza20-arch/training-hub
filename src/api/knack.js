const APP_ID = import.meta.env.VITE_KNACK_APP_ID
const API_KEY = import.meta.env.VITE_KNACK_API_KEY
const BASE = 'https://api.knack.com/v1'

const headers = {
  'X-Knack-Application-Id': APP_ID,
  'X-Knack-REST-API-Key': API_KEY,
  'Content-Type': 'application/json',
}

function clean(text) {
  return text?.replace(/<[^>]*>/g, '').replace(/\t/g, '').trim() || ''
}

export async function fetchProcessor(processorId) {
  // 1. Processor record
  const pRes = await fetch(`${BASE}/objects/object_4/records/${processorId}`, { headers })
  if (!pRes.ok) throw new Error('Processor not found. Check the link.')
  const p = await pRes.json()

  // 2. Trainer record
  const trainerId = p.field_56_raw?.[0]?.id
  let trainer = null
  if (trainerId) {
    const tRes = await fetch(`${BASE}/objects/object_3/records/${trainerId}`, { headers })
    if (tRes.ok) {
      const t = await tRes.json()
      trainer = { id: t.id, fullName: t.field_23, email: t.field_51_raw?.email }
    }
  }

  // 3. All task completions for this processor
  const filter = encodeURIComponent(JSON.stringify([{ field: 'field_63', operator: 'is', value: processorId }]))
  const cRes = await fetch(`${BASE}/objects/object_6/records?filters=${filter}&rows_per_page=100`, { headers })
  if (!cRes.ok) throw new Error('Failed to load tasks.')
  const cData = await cRes.json()

  // 4. All onboarding task definitions
  const dRes = await fetch(`${BASE}/objects/object_5/records?rows_per_page=100`, { headers })
  if (!dRes.ok) throw new Error('Failed to load task definitions.')
  const dData = await dRes.json()

  // Map task ID → task definition
  const taskMap = {}
  dData.records.forEach(t => {
    taskMap[t.id] = {
      id: t.id,
      name: clean(t.field_37),
      category: t.field_59,
      dueDay: t.field_60,
      description: clean(t.field_61),
      priority: t.field_62,
    }
  })

  const startDate = p.field_55_raw?.iso_timestamp ? new Date(p.field_55_raw.iso_timestamp) : null

  const completions = cData.records.map(c => {
    const taskId = c.field_64_raw?.[0]?.id
    const task = taskMap[taskId] || {}
    const dueDate = startDate && task.dueDay != null
      ? new Date(startDate.getTime() + task.dueDay * 86400000)
      : null

    return {
      id: c.id,
      taskId,
      name: task.name || clean(c.field_64_raw?.[0]?.identifier),
      category: task.category || 'Other',
      dueDay: task.dueDay,
      description: task.description,
      priority: task.priority,
      status: c.field_65 || 'Pending',
      dueDate,
      completedDate: c.field_67_raw?.date || null,
      notes: c.field_68 || '',
    }
  })

  return {
    id: p.id,
    fullName: p.field_30,
    email: p.field_53_raw?.email,
    startDate,
    currentStage: p.field_57,
    trainer,
    completions,
  }
}

export async function findTrainerByEmail(email) {
  const filter = encodeURIComponent(JSON.stringify([{ field: 'field_51', operator: 'is', value: email }]))
  const res = await fetch(`${BASE}/objects/object_3/records?filters=${filter}`, { headers })
  if (!res.ok) throw new Error('Connection error.')
  const data = await res.json()
  if (!data.records?.length) return null
  return data.records[0].id
}

export async function fetchTrainerDashboard(trainerId) {
  const tRes = await fetch(`${BASE}/objects/object_3/records/${trainerId}`, { headers })
  if (!tRes.ok) throw new Error('Trainer not found.')
  const t = await tRes.json()

  const trainer = { id: trainerId, fullName: t.field_23, email: t.field_51_raw?.email || '' }

  const filter = encodeURIComponent(JSON.stringify([{ field: 'field_56', operator: 'is', value: trainerId }]))
  const pRes = await fetch(`${BASE}/objects/object_4/records?filters=${filter}&rows_per_page=100`, { headers })
  if (!pRes.ok) throw new Error('Failed to load trainees.')
  const pData = await pRes.json()

  const processors = await Promise.all((pData.records || []).map(async proc => {
    const startDate = proc.field_55_raw?.iso_timestamp ? new Date(proc.field_55_raw.iso_timestamp) : null
    const daysIn = startDate ? Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 86400000)) : 0

    const cf = encodeURIComponent(JSON.stringify([{ field: 'field_63', operator: 'is', value: proc.id }]))
    const cRes = await fetch(`${BASE}/objects/object_6/records?filters=${cf}&rows_per_page=100`, { headers })
    const cData = cRes.ok ? await cRes.json() : { records: [] }

    const completions = (cData.records || []).map(c => ({
      id: c.id,
      taskName: clean(c.field_64_raw?.[0]?.identifier || ''),
      status: c.field_65 || 'Pending',
      notes: c.field_68 || '',
    }))

    const total     = completions.length
    const completed = completions.filter(c => c.status === 'Completed').length
    const inProg    = completions.filter(c => c.status === 'In Progress').length
    const blocked   = completions.filter(c => c.status === 'Blocked').length
    const pending   = completions.filter(c => c.status === 'Pending').length
    const pct       = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      id: proc.id,
      fullName: proc.field_30,
      email: proc.field_53_raw?.email || '',
      startDate,
      daysIn,
      notes: proc.field_58 || '',
      completions,
      stats: { total, completed, inProg, blocked, pending, pct },
    }
  }))

  return { trainer, processors }
}

export async function updateProcessorNotes(processorId, notes) {
  const res = await fetch(`${BASE}/objects/object_4/records/${processorId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ field_58: notes }),
  })
  if (!res.ok) throw new Error('Failed to save note.')
  return res.json()
}

export async function updateTaskStatus(taskCompletionId, status, note = '') {
  const body = { field_65: status }

  if (status === 'Completed') {
    const d = new Date()
    body.field_67 = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
  }

  if (status === 'Blocked' && note) {
    body.field_68 = note
  }

  const res = await fetch(`${BASE}/objects/object_6/records/${taskCompletionId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error('Failed to update task. Please try again.')
  return res.json()
}
