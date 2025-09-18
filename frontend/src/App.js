import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Item state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ id: '', name: '' });
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // Helper for authenticated fetch
  const authFetch = (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  // Load items (requires auth)
  const fetchItems = () => {
    authFetch('/api/items')
      .then(res => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) {
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Auth handlers
  const handleLogin = (e) => {
    e.preventDefault();
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Login failed');
        return res.json();
      })
      .then(data => {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setAuthError('');
        setUsername('');
        setPassword('');
        fetchItems();
      })
      .catch(err => setAuthError(err.message));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
      })
      .then(() => {
        setAuthError('');
        // Auto login after registration
        handleLogin(e);
      })
      .catch(err => setAuthError(err.message));
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setItems([]);
  };

  // CRUD handlers (authenticated)
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.id) return alert('ID required');
    authFetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(newItem),
    })
      .then(res => {
        if (!res.ok) throw new Error('Add failed');
        return res.json();
      })
      .then(() => {
        setNewItem({ id: '', name: '' });
        fetchItems();
      })
      .catch(err => alert(err.message));
  };

  const handleEdit = (id) => {
    const item = items.find(i => i.id === id);
    setEditName(item?.name || '');
    setEditingId(id);
  };

  const handleUpdate = (id) => {
    if (!editName) return alert('Name required for update');
    authFetch(`/api/items/${id}`, {
      method: 'PUT',
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

  const handleDelete = (id) => {
    authFetch(`/api/items/${id}`, { method: 'DELETE' })
      .then(() => fetchItems())
      .catch(err => console.error(err));
  };

  // Render UI
  if (!token) {
    return (
      <div className="App" style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h2>Login / Register</h2>
        {authError && <p style={{ color: 'red' }}>{authError}</p>}
        <form onSubmit={handleLogin} style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ marginRight: '0.5rem' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ marginRight: '0.5rem' }}
          />
          <button type="submit">Login</button>
        </form>
        <form onSubmit={handleRegister}>
          <button type="submit">Register new account</button>
        </form>
      </div>
    );
  }

  return (
    <div className="App" style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Item List</h1>
      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>Logout</button>
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

