const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
require('dotenv').config();

// CORS 미들웨어 설정
const corsOptions = {
    origin: 'https://essence-aura.com',
    credentials: true, // 이 옵션을 통해 쿠키를 함께 보낼 수 있도록 허가
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// 로깅 미들웨어
// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} Request to ${req.originalUrl}`);
//     next();
// });

// 연결 테스트용 강화 로깅 미들웨어
app.use((req, res, next) => {
    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks = [];

    // 요청 로깅
    console.log(`${new Date().toISOString()} - ${req.method} Request to ${req.originalUrl}`);
    console.log(`Headers: ${JSON.stringify(req.headers)}`);
    console.log(`Body: ${JSON.stringify(req.body)}`);

    // 백엔드 요청 구분
    console.log(`Protocol: ${req.protocol}`);
    console.log(`X-Forwarded-Proto: ${req.headers['x-forwarded-proto']}`);

    res.write = function (chunk) {
        chunks.push(chunk);
        return oldWrite.apply(res, arguments);
    };

    res.end = function (chunk) {
        if (chunk) {
            chunks.push(chunk);
        }
        const responseBody = Buffer.concat(chunks).toString('utf8');
        
        // 응답 로깅
        console.log(`Response: ${res.statusCode} - ${responseBody}`);
        
        oldEnd.apply(res, arguments);
    };

    next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Health Check 라우트
app.get('/healthcheck', (req, res) => {
    res.status(200).send('Healthy');
});

// 계정 라우트 추가
app.use('/auth', authRoutes);

// 유저 라우트 추가
app.use('/user', userRoutes);

// 관리자 라우트 추가
app.use('/admin', adminRoutes);

// 제품 라우트 추가
app.use('/product', productRoutes);

// 주문 라우트 추가
app.use('/order', orderRoutes);

module.exports = app;
