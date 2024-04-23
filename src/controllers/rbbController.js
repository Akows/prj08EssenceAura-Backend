const { OAuth2Client } = require('google-auth-library');
const db = require('../config/database');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// 로그인 함수
exports.login = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();

        // payload에서 필요한 사용자 정보만 추출하여 세션에 저장
        // 사용자 식별을 위해 이메일 주소와 이름을, 프로필 표시를 위해 프로필 사진을 가져옴
        const user = {
            email: payload['email'],
            name: payload['name'],
            picture: payload['picture']
        };

        req.session.user = user;

        // 변경된 세션 정보를 명시적으로 저장
        req.session.save(err => {
            if (err) {
                console.log(err);
                throw err; // 에러가 발생하면 예외 처리
            }
            
            // 세션이 저장되었으니 클라이언트에 성공 메시지 전송
            res.status(200).json({ message: "로그인 성공", user: user });
        });
    } catch (error) {
        res.status(401).json({ message: "인증 실패", error: error.toString() });
    }
};

// 로그아웃 함수
exports.logout = (req, res) => {
    // // 세션 삭제
    // req.session.destroy((err) => {
    //     if (err) {
    //         return res.status(500).json({ message: "로그아웃 실패" });
    //     }

    //     // 쿠키 삭제
    //     res.clearCookie('session_cookie_name');
        
    //     // 클라이언트에 성공 메시지 전달
    //     res.status(200).json({ message: "로그아웃 성공" });
    // });

    res.status(200).json({ message: "로그아웃 성공" });
};

// 로그인 유효성 검사 함수
exports.verifyLogin = async (req, res) => {

    const { token } = req.body;

    if (token) {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
    
        const payload = ticket.getPayload();
    
        const user = {
            email: payload['email'],
            name: payload['name'],
            picture: payload['picture']
        };
    
        res.status(200).json({ message: "유효성 검사 통과", user: user });
    }
    else {
        res.status(200).json({ message: "유효성 검사 탈락" });
    }

    // if (req.session.user) {
    //     res.status(200).json({ isValid: true, user: req.session.user });
    // } else {
    //     res.status(401).json({ isValid: false, error: "유효하지 않은 세션입니다" });
    // }
};

exports.fetchAllContents = async (req, res) => {
    try {
      const { searchTerm: search, sortOrder = 'DESC', sortField = 'publishedDate', page = 1 } = req.query;
      const limit = 10; // 한 페이지당 컨텐츠 수
      const offset = (page - 1) * limit; // 현재 페이지의 첫 번째 컨텐츠 인덱스
      let queryParams = [];
      let query = 'SELECT * FROM RBBContents';
      let countQuery = 'SELECT COUNT(*) as total FROM RBBContents'; // 전체 개수를 구하는 쿼리
  
      // 검색 조건 적용
      if (search) {
        query += ` WHERE title LIKE ?`;
        countQuery += ` WHERE title LIKE ?`;
        queryParams.push(`%${search}%`);
      }
  
      // 정렬 조건 적용
      const validSortFields = ['title', 'publishedDate', 'contentId'];
      const validSortOrder = ['ASC', 'DESC'];
      if (validSortFields.includes(sortField) && validSortOrder.includes(sortOrder.toUpperCase())) {
        query += ` ORDER BY ${sortField} ${sortOrder}`;
      } else {
        query += ' ORDER BY publishedDate DESC'; // 기본 정렬
      }
  
      // 페이지네이션 적용
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
  
      // DB에서 데이터와 전체 개수 가져오기
      const [contents] = await db.query(query, queryParams);
      const [[{ total }]] = await db.query(countQuery, queryParams.slice(0, -2)); // 전체 개수 쿼리 (limit, offset 제외)
  
      res.status(200).json({ contents, total });
    } catch (error) {
      console.error('Failed to fetch contents:', error);
      res.status(500).send('Error fetching contents.');
    }
  };