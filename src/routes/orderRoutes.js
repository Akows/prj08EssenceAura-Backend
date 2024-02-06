const express = require('express');
const orderController = require('../controllers/orderController');
const router = express.Router();

router.post('/createOrder', orderController.createOrderHandler);

router.post('/processPayment', orderController.processPaymentHandler);

module.exports = router;
