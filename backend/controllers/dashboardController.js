const { ObjectId } = require('mongodb');
const { getInvoices, getClients } = require('../config/db');

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const userId = new ObjectId(req.userId);

    const invoicesCollection = getInvoices();
    const clientsCollection = getClients();

    const invoices = await invoicesCollection.find({ userId }).toArray();
    const clients = await clientsCollection.find({ userId }).toArray();

    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    const pendingAmount = invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalClients = clients.length;

    res.json({
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      totalClients,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats };
