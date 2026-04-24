import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { invoicesAPI, clientsAPI } from '../api';
import '../styles/Invoices.css';

export function InvoicesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await invoicesAPI.getAll();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Build a lookup map: client ID -> client name
  const clientMap = {};
  clients.forEach(client => {
    clientMap[String(client._id)] = client.name;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await invoicesAPI.updateStatus(invoiceId, newStatus);
      setInvoices(invoices.map(inv => 
        inv._id === invoiceId ? { ...inv, status: newStatus } : inv
      ));
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoicesAPI.delete(invoiceId);
        setInvoices(invoices.filter(inv => inv._id !== invoiceId));
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  return (
    <div className="invoices-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <h1>Invoice Management Tool</h1>
          </div>
          <div className="nav-menu">
            <a href="/dashboard" className="nav-link">Dashboard</a>
            <a href="/invoices" className="nav-link active">Invoices</a>
            <a href="/clients" className="nav-link">Clients</a>
            <div className="nav-user">
              <span>{user?.name || 'User'}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="invoices-main">
        <div className="page-header">
          <div>
            <h2>Invoices</h2>
            <p>Manage all your invoices in one place</p>
          </div>
          <button onClick={() => navigate('/invoices/new')} className="primary-btn">
            + New Invoice
          </button>
        </div>

        <div className="filter-group">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({invoices.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => setFilter('draft')}
          >
            Draft ({invoices.filter(i => i.status === 'draft').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'sent' ? 'active' : ''}`}
            onClick={() => setFilter('sent')}
          >
            Sent ({invoices.filter(i => i.status === 'sent').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
            onClick={() => setFilter('paid')}
          >
            Paid ({invoices.filter(i => i.status === 'paid').length})
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <p>No invoices found. Create your first invoice to get started!</p>
            <button onClick={() => navigate('/invoices/new')} className="primary-btn">
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="invoices-table">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={invoice._id}>
                    <td className="invoice-number">#{invoice.invoiceNumber}</td>
                    <td>{clientMap[String(invoice.clientId)] || invoice.clientId}</td>
                    <td>${invoice.total?.toFixed(2) || '0.00'}</td>
                    <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td>
                      <select 
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice._id, e.target.value)}
                        className={`status-select ${getStatusClass(invoice.status)}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => navigate(`/invoices/${invoice._id}`)}
                          className="view-btn"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => navigate(`/invoices/${invoice._id}/edit`)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
