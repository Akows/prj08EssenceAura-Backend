const express = require('express');
const rbbController = require('../controllers/rbbController');
const router = express.Router();

router.post('/users/login', rbbController.login);
router.post('/users/logout', rbbController.logout);
router.get('/users/verifylogin', rbbController.verifyLogin);
router.get('/contents/fetchContents', rbbController.fetchAllContents);

module.exports = router;
