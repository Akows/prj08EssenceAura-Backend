const db = require('../config/database');

const getUserInfo = async (userId) => {
    const result = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    return result[0]; // 사용자 정보 반환
};

const updateUserInfo = async (userId, updateData) => {
    await db.query('UPDATE users SET ? WHERE user_id = ?', [updateData, userId]);
    // 업데이트된 정보를 반환하지 않고, 성공 메시지만 반환합니다.
};

const getOrdersByUserId = async (userId) => {
    try {
        const orders = await db.query(
            'SELECT * FROM orders WHERE user_id = ?',
            [userId]
        );
        return orders;
    } catch (error) {
        console.log(error);
        throw new Error('주문 내역 조회 중 데이터베이스 오류가 발생했습니다.');
    }
};

module.exports = {
    getUserInfo,
    updateUserInfo,
    getOrdersByUserId,
};
