const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateRefreshToken } = require('../middleware/authenticateToken');
const router = express.Router();

// 일반 회원 관리 라우트
router.get('/getusers', authenticateRefreshToken, adminController.getAllUsersHandler);
router.get('/searchUser/:id', authenticateRefreshToken, adminController.searchUserByEmailHandler);
router.put('/putusers/:id', authenticateRefreshToken, adminController.updateUserHandler);
router.patch('/patchusers/:id/deactivate', authenticateRefreshToken, adminController.deactivateUserHandler);

// 관리자 관리 라우트
router.get('/getadmins', authenticateRefreshToken, adminController.getAllAdminsHandler);
router.post('/postadmins', authenticateRefreshToken, adminController.createAdminHandler);
router.put('/putadmins/:id', authenticateRefreshToken, adminController.updateAdminHandler);
router.delete('/deleteadmins/:id', authenticateRefreshToken, adminController.deleteAdminHandler);

// 상품 목록 가져오기
router.get('/fetchProducts', adminController.getProductsHandler);

// 상품 추가
router.post('/addProduct', adminController.addProductHandler);

// 상품 수정
router.put('/updateProduct/:id', adminController.updateProductHandler);

// 상품 삭제
router.delete('/deleteProduct/:id', adminController.deleteProductHandler);

module.exports = router;
