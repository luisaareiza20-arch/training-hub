import { useState } from 'react'
import { useTrainer } from '../hooks/useTrainer'
import { updateProcessorNotes } from '../api/knack'

function initials(name) {
  return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

function LoadingScreen() {
  return (
    <div className="state-screen">
      <div className="state-card">
        <div className="spinner" />
        <div className="state-title">Loading your dashboard...</div>
        <div className="state-subtitle">Fetching your trainees from Willow Processing.</div>
      </div>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div className="state-screen">
      <div className="state-card">
        <div className="state-icon">⚠️</div>
        <div className="state-title">Something went wrong</div>
        <div className="state-subtitle">{message}</div>
      </div>
    </div>
  )
}

const STATUS_DOT = {
  'Pending':     '#C8C8C5',
  'In Progress': '#2563EB',
  'Completed':   '#0F7B6C',
  'Blocked':     '#E03E3E',
}

function ProcessorCard({ processor }) {
  const [expanded, setExpanded]   = useState(false)
  const [note, setNote]           = useState(processor.notes)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const { stats }                 = processor
  const hasBlocked                = stats.blocked > 0

  async function saveNote() {
    setSaving(true)
    try {
      await updateProcessorNotes(processor.id, note)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    finally { setSaving(false) }
  }

  const blockedTasks = processor.completions.filter(c => c.status === 'Blocked')

  return (
    <div className={`tp-card${hasBlocked ? ' tp-card-alert' : ''}`}>
      <div className="tp-card-header" onClick={() => setExpanded(e => !e)}>
        <div className="tp-avatar">{initials(processor.fullName)}</div>
        <div className="tp-card-info">
          <div className="tp-card-name">{processor.fullName}</div>
          <div className="tp-card-meta">Day {processor.daysIn} in program</div>
          <div className="tp-progress-wrap">
            <div className="tp-progress-track">
              <div className="tp-progress-fill" style={{ width: `${stats.pct}%` }} />
            </div>
            <span className="tp-progress-pct">{stats.pct}%</span>
          </div>
        </div>
        <div className="tp-card-badges">
          <span className="tp-badge tp-badge-done">{stats.completed} done</span>
          {hasBlocked && <span className="tp-badge tp-badge-blocked">{stats.blocked} blocked</span>}
          {stats.inProg > 0 && <span className="tp-badge tp-badge-active">{stats.inProg} active</span>}
        </div>
        <span className="tp-chevron">{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <div className="tp-detail">
          {blockedTasks.length > 0 && (
            <div className="tp-section">
              <div className="tp-section-label tp-label-blocked">Blocked Tasks</div>
              {blockedTasks.map(c => (
                <div key={c.id} className="tp-task-row tp-task-row-blocked">
                  <span className="tp-task-dot" style={{ background: '#E03E3E' }} />
                  <div>
                    <div className="tp-task-name">{c.taskName}</div>
                    {c.notes && <div className="tp-task-note">"{c.notes}"</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="tp-section">
            <div className="tp-section-label">All Tasks ({stats.total})</div>
            <div className="tp-tasks-grid">
              {processor.completions.map(c => (
                <div key={c.id} className="tp-task-row">
                  <span className="tp-task-dot" style={{ background: STATUS_DOT[c.status] || '#C8C8C5' }} />
                  <span className="tp-task-name">{c.taskName}</span>
                  <span className="tp-task-status">{c.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="tp-section">
            <div className="tp-section-label">Trainer Notes</div>
            <textarea
              className="tp-notes-textarea"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add private notes about this processor..."
              rows={3}
            />
            <button
              className="tp-btn-save"
              onClick={saveNote}
              disabled={saving || note === processor.notes}
            >
              {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Note'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TrainerSidebar({ trainer, processors, activeFilter, onFilterChange, onLogout }) {
  const total       = processors.length
  const avgPct      = total > 0 ? Math.round(processors.reduce((s, p) => s + p.stats.pct, 0) / total) : 0
  const blockedCount = processors.filter(p => p.stats.blocked > 0).length

  const NAV = [
    { id: 'all',      label: 'All Trainees', dot: '#C8C8C5', count: total },
    { id: 'blocked',  label: 'Has Blockers', dot: '#E03E3E', count: blockedCount },
    { id: 'on-track', label: 'On Track',     dot: '#0F7B6C', count: total - blockedCount },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div style={{ background: 'white', borderRadius: 8, padding: '5px 10px', display: 'inline-flex', alignItems: 'center' }}>
            <img src="/Logo.jpeg" alt="Willow Processing" style={{ height: 22, objectFit: 'contain' }} />
          </div>
        </div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials(trainer.fullName)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{trainer.fullName}</div>
            <div className="sidebar-user-role">Trainer</div>
          </div>
        </div>
      </div>

      <div className="sidebar-progress">
        <div className="sidebar-progress-label">
          Team Progress
          <span className="sidebar-progress-pct">{avgPct}%</span>
        </div>
        <div className="sidebar-track">
          <div className="sidebar-fill" style={{ width: `${avgPct}%` }} />
        </div>
        <div className="sidebar-progress-meta">{total} trainees · {blockedCount} blocked</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Trainees</div>
        {NAV.map(item => (
          <button
            key={item.id}
            className={`nav-item${activeFilter === item.id ? ' active' : ''}`}
            onClick={() => onFilterChange(item.id)}
          >
            <span className="nav-item-dot" style={{ background: item.dot }} />
            <span className="nav-item-label">{item.label}</span>
            <span className="nav-item-count">{item.count}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-signout" onClick={onLogout}>← Sign out</button>
      </div>
    </aside>
  )
}

export default function TrainerPortal({ trainerId, onLogout }) {
  const { data, loading, error } = useTrainer(trainerId)
  const [activeFilter, setActiveFilter] = useState('all')

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen message={error} />

  const { trainer, processors } = data

  const filtered =
    activeFilter === 'blocked'  ? processors.filter(p => p.stats.blocked > 0) :
    activeFilter === 'on-track' ? processors.filter(p => p.stats.blocked === 0) :
    processors

  const TITLES = {
    all:       { title: 'All Trainees',  sub: `${processors.length} processors in onboarding` },
    blocked:   { title: 'Has Blockers',  sub: 'These trainees need your attention' },
    'on-track':{ title: 'On Track',      sub: 'Moving forward without blockers' },
  }
  const { title, sub } = TITLES[activeFilter]

  return (
    <div className="app-shell">
      <TrainerSidebar
        trainer={trainer}
        processors={processors}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onLogout={onLogout}
      />
      <div className="main">
        <div className="main-header">
          <div className="main-header-title">{title}</div>
          <div className="main-header-sub">{sub}</div>
        </div>
        <div className="main-content" style={{ maxWidth: 760 }}>
          {filtered.length === 0 ? (
            <div className="task-empty">
              <div className="task-empty-icon">🎉</div>
              <div className="task-empty-title">No trainees here</div>
              <div className="task-empty-sub">Everything looks good!</div>
            </div>
          ) : (
            filtered.map(proc => <ProcessorCard key={proc.id} processor={proc} />)
          )}
        </div>
      </div>
    </div>
  )
}
