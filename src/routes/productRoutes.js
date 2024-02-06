const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

// 단일 제품 조회 라우트
router.get('/fetchProduct/:productId', productController.getProductByIdHandler);

// 복수 제품 조회 라우트
router.get('/fetchProducts', productController.getProductsHandler);

// 검색 제안 라우트
router.get('/suggestions', productController.getSearchSuggestionsHandler);

// 카테고리별 최대 판매량 상품 조회 라우트
router.get('/topSellingByCategory', productController.getTopSellingProductsByCategoryHandler);

module.exports = router;
