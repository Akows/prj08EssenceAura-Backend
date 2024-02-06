const db = require('../config/database');

const createOrder = async (data) => {
    try {
        const user_id = data.user_id;
        const total_price = data.total_price; // 전체 주문 금액
        const discount_amount = data.discount_amount || 0; // 할인 금액, 없으면 0
        const delivery_address = data.delivery_address; // 배송 주소
        const order_items = JSON.stringify(data.items); // 주문 상품 정보를 JSON으로 변환

        const orderResult = await db.query(
            'INSERT INTO orders (user_id, total_price, discount_amount, delivery_address, order_items, status, created_at) VALUES (?, ?, ?, ?, ?, "PENDING", NOW())',
            [user_id, total_price, discount_amount, delivery_address, order_items]
        );

        const orderId = orderResult[0].insertId;
        return orderId;
    } catch (error) {
        console.log(error);
        throw new Error('주문 생성 중 데이터베이스 오류가 발생했습니다.');
    }
};

const processPayment = async (orderId, amount, paymentMethod) => {
    // 결제 데이터를 데이터베이스에 저장하는 로직
    try {
        const paymentResult = await db.query(
            'INSERT INTO payments (order_id, amount, payment_method, paid_at, payment_status) VALUES (?, ?, ?, NOW(), "SUCCESS")',
            [orderId, amount, paymentMethod]
        );

        return paymentResult.insertId;
    } catch (error) {
        throw new Error('결제 처리 중 데이터베이스 오류가 발생했습니다.');
    }
};

module.exports = {
    createOrder,
    processPayment
};