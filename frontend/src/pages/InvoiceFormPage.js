import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoicesAPI, clientsAPI } from '../api';
import '../styles/InvoiceForm.css';

export function InvoiceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    clientId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    dueDate: '',
    notes: '',
    taxRate: 10,
  });

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsData = await clientsAPI.getAll();
        setClients(clientsData);

        if (isEdit) {
          const invoiceData = await invoicesAPI.getById(id);
          setFormData({
            clientId: invoiceData.clientId,
            items: invoiceData.items,
            dueDate: invoiceData.dueDate.split('T')[0],
            notes: invoiceData.notes || '',
            taxRate: invoiceData.taxRate ?? 10,
          });
        }
      } catch (err) {
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEdit, id]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'description' ? value : parseFloat(value) || 0;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.clientId || !formData.dueDate || formData.items.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (isEdit) {
        await invoicesAPI.update(id, formData);
      } else {
        await invoicesAPI.create(formData);
      }
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving invoice');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const subtotal = calculateTotal();
  const taxRate = parseFloat(formData.taxRate) || 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return (
    <div className="invoice-form-container">
      <div className="form-header">
        <button onClick={() => navigate('/invoices')} className="back-btn">← Back</button>
        <h2>{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="form-section">
          <h3>Invoice Details</h3>
          <div className="form-group">
            <label>Client *</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="form-input"
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Tax Rate (%) *</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Line Items</h3>
          <div className="items-list">
            {formData.items.map((item, index) => (
              <div key={index} className="item-row">
                <input
                  type="text"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="form-input"
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="form-input quantity"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  className="form-input price"
                  required
                />
                <span className="item-total">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="add-item-btn">
            + Add Item
          </button>
        </div>

        <div className="form-section">
          <h3>Notes</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any notes or payment terms..."
            className="form-textarea"
          />
        </div>

        <div className="totals-section">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Tax ({taxRate}%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="total-row grand-total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/invoices')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {isEdit ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
