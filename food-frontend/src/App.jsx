import { useState, useEffect, useRef, useCallback } from 'react'
import { getFoodItems, addFoodItem, deleteFoodItem, updateFoodItem, getAuditLogs } from './api'
import { logEvent } from './logger'
import './App.css'

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [logs, setLogs] = useState([])

  const nameTimer = useRef(null)
  const priceTimer = useRef(null)

  const debouncedLog = useCallback((field, value, timerRef) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (value) logEvent('input_change', field, value)
    }, 500)
  }, [])

  useEffect(() => {
    loadItems()
    loadLogs()
  }, [])

  async function loadItems() {
    try {
      const data = await getFoodItems()
      setItems(data)
    } catch {
      setError('Could not load food items. Is the backend running?')
    }
  }

  async function loadLogs() {
    try {
      const data = await getAuditLogs()
      setLogs(data)
    } catch {
      // silently fail for logs
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !price) return

    try {
      if (editingId) {
        await updateFoodItem(editingId, { name, price: parseFloat(price) })
        logEvent('update', 'form', `Updated item ${editingId}: ${name} - $${price}`)
        setEditingId(null)
      } else {
        await addFoodItem({ name, price: parseFloat(price) })
        logEvent('add', 'form', `Added item: ${name} - $${price}`)
      }
      setName('')
      setPrice('')
      setError('')
      loadItems()
      loadLogs()
    } catch {
      setError('Failed to save food item')
    }
  }

  async function handleDelete(id) {
    const item = items.find(i => i.id === id)
    try {
      await deleteFoodItem(id)
      logEvent('delete', 'button', `Deleted item ${id}: ${item?.name} - $${item?.price}`)
      loadItems()
      loadLogs()
    } catch {
      setError('Failed to delete food item')
    }
  }

  function handleEdit(item) {
    setEditingId(item.id)
    setName(item.name)
    setPrice(String(item.price))
    logEvent('edit_click', 'button', `Editing item ${item.id}: ${item.name} - $${item.price}`)
  }

  function handleCancel() {
    setEditingId(null)
    setName('')
    setPrice('')
  }

  return (
    <div className="container">
      <h1>Food Items Manager</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Food name"
          value={name}
          onChange={(e) => { setName(e.target.value); debouncedLog('name_field', e.target.value, nameTimer) }}
          onBlur={() => { clearTimeout(nameTimer.current); if (name) logEvent('input_change', 'name_field', name) }}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => { setPrice(e.target.value); debouncedLog('price_field', e.target.value, priceTimer) }}
          onBlur={() => { clearTimeout(priceTimer.current); if (price) logEvent('input_change', 'price_field', price) }}
          min="0"
          step="0.01"
          required
        />
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && (
          <button type="button" onClick={handleCancel} className="btn-cancel">
            Cancel
          </button>
        )}
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="4" className="empty">No food items yet</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>
                  <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2 className="audit-heading">Audit Logs</h2>
      <table className="table audit-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan="3" className="empty">No audit logs yet</td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id}>
                <td className="audit-ts">{new Date(log.timestamp).toLocaleString()}</td>
                <td>
                  <span className={`badge badge-${log.action.toLowerCase()}`}>
                    {log.action}
                  </span>
                </td>
                <td>{log.details}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App
