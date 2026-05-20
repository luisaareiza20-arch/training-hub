import { useState } from 'react'

const ACCENT = {
  'Pending':     'card-accent-pending',
  'In Progress': 'card-accent-progress',
  'Completed':   'card-accent-completed',
  'Blocked':     'card-accent-blocked',
}

const BADGE = {
  'Pending':     'badge badge-pending',
  'In Progress': 'badge badge-progress',
  'Completed':   'badge badge-completed',
  'Blocked':     'badge badge-blocked',
}

function formatDate(date) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TaskCard({ task, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const [blockNote, setBlockNote] = useState('')
  const [error, setError] = useState(null)

  const overdue = task.dueDate && task.status !== 'Completed' && new Date(task.dueDate) < new Date()
  const done    = task.status === 'Completed'

  async function act(status, note = '') {
    setLoading(true)
    setError(null)
    try {
      await onUpdate(task.id, status, note)
      if (status === 'Blocked') { setShowBlock(false); setBlockNote('') }
    } catch {
      setError('Update failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className={`card-accent ${ACCENT[task.status] || 'card-accent-pending'}`} />
      <div className="card-body">
        <div className="card-top">
          <div className={`card-name${done ? ' done' : ''}`}>{task.name}</div>
          <span className={BADGE[task.status] || 'badge badge-pending'}>{task.status}</span>
        </div>

        {task.description && (
          <div className="card-description">{task.description}</div>
        )}

        <div className="card-meta">
          {task.category && <span className="card-tag">{task.category}</span>}
          {task.dueDate && (
            <span className={`card-due${overdue ? ' overdue' : ''}`}>
              {overdue ? '⚠ Overdue' : '📅'} {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {!done && (
          <div className="card-actions">
            {task.status !== 'In Progress' && (
              <button className="btn btn-progress" disabled={loading} onClick={() => act('In Progress')}>
                {loading ? '···' : '→ In Progress'}
              </button>
            )}
            <button className="btn btn-complete" disabled={loading} onClick={() => act('Completed')}>
              {loading ? '···' : '✓ Complete'}
            </button>
            {!showBlock && task.status !== 'Blocked' && (
              <button className="btn btn-blocked" disabled={loading} onClick={() => setShowBlock(true)}>
                Blocked
              </button>
            )}
          </div>
        )}

        {showBlock && (
          <div className="blocked-wrap">
            <textarea
              className="blocked-textarea"
              placeholder="What's blocking you? Your trainer will be notified immediately."
              value={blockNote}
              onChange={e => setBlockNote(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-blocked" disabled={loading || !blockNote.trim()} onClick={() => act('Blocked', blockNote.trim())}>
                {loading ? '···' : 'Confirm blocked'}
              </button>
              <button className="btn" disabled={loading} onClick={() => { setShowBlock(false); setBlockNote('') }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {task.status === 'Blocked' && task.notes && (
          <div className="blocked-note">⚠ {task.notes}</div>
        )}

        {error && <div className="card-error">{error}</div>}
      </div>
    </div>
  )
}
