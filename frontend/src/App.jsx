import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/stations'
const emptyForm = { stationCode: '', location: '', sensorCount: 1, active: true }

function App() {
  const [stations, setStations] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const activeCount = useMemo(() => stations.filter((station) => station.active).length, [stations])
  const totalSensors = useMemo(
    () => stations.reduce((total, station) => total + station.sensorCount, 0),
    [stations],
  )

  useEffect(() => {
    loadStations()
  }, [])

  async function loadStations() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_BASE_URL)
      if (!response.ok) throw new Error(`Could not load stations (${response.status}).`)
      setStations(await response.json())
    } catch (requestError) {
      setError(`${requestError.message} Make sure the backend and database are running.`)
    } finally {
      setLoading(false)
    }
  }

  function updateForm(event) {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function editStation(station) {
    setEditingId(station.id)
    setForm({
      stationCode: station.stationCode,
      location: station.location,
      sensorCount: station.sensorCount,
      active: station.active,
    })
    setNotice('')
    setError('')
    document.querySelector('#station-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function submitForm(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    const url = editingId ? `${API_BASE_URL}/${editingId}` : API_BASE_URL
    try {
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sensorCount: Number(form.sensorCount) }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.message || `Could not save station (${response.status}).`)
      }
      setNotice(editingId ? 'Station details updated.' : 'Station added successfully.')
      resetForm()
      await loadStations()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteStation(station) {
    if (!window.confirm(`Remove station ${station.stationCode}?`)) return
    setError('')
    setNotice('')
    try {
      const response = await fetch(`${API_BASE_URL}/${station.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`Could not delete station (${response.status}).`)
      if (editingId === station.id) resetForm()
      setNotice(`${station.stationCode} was removed.`)
      await loadStations()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="WeatherStation home">
          <span className="brand-mark" aria-hidden="true">W</span>
          <span>weather<span className="brand-light">station</span></span>
        </a>
        <div className="topbar-right">
          <span className="live-dot" />
          <span>Monitoring dashboard</span>
          <span className="avatar">HK</span>
        </div>
      </header>

      <section className="content">
        <div className="page-heading">
          <div>
            <div className="eyebrow">OPERATIONS / NETWORK</div>
            <h1>Weather stations</h1>
            <p>Manage monitoring sites and keep track of your sensor network.</p>
          </div>
          <button className="refresh-button" onClick={loadStations} disabled={loading} type="button">
            <span aria-hidden="true">↻</span> Refresh
          </button>
        </div>

        <section className="metrics" aria-label="Station summary">
          <article className="metric-card">
            <div className="metric-icon blue" aria-hidden="true">⌖</div>
            <div><span className="metric-label">Total stations</span><strong>{stations.length}</strong></div>
            <span className="metric-note">registered sites</span>
          </article>
          <article className="metric-card">
            <div className="metric-icon green" aria-hidden="true">●</div>
            <div><span className="metric-label">Active stations</span><strong>{activeCount}</strong></div>
            <span className="metric-note">of {stations.length} stations</span>
          </article>
          <article className="metric-card">
            <div className="metric-icon amber" aria-hidden="true">⌁</div>
            <div><span className="metric-label">Connected sensors</span><strong>{totalSensors}</strong></div>
            <span className="metric-note">across all stations</span>
          </article>
        </section>

        {(error || notice) && (
          <div className={`feedback ${error ? 'feedback-error' : 'feedback-success'}`} role="status">
            {error || notice}
            <button type="button" aria-label="Dismiss message" onClick={() => { setError(''); setNotice('') }}>×</button>
          </div>
        )}

        <div className="main-grid">
          <section className="panel stations-panel">
            <div className="panel-heading">
              <div>
                <h2>Station directory</h2>
                <p>All registered locations and their current status</p>
              </div>
              <span className="count-pill">{stations.length} {stations.length === 1 ? 'station' : 'stations'}</span>
            </div>
            {loading ? (
              <div className="empty-state"><span className="spinner" /> Loading stations…</div>
            ) : stations.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true">⌖</span>
                <strong>No stations yet</strong>
                <span>Add your first weather station using the form.</span>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>STATION</th><th>LOCATION</th><th>SENSORS</th><th>STATUS</th><th aria-label="Actions" /></tr>
                  </thead>
                  <tbody>
                    {stations.map((station) => (
                      <tr key={station.id}>
                        <td><span className="station-code">{station.stationCode}</span><span className="station-id">ID #{station.id}</span></td>
                        <td>{station.location}</td>
                        <td><span className="sensor-count">{station.sensorCount}</span> sensors</td>
                        <td><span className={`status ${station.active ? 'status-active' : 'status-inactive'}`}><span />{station.active ? 'Active' : 'Inactive'}</span></td>
                        <td className="row-actions">
                          <button type="button" onClick={() => editStation(station)} aria-label={`Edit ${station.stationCode}`}>Edit</button>
                          <button className="delete-action" type="button" onClick={() => deleteStation(station)} aria-label={`Delete ${station.stationCode}`}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel form-panel" id="station-form">
            <div className="panel-heading form-heading">
              <div className="form-icon" aria-hidden="true">{editingId ? '✎' : '+'}</div>
              <div><h2>{editingId ? 'Edit station' : 'Add a station'}</h2><p>{editingId ? 'Update the station details below.' : 'Register a new monitoring location.'}</p></div>
            </div>
            <form onSubmit={submitForm}>
              <label htmlFor="stationCode">Station code</label>
              <input id="stationCode" name="stationCode" value={form.stationCode} onChange={updateForm} placeholder="e.g. WS-001" maxLength="40" required />
              <label htmlFor="location">Location</label>
              <input id="location" name="location" value={form.location} onChange={updateForm} placeholder="City, region" maxLength="120" required />
              <label htmlFor="sensorCount">Sensor count</label>
              <input id="sensorCount" name="sensorCount" type="number" min="0" value={form.sensorCount} onChange={updateForm} required />
              <label className="checkbox-row" htmlFor="active">
                <input id="active" name="active" type="checkbox" checked={form.active} onChange={updateForm} />
                <span><strong>Station is active</strong><small>Include this station in active monitoring.</small></span>
              </label>
              <div className="form-actions">
                {editingId && <button className="cancel-button" type="button" onClick={resetForm}>Cancel</button>}
                <button className="submit-button" type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add station'}<span aria-hidden="true">→</span></button>
              </div>
            </form>
          </section>
        </div>
        <footer>WeatherStation <span>·</span> Station management system</footer>
      </section>
    </main>
  )
}

export default App
