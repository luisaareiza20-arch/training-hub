function LogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="3.2"/>
      <ellipse cx="16" cy="7.5" rx="2" ry="4.5"/>
      <ellipse cx="16" cy="24.5" rx="2" ry="4.5"/>
      <ellipse cx="7.5" cy="16" rx="4.5" ry="2"/>
      <ellipse cx="24.5" cy="16" rx="4.5" ry="2"/>
      <ellipse cx="10.3" cy="10.3" rx="2" ry="4.5" transform="rotate(-45 10.3 10.3)"/>
      <ellipse cx="21.7" cy="21.7" rx="2" ry="4.5" transform="rotate(-45 21.7 21.7)"/>
      <ellipse cx="21.7" cy="10.3" rx="2" ry="4.5" transform="rotate(45 21.7 10.3)"/>
      <ellipse cx="10.3" cy="21.7" rx="2" ry="4.5" transform="rotate(45 10.3 21.7)"/>
    </svg>
  )
}

const NAV = [
  { id: 'all',       label: 'All Tasks',   dot: '#C8C8C5' },
  { id: 'pending',   label: 'Pending',     dot: '#C8C8C5' },
  { id: 'progress',  label: 'In Progress', dot: '#5BBFEF' },
  { id: 'blocked',   label: 'Blocked',     dot: '#E03E3E' },
  { id: 'completed', label: 'Completed',   dot: '#0F7B6C' },
]

function initials(name) {
  return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

export default function Sidebar({ processor, activeTab, onTabChange, onLogout }) {
  const { fullName, startDate, trainer, completions } = processor

  const total     = completions.length
  const completed = completions.filter(c => c.status === 'Completed').length
  const inProg    = completions.filter(c => c.status === 'In Progress').length
  const blocked   = completions.filter(c => c.status === 'Blocked').length
  const pending   = completions.filter(c => c.status === 'Pending').length
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0

  const counts = { all: total, pending, progress: inProg, blocked, completed }

  const daysIn = startDate
    ? Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000))
    : 0

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div style={{ background: 'white', borderRadius: 8, padding: '5px 10px', display: 'inline-flex', alignItems: 'center' }}>
            <img src="/Logo.jpeg" alt="Willow Processing" style={{ height: 22, objectFit: 'contain' }} />
          </div>
        </div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials(fullName)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{fullName}</div>
            <div className="sidebar-user-role">Day {daysIn} · Processor</div>
          </div>
        </div>
      </div>

      <div className="sidebar-progress">
        <div className="sidebar-progress-label">
          Progress
          <span className="sidebar-progress-pct">{pct}%</span>
        </div>
        <div className="sidebar-track">
          <div className="sidebar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="sidebar-progress-meta">{completed} of {total} tasks done</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Tasks</div>
        {NAV.map(item => (
          <button
            key={item.id}
            className={`nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="nav-item-dot" style={{ background: item.dot }} />
            <span className="nav-item-label">{item.label}</span>
            <span className="nav-item-count">{counts[item.id]}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {trainer && (
          <div className="sidebar-trainer">
            Trainer: <strong>{trainer.fullName}</strong><br />
            {trainer.email && <a href={`mailto:${trainer.email}`}>{trainer.email}</a>}
          </div>
        )}
        <button className="btn-signout" onClick={onLogout}>← Sign out</button>
      </div>
    </aside>
  )
}
