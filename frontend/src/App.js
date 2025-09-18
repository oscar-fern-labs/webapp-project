import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State variables
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ id: '', name: '' });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

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

  // Add new item
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

  // Edit handling
  const handleEdit = (id) => {
    const item = items.find(i => i.id === id);
    setEditName(item?.name || '');
    setEditingId(id);
  };

  const handleUpdate = (id) => {
    if (!editName) return alert('Name required for update');
    fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Update failed');
        return res.json();
      })
      .then(() => {
        setEditingId(null);
        setEditName('');
        fetchItems();
      })
      .catch(err => alert(err.message));
  };

  // Delete item
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
              {editingId === item.id ? (
                <span>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="New name"
                    style={{ marginLeft: '0.5rem' }}
                  />
                  <button onClick={() => handleUpdate(item.id)} style={{ marginLeft: '0.5rem' }}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ marginLeft: '0.5rem' }}>Cancel</button>
                </span>
              ) : (
                <>
                  <button onClick={() => handleEdit(item.id)} style={{ marginLeft: '0.5rem' }}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
                </>
              )}
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

