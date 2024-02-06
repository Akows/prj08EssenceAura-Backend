const db = require("../config/database");
const jwt = require('jsonwebtoken');

// 데이터베이스에서 제공된 리프래시 토큰의 유효성을 확인
async function verifyRefreshTokenInDatabase(token) {
    try {
        // 데이터베이스에서 토큰을 조회하여 is_admin 값을 함께 가져옵니다.
        const [rows] = await db.query("SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()", [token]);
        
        if (rows.length > 0) {
            const { is_admin } = rows[0];
            
            // is_admin 값에 따라 user_id 또는 admin_id를 반환합니다.
            return { isValid: true, is_admin };
        }
        return { isValid: false };
    } catch (error) {
        console.error("리프래시 토큰 검증 중 오류 발생:", error);
        throw error;
    }
}

// 액세스 토큰 생성 함수
function generateAccessToken({id, isAdmin}) {

    // isAdmin의 값에 따라 user 객체 내의 적절한 id 필드 이름을 결정
    const idFieldName = isAdmin ? 'admin_id' : 'user_id';

    // id가 제대로 설정되었는지 확인
    if (id === undefined) {
        throw new Error(`ID 값이 '${idFieldName}' 필드에 존재하지 않습니다.`);
    }

    const claims = { id, isAdmin };

    // 토큰 생성
    const token = jwt.sign(claims, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    return token;
}

// 리프래시 토큰 생성 함수
function generateRefreshToken({id, isAdmin}) {

    const idFieldName = isAdmin ? 'admin_id' : 'user_id';

    if (id === undefined) {
        throw new Error(`ID 값이 '${idFieldName}' 필드에 존재하지 않습니다.`);
    }

    const claims = { id, isAdmin };

    const token = jwt.sign(claims, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    
    return token;
}

// 모듈 내보내기
module.exports = {
    verifyRefreshTokenInDatabase,
    generateAccessToken,
    generateRefreshToken,
};