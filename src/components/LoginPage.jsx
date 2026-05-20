import { useState } from 'react'

const APP_ID = import.meta.env.VITE_KNACK_APP_ID
const API_KEY = import.meta.env.VITE_KNACK_API_KEY

function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

async function findProcessorByEmail(email) {
  const filter = encodeURIComponent(JSON.stringify([{ field: 'field_53', operator: 'is', value: email }]))
  const res = await fetch(`https://api.knack.com/v1/objects/object_4/records?filters=${filter}`, {
    headers: { 'X-Knack-Application-Id': APP_ID, 'X-Knack-REST-API-Key': API_KEY },
  })
  if (!res.ok) throw new Error('Connection error. Please try again.')
  const data = await res.json()
  if (!data.records?.length) return null
  return data.records[0].id
}

async function findTrainerByEmail(email) {
  const filter = encodeURIComponent(JSON.stringify([{ field: 'field_51', operator: 'is', value: email }]))
  const res = await fetch(`https://api.knack.com/v1/objects/object_3/records?filters=${filter}`, {
    headers: { 'X-Knack-Application-Id': APP_ID, 'X-Knack-REST-API-Key': API_KEY },
  })
  if (!res.ok) throw new Error('Connection error. Please try again.')
  const data = await res.json()
  if (!data.records?.length) return null
  return data.records[0].id
}

export default function LoginPage({ onLogin }) {
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const clean = email.trim().toLowerCase()

      const processorId = await findProcessorByEmail(clean)
      if (processorId) { onLogin(processorId, 'processor'); return }

      const trainerId = await findTrainerByEmail(clean)
      if (trainerId) { onLogin(trainerId, 'trainer'); return }

      throw new Error('No account found for this email. Contact your administrator.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-brand">
          <div style={{ background: 'white', borderRadius: 8, padding: '5px 10px', display: 'inline-flex', alignItems: 'center' }}>
            <img src="/Logo.jpeg" alt="Willow Processing" style={{ height: 24, objectFit: 'contain' }} />
          </div>
        </div>

        <div className="login-left-quote">
          <div className="login-left-heading">Your onboarding,<br />organized.</div>
          <div className="login-left-sub">
            Track every step of your processor onboarding — from system access to your first independent loan file.
          </div>
        </div>

        <div className="login-left-stats">
          <div className="login-stat">
            <div className="login-stat-num">13</div>
            <div className="login-stat-label">Tasks tracked</div>
          </div>
          <div className="login-stat">
            <div className="login-stat-num">32</div>
            <div className="login-stat-label">States licensed</div>
          </div>
          <div className="login-stat">
            <div className="login-stat-num">30</div>
            <div className="login-stat-label">Day program</div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-box">
          <img src="/Logo.jpeg" alt="Willow Processing" style={{ height: 40, objectFit: 'contain', marginBottom: 28 }} />
          <div className="login-form-title">Welcome back</div>
          <div className="login-form-sub">Sign in to access your Training Hub portal.</div>

          {!showEmail ? (
            <>
              <button className="btn-google" onClick={() => setShowEmail(true)}>
                <GoogleIcon />
                Continue with Google
              </button>
              <div className="login-note">
                Only <span>@willowprocessing.com</span> accounts are authorized to access this portal.
              </div>
            </>
          ) : (
            <>
              <div className="login-divider"><span>Enter your work email</span></div>
              <form onSubmit={handleSubmit}>
                <div className="login-field">
                  <label className="login-label">Work email</label>
                  <input
                    className="login-input"
                    type="email"
                    placeholder="you@willowprocessing.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                {error && <div className="login-error">{error}</div>}
                <button className="btn-login" type="submit" disabled={loading || !email.trim()}>
                  {loading ? 'Signing in...' : 'Access my portal →'}
                </button>
              </form>
              <div className="login-note" style={{ marginTop: 16 }}>
                Only <span>@willowprocessing.com</span> accounts are authorized.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
