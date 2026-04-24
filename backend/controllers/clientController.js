const { ObjectId } = require('mongodb');
const { getClients } = require('../config/db');
const { clientSchema } = require('../validators/schemas');

// GET /api/clients
const getAllClients = async (req, res) => {
  try {
    const clientsCollection = getClients();
    const clients = await clientsCollection.find({ userId: new ObjectId(req.userId) }).toArray();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/clients
const createClient = async (req, res) => {
  try {
    const { error, value } = clientSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const clientsCollection = getClients();
    const result = await clientsCollection.insertOne({
      ...value,
      userId: new ObjectId(req.userId),
      createdAt: new Date(),
    });

    res.status(201).json({ _id: result.insertedId, ...value });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/clients/:id
const updateClient = async (req, res) => {
  try {
    const { error, value } = clientSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const clientsCollection = getClients();
    const result = await clientsCollection.updateOne(
      { _id: new ObjectId(req.params.id), userId: new ObjectId(req.userId) },
      { $set: value }
    );

    if (result.matchedCount === 0) return res.status(404).json({ message: 'Client not found' });

    res.json({ message: 'Client updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/clients/:id
const deleteClient = async (req, res) => {
  try {
    const clientsCollection = getClients();
    const result = await clientsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(req.userId),
    });

    if (result.deletedCount === 0) return res.status(404).json({ message: 'Client not found' });

    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllClients, createClient, updateClient, deleteClient };
