const { ObjectId } = require('mongodb');
const { getInvoices } = require('../config/db');
const { invoiceSchema } = require('../validators/schemas');

// GET /api/invoices
const getAllInvoices = async (req, res) => {
  try {
    const invoicesCollection = getInvoices();
    const invoices = await invoicesCollection
      .find({ userId: new ObjectId(req.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  try {
    const invoicesCollection = getInvoices();
    const invoice = await invoicesCollection.findOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(req.userId),
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/invoices
const createInvoice = async (req, res) => {
  try {
    const { error, value } = invoiceSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const invoicesCollection = getInvoices();

    // Get next invoice number
    const lastInvoice = await invoicesCollection
      .findOne({ userId: new ObjectId(req.userId) }, { sort: { invoiceNumber: -1 } });
    const invoiceNumber = (lastInvoice?.invoiceNumber || 0) + 1;

    const items = value.items;
    const taxRate = value.taxRate ?? 10;
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const result = await invoicesCollection.insertOne({
      ...value,
      userId: new ObjectId(req.userId),
      clientId: new ObjectId(value.clientId),
      invoiceNumber,
      taxRate,
      subtotal,
      tax,
      total,
      status: 'draft',
      createdAt: new Date(),
    });

    res.status(201).json({
      _id: result.insertedId,
      ...value,
      invoiceNumber,
      subtotal,
      tax,
      total,
      status: 'draft',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/invoices/:id
const updateInvoice = async (req, res) => {
  try {
    const { error, value } = invoiceSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const items = value.items;
    const taxRate = value.taxRate ?? 10;
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const invoicesCollection = getInvoices();
    const result = await invoicesCollection.updateOne(
      { _id: new ObjectId(req.params.id), userId: new ObjectId(req.userId) },
      {
        $set: {
          ...value,
          clientId: new ObjectId(value.clientId),
          taxRate,
          subtotal,
          tax,
          total,
        }
      }
    );

    if (result.matchedCount === 0) return res.status(404).json({ message: 'Invoice not found' });

    res.json({ message: 'Invoice updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/invoices/:id/status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'sent', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const invoicesCollection = getInvoices();
    const result = await invoicesCollection.updateOne(
      { _id: new ObjectId(req.params.id), userId: new ObjectId(req.userId) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) return res.status(404).json({ message: 'Invoice not found' });

    res.json({ message: 'Invoice status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/invoices/:id
const deleteInvoice = async (req, res) => {
  try {
    const invoicesCollection = getInvoices();
    const result = await invoicesCollection.deleteOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(req.userId),
    });

    if (result.deletedCount === 0) return res.status(404).json({ message: 'Invoice not found' });

    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
};
