import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ id: '', name: '' });
  const [loading, setLoading] = useState(true);

  // Load items from backend
  const fetchItems = () => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading items', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.id) return alert('ID required');
    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add');
        return res.json();
      })
      .then(() => {
        setNewItem({ id: '', name: '' });
        fetchItems();
      })
      .catch(err => alert(err.message));
  };

  const handleDelete = (id) => {
    fetch(`/api/items/${id}`, { method: 'DELETE' })
      .then(() => fetchItems())
      .catch(err => console.error(err));
  };

  return (
    <div className="App" style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Item List</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id} style={{ marginBottom: '0.5rem' }}>
              <strong>{item.id}</strong>: {item.name || '(no name)'}
              <button onClick={() => handleDelete(item.id)} style={{ marginLeft: '1rem' }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2>Add New Item</h2>
      <form onSubmit={handleAdd} style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="ID"
          value={newItem.id}
          onChange={e => setNewItem({ ...newItem, id: e.target.value })}
          required
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Name"
          value={newItem.name}
          onChange={e => setNewItem({ ...newItem, name: e.target.value })}
          style={{ marginRight: '0.5rem' }}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default App;
