const jwt = require('jsonwebtoken');

// 액세스 토큰 검증 미들웨어
const authenticateAccessToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" 형식에서 토큰 추출
  
  // 인증 토큰이 없는 경우..
  if (token == null) {
    return res.sendStatus(401); 
  }

  // 토큰이 유효하지 않은 경우..
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); 
    }

    req.user = user;
    next(); 
    // 문제가 없으면, 다음 미들웨어로 이동
  });
};

// 리프래시 토큰 검증 미들웨어
const authenticateRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies['refreshToken']; // 쿠키에서 리프레시 토큰 추출

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
};

// 내보내기
module.exports = {
  authenticateAccessToken,
  authenticateRefreshToken
};
