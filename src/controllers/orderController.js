const { createOrder, processPayment } = require("../service/orderService");
const sendEmail = require("../utils/emailUtils");

const createOrderHandler = async (req, res) => {
    try {
        const { username, email, items, total_price } = req.body;
        
        const orderId = await createOrder(req.body);

        // 상품 목록을 HTML 리스트로 변환합니다.
        const itemListHtml = items.map(item => 
            `<li>${item.product_name} - 수량: ${item.quantity}, 가격: ${item.price}원</li>`
        ).join('');

        await sendEmail({
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: '향이 이끄는 곳으로, EssenceAura - 주문이 완료되었습니다.',
            html: `
                <h1>${username}님, 주문해주셔서 감사합니다.</h1>
                <p>주문 번호: ${orderId}</p>
                <p>주문 내역:</p>
                <ul>${itemListHtml}</ul>
                <p>총 가격: ${total_price.toLocaleString()}원</p>
                <p>빠른 시일 내로 배송을 완료하겠습니다.</p>
            `,
        });

        res.status(201).json({ message: '주문이 생성되었습니다.', orderId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '주문 생성 중 오류가 발생했습니다.', error: error.message });
    }
};

const processPaymentHandler = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const amount = req.body.amount;
        const paymentMethod = req.body.paymentMethod;

        const paymentId = await processPayment(orderId, amount, paymentMethod);

        res.status(201).json({ message: '결제가 성공적으로 처리되었습니다.', paymentId });
    } catch (error) {
        res.status(500).json({ message: '결제 처리 중 오류가 발생했습니다.', error: error.message });
    }
};

module.exports = {
    createOrderHandler,
    processPaymentHandler
};