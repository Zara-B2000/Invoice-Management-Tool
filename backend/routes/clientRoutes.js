const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllClients, createClient, updateClient, deleteClient } = require('../controllers/clientController');

router.get('/', auth, getAllClients);
router.post('/', auth, createClient);
router.put('/:id', auth, updateClient);
router.delete('/:id', auth, deleteClient);

module.exports = router;
