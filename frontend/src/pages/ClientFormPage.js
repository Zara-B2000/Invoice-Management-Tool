import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsAPI } from '../api';
import '../styles/InvoiceForm.css';

export function ClientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchClient = async () => {
        try {
          const data = await clientsAPI.getAll();
          const client = data.find(c => c._id === id);
          if (client) {
            setFormData(client);
          }
        } catch (err) {
          setError('Error loading client');
        } finally {
          setLoading(false);
        }
      };
      fetchClient();
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.country) {
      setError('Please fill in all fields');
      return;
    }

    try {
      if (isEdit) {
        await clientsAPI.update(id, formData);
      } else {
        await clientsAPI.create(formData);
      }
      navigate('/clients');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving client');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="client-form-container">
      <div className="form-header">
        <button onClick={() => navigate('/clients')} className="back-btn">← Back</button>
        <h2>{isEdit ? 'Edit Client' : 'Add New Client'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="client-form">
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Client Name"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="client@example.com"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street Address"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Country *</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            className="form-input"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/clients')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {isEdit ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
