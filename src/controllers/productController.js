const { DatabaseError, NotFoundError } = require('../error/error');
const { getProductById, getProducts, getTotalProductsCount, getSearchSuggestions, getTopSellingProductsByCategory } = require('../service/productService');

const getProductByIdHandler = async (req, res) => {
    try {
      const productId = req.params.productId;
      const product = await getProductById(productId);
  
      if (!product) {
        throw new NotFoundError('제품을 찾을 수 없습니다.');
      }
  
      res.json(product);
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(500).send({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).send({ message: error.message });
      } else {
        res.status(500).send({ message: '제품 정보 조회 중, 서버에서 오류가 발생하였습니다.' });
      }
    }
};

const getProductsHandler = async (req, res) => {
  try {
      // 쿼리 파라미터를 사용하여 페이지 정보와 기타 필터 옵션을 받습니다.
      const query = req.query;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const offset = (page - 1) * limit;

      // 전체 상품 개수를 가져옵니다.
      const totalProductsCount = await getTotalProductsCount(query);
      
      // 현재 페이지에 해당하는 상품 목록을 가져옵니다.
      const products = await getProducts({ ...query, limit, offset });

      // 클라이언트에 전체 상품 개수와 페이지에 해당하는 상품 목록을 함께 반환합니다.
      res.json({
          totalProducts: totalProductsCount,
          products,
          page,
          totalPages: Math.ceil(totalProductsCount / limit),
      });
  } catch (error) {
      if (error instanceof DatabaseError) {
          res.status(500).send({ message: error.message });
      } else {
          res.status(500).send({ message: '제품 목록 조회 중, 서버에서 오류가 발생하였습니다.' });
      }
  }
};

const getSearchSuggestionsHandler = async (req, res) => {
    try {
      // 쿼리 파라미터에서 검색 키워드를 추출합니다.
      const keyword = req.query.keyword;
      if (!keyword) {
        return res.status(400).json({ message: '검색 키워드가 필요합니다.' });
      }
  
      // 검색 서비스를 호출하여 제안을 가져옵니다.
      const suggestions = await getSearchSuggestions(keyword);
      res.json(suggestions);
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }
    }
};

const getTopSellingProductsByCategoryHandler = async (req, res) => {
  try {
    // 서비스 함수를 호출하여 각 카테고리별로 상위 8개의 상품을 가져옵니다.
    const topSellingProductsByCategory = await getTopSellingProductsByCategory();
    
    // 클라이언트에 결과를 반환합니다.
    res.json(topSellingProductsByCategory);
  } catch (error) {
    // 에러 처리
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getProductByIdHandler,
    getProductsHandler,
    getSearchSuggestionsHandler,
    getTopSellingProductsByCategoryHandler,
};
