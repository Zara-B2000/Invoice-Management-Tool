const { MongoClient } = require('mongodb');

let db;
let usersCollection, clientsCollection, invoicesCollection;

async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db();
    usersCollection = db.collection('users');
    clientsCollection = db.collection('clients');
    invoicesCollection = db.collection('invoices');

    // Create indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await clientsCollection.createIndex({ userId: 1 });
    await invoicesCollection.createIndex({ userId: 1 });
    await invoicesCollection.createIndex({ clientId: 1 });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

const getDB = () => db;
const getUsers = () => usersCollection;
const getClients = () => clientsCollection;
const getInvoices = () => invoicesCollection;

module.exports = { connectDB, getDB, getUsers, getClients, getInvoices };
