const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateAccessToken } = require('../middleware/authenticateToken');

// 유저 정보 조회
router.post('/get-userinfo', authenticateAccessToken, userController.getUserInfoHandler);

// 유저 정보 수정
router.put('/update-userinfo', authenticateAccessToken, userController.updateUserInfoHandler);

// 주문 정보 조회.
router.post('/get-orderinfo', authenticateAccessToken, userController.getOrdersByUserIdHandler);

module.exports = router;