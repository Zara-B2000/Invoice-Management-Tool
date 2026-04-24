const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} = require('../controllers/invoiceController');

router.get('/', auth, getAllInvoices);
router.get('/:id', auth, getInvoiceById);
router.post('/', auth, createInvoice);
router.put('/:id', auth, updateInvoice);
router.patch('/:id/status', auth, updateInvoiceStatus);
router.delete('/:id', auth, deleteInvoice);

module.exports = router;
