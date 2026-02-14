import { useState, useEffect } from 'react'
import { getFoodItems, addFoodItem, deleteFoodItem, updateFoodItem } from './api'
import './App.css'

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    try {
      const data = await getFoodItems()
      setItems(data)
    } catch {
      setError('Could not load food items. Is the backend running?')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !price) return

    try {
      if (editingId) {
        await updateFoodItem(editingId, { name, price: parseFloat(price) })
        setEditingId(null)
      } else {
        await addFoodItem({ name, price: parseFloat(price) })
      }
      setName('')
      setPrice('')
      setError('')
      loadItems()
    } catch {
      setError('Failed to save food item')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteFoodItem(id)
      loadItems()
    } catch {
      setError('Failed to delete food item')
    }
  }

  function handleEdit(item) {
    setEditingId(item.id)
    setName(item.name)
    setPrice(String(item.price))
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
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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
    </div>
  )
}

export default App
