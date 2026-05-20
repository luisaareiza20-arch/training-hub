function WillowLogoMarkSm() {
  return (
    <div className="header-logo-mark-sm">
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="3" />
        <ellipse cx="16" cy="8"  rx="2" ry="4.5" />
        <ellipse cx="16" cy="24" rx="2" ry="4.5" />
        <ellipse cx="8"  cy="16" rx="4.5" ry="2" />
        <ellipse cx="24" cy="16" rx="4.5" ry="2" />
        <ellipse cx="10.3" cy="10.3" rx="2" ry="4.5" transform="rotate(-45 10.3 10.3)" />
        <ellipse cx="21.7" cy="21.7" rx="2" ry="4.5" transform="rotate(-45 21.7 21.7)" />
        <ellipse cx="21.7" cy="10.3" rx="2" ry="4.5" transform="rotate(45 21.7 10.3)" />
        <ellipse cx="10.3" cy="21.7" rx="2" ry="4.5" transform="rotate(45 10.3 21.7)" />
      </svg>
    </div>
  )
}

export default function Header({ processor, onLogout }) {
  const { fullName, startDate, trainer, completions } = processor

  const daysIn = startDate
    ? Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000))
    : 0

  const total = completions.length
  const completed = completions.filter(c => c.status === 'Completed').length
  const inProgress = completions.filter(c => c.status === 'In Progress').length
  const blocked = completions.filter(c => c.status === 'Blocked').length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-top-bar">
          <div className="header-brand-row">
            <WillowLogoMarkSm />
            <span className="header-app-name">Training Hub</span>
          </div>
          <button className="header-logout" onClick={onLogout}>Sign out</button>
        </div>

        <div className="header-greeting">Good to see you,</div>
        <div className="header-name">{fullName}</div>
        <div className="header-meta">
          <span>Day {daysIn} of onboarding</span>
          <span className="header-meta-dot" />
          <span>{completed} of {total} tasks completed</span>
          {trainer && (
            <>
              <span className="header-meta-dot" />
              <span>Trainer: {trainer.fullName}</span>
            </>
          )}
        </div>

        <div className="progress-section">
          <div className="progress-label">
            <span>Overall Progress</span>
            <span className="progress-pct">{pct}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="header-stats">
          {inProgress > 0 && (
            <div className="stat-chip">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5BBFEF', display: 'inline-block' }} />
              {inProgress} in progress
            </div>
          )}
          {blocked > 0 && (
            <div className="stat-chip">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />
              {blocked} blocked
            </div>
          )}
          {trainer && (
            <div className="stat-chip">
              <span className="stat-chip-dot" />
              {trainer.fullName}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
