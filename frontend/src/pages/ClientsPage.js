import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clientsAPI } from '../api';
import '../styles/Clients.css';

export function ClientsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientsAPI.delete(clientId);
        setClients(clients.filter(c => c._id !== clientId));
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  return (
    <div className="clients-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <h1>Invoice Management Tool</h1>
          </div>
          <div className="nav-menu">
            <a href="/dashboard" className="nav-link">Dashboard</a>
            <a href="/invoices" className="nav-link">Invoices</a>
            <a href="/clients" className="nav-link active">Clients</a>
            <div className="nav-user">
              <span>{user?.name || 'User'}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="clients-main">
        <div className="page-header">
          <div>
            <h2>Clients</h2>
            <p>Manage your client information</p>
          </div>
          <button onClick={() => navigate('/clients/new')} className="primary-btn">
            + New Client
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <p>No clients yet. Add your first client to get started!</p>
            <button onClick={() => navigate('/clients/new')} className="primary-btn">
              Add Client
            </button>
          </div>
        ) : (
          <div className="clients-grid">
            {clients.map(client => (
              <div key={client._id} className="client-card">
                <div className="client-header">
                  <h3>{client.name}</h3>
                  <div className="client-actions">
                    <button 
                      onClick={() => navigate(`/clients/${client._id}/edit`)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(client._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="client-details">
                  <p><strong>Email:</strong> {client.email}</p>
                  <p><strong>Phone:</strong> {client.phone}</p>
                  <p><strong>Address:</strong> {client.address}</p>
                  <p><strong>City:</strong> {client.city}</p>
                  <p><strong>Country:</strong> {client.country}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
