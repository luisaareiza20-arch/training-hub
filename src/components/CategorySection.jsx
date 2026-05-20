import TaskCard from './TaskCard'

const ORDER = ['System Access', 'Training', 'Compliance', 'Portal Setup']

const ICONS = {
  'System Access': '🔐',
  'Training':      '📚',
  'Compliance':    '✅',
  'Portal Setup':  '⚙️',
}

export default function CategorySection({ completions, onUpdate }) {
  const grouped = {}
  ORDER.forEach(cat => { grouped[cat] = [] })

  completions.forEach(task => {
    const cat = task.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(task)
  })

  Object.keys(grouped).forEach(cat => {
    grouped[cat].sort((a, b) => (a.dueDay ?? 99) - (b.dueDay ?? 99))
  })

  return (
    <>
      {ORDER.filter(cat => grouped[cat]?.length > 0).map(cat => {
        const tasks = grouped[cat]
        const done = tasks.filter(t => t.status === 'Completed').length
        return (
          <div key={cat} className="category">
            <div className="category-header">
              <span>{ICONS[cat]}</span>
              <span className="category-title">{cat}</span>
              <span className="category-count">{done}/{tasks.length}</span>
            </div>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onUpdate={onUpdate} />
            ))}
          </div>
        )
      })}
    </>
  )
}
