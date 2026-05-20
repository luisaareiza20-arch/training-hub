function motivationalMessage(pct) {
  if (pct === 100) return "You did it! Welcome to the Willow team. 🎉"
  if (pct >= 75)  return "Almost there — the finish line is within reach."
  if (pct >= 50)  return "More than halfway through. Keep the momentum going."
  if (pct >= 25)  return "Good progress. Every task brings you closer to full speed."
  return "You're just getting started — let's do this."
}

export default function Footer({ trainer, completions }) {
  const total = completions.length
  const completed = completions.filter(c => c.status === 'Completed').length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-trainer">
          {trainer ? (
            <>
              Your trainer is <strong>{trainer.fullName}</strong>
              {trainer.email && <> · <a href={`mailto:${trainer.email}`}>{trainer.email}</a></>}
            </>
          ) : (
            <span>Willow Processing — Training Hub</span>
          )}
        </div>
        <div className="footer-message">{motivationalMessage(pct)}</div>
      </div>
    </footer>
  )
}
