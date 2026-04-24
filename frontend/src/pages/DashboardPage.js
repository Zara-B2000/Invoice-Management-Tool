import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api';
import '../styles/Dashboard.css';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <h1>Invoice Management Tool</h1>
          </div>
          <div className="nav-menu">
            <a href="/dashboard" className="nav-link active">Dashboard</a>
            <a href="/invoices" className="nav-link">Invoices</a>
            <a href="/clients" className="nav-link">Clients</a>
            <div className="nav-user">
              <span>{user?.name || 'User'}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <p>Welcome back, {user?.name}!</p>
        </div>

        {loading ? (
          <div className="loading">Loading statistics...</div>
        ) : stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <h3>Total Invoices</h3>
                <p className="stat-value">{stats.totalInvoices}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Total Amount</h3>
                <p className="stat-value">${stats.totalAmount?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✓</div>
              <div className="stat-content">
                <h3>Paid Amount</h3>
                <p className="stat-value">${stats.paidAmount?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Pending Amount</h3>
                <p className="stat-value">${stats.pendingAmount?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Clients</h3>
                <p className="stat-value">{stats.totalClients}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="dashboard-actions">
          <button onClick={() => navigate('/invoices/new')} className="primary-btn">
            Create New Invoice
          </button>
          <button onClick={() => navigate('/clients/new')} className="secondary-btn">
            Add Client
          </button>
        </div>
      </main>
    </div>
  );
}
