import { useState } from 'react'
import { useProcessor } from './hooks/useProcessor'
import LoginPage from './components/LoginPage'
import Sidebar from './components/Sidebar'
import TaskCard from './components/TaskCard'
import TrainerPortal from './components/TrainerPortal'

function getProcessorIdFromUrl() {
  return new URLSearchParams(window.location.search).get('processor_id')
}

const CATEGORY_ORDER = ['Portal Setup', 'Compliance', 'Training', 'System Access']

const TAB_TITLES = {
  all:       { title: 'All Tasks',   sub: 'Your complete onboarding checklist' },
  pending:   { title: 'Pending',     sub: 'Tasks waiting to be started' },
  progress:  { title: 'In Progress', sub: 'Tasks you are currently working on' },
  blocked:   { title: 'Blocked',     sub: 'Tasks that need trainer support' },
  completed: { title: 'Completed',   sub: 'Tasks you have finished' },
}

function CategorySection({ category, tasks, onUpdate }) {
  const [open, setOpen] = useState(true)
  const completed = tasks.filter(t => t.status === 'Completed').length

  return (
    <div className="task-group">
      <button className="task-group-header" onClick={() => setOpen(o => !o)}>
        <span className="task-group-chevron">{open ? '▾' : '▸'}</span>
        <span className="task-group-label-text">{category}</span>
        <span className="task-group-count">{tasks.length}</span>
        <span className="task-group-done">{completed}/{tasks.length} done</span>
      </button>
      {open && (
        <div className="task-group-content">
          {tasks.map(task => <TaskCard key={task.id} task={task} onUpdate={onUpdate} />)}
        </div>
      )}
    </div>
  )
}

function TaskList({ completions, activeTab, onUpdate }) {
  const filtered = activeTab === 'all'
    ? completions
    : completions.filter(c => {
        if (activeTab === 'progress')  return c.status === 'In Progress'
        if (activeTab === 'pending')   return c.status === 'Pending'
        if (activeTab === 'blocked')   return c.status === 'Blocked'
        if (activeTab === 'completed') return c.status === 'Completed'
        return true
      })

  if (!filtered.length) {
    const msgs = {
      pending:   { icon: '✅', title: 'No pending tasks',       sub: 'All caught up!' },
      progress:  { icon: '🚀', title: 'Nothing in progress',    sub: 'Pick a task and get started.' },
      blocked:   { icon: '🎉', title: 'Nothing blocked',        sub: "You're moving forward without issues." },
      completed: { icon: '📋', title: 'No completed tasks yet', sub: 'Start checking things off!' },
      all:       { icon: '📋', title: 'No tasks found',         sub: '' },
    }
    const m = msgs[activeTab] || msgs.all
    return (
      <div className="task-empty">
        <div className="task-empty-icon">{m.icon}</div>
        <div className="task-empty-title">{m.title}</div>
        <div className="task-empty-sub">{m.sub}</div>
      </div>
    )
  }

  if (activeTab === 'all') {
    const grouped = {}
    CATEGORY_ORDER.forEach(cat => { grouped[cat] = [] })
    filtered.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = []
      grouped[t.category].push(t)
    })
    CATEGORY_ORDER.forEach(cat => {
      grouped[cat].sort((a, b) => (a.dueDay ?? 99) - (b.dueDay ?? 99))
    })

    return (
      <>
        {CATEGORY_ORDER.filter(cat => grouped[cat]?.length > 0).map(cat => (
          <CategorySection key={cat} category={cat} tasks={grouped[cat]} onUpdate={onUpdate} />
        ))}
      </>
    )
  }

  const sorted = [...filtered].sort((a, b) => (a.dueDay ?? 99) - (b.dueDay ?? 99))
  return (
    <>
      {sorted.map(task => <TaskCard key={task.id} task={task} onUpdate={onUpdate} />)}
    </>
  )
}

function LoadingScreen() {
  return (
    <div className="state-screen">
      <div className="state-card">
        <div className="spinner" />
        <div className="state-title">Loading your portal...</div>
        <div className="state-subtitle">Fetching your tasks from Willow Processing.</div>
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

function Portal({ processorId, onLogout }) {
  const { data, loading, error, updateTask } = useProcessor(processorId)
  const [activeTab, setActiveTab] = useState('all')

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen message={error} />

  const { title, sub } = TAB_TITLES[activeTab]

  return (
    <div className="app-shell">
      <Sidebar
        processor={data}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />
      <div className="main">
        <div className="main-header">
          <div className="main-header-title">{title}</div>
          <div className="main-header-sub">{sub}</div>
        </div>
        <div className="main-content">
          <TaskList
            completions={data.completions}
            activeTab={activeTab}
            onUpdate={updateTask}
          />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const urlId = getProcessorIdFromUrl()
  const [user, setUser] = useState(urlId ? { id: urlId, type: 'processor' } : null)

  function handleLogin(id, type) {
    setUser({ id, type })
  }

  function handleLogout() {
    setUser(null)
    window.history.replaceState({}, '', window.location.pathname)
  }

  if (!user) return <LoginPage onLogin={handleLogin} />
  if (user.type === 'trainer') return <TrainerPortal trainerId={user.id} onLogout={handleLogout} />
  return <Portal processorId={user.id} onLogout={handleLogout} />
}
