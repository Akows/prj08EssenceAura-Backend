const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const rbbRoutes = require('./routes/rbbRoutes');
require('dotenv').config();

// CORS 설정: 허용되는 출처(origin)과 기타 설정들을 명시
const corsOptions = {
    origin: [
        'https://essence-aura.com', 
        'https://app.essence-aura.com',
        'http://essenceaura-production.s3-website.ap-northeast-2.amazonaws.com',
        'http://reactbubblebubble-production.s3-website.ap-northeast-2.amazonaws.com/',
        'https://react-bubble-bubble.vercel.app/',
    ],
    credentials: true, // 쿠키를 함께 보낼 수 있도록 허가
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE', // 허용되는 HTTP 메소드들
    allowedHeaders: ['Content-Type', 'Authorization'], // 허용되는 헤더들
};

// 모든 경로에 대한 OPTIONS 요청에 대해 CORS preflight 응답
app.options('*', cors(corsOptions));

// 모든 요청에 대한 CORS 미들웨어 설정을 적용
app.use(cors(corsOptions));

// JSON 요청 본문을 파싱하기 위한 미들웨어
app.use(express.json());

// 쿠키를 파싱하기 위한 미들웨어
app.use(cookieParser());

// 강화된 로깅 미들웨어
app.use((req, res, next) => {
    const start = new Date();
    let log = `${start.toISOString()} - ${req.method} Request to ${req.originalUrl}`;

    // 요청 헤더 및 바디 로깅
    log += `\nHeaders: ${JSON.stringify(req.headers)}`;
    log += `\nBody: ${JSON.stringify(req.body)}`;

    // 프로토콜 및 X-Forwarded-Proto 로깅
    log += `\nProtocol: ${req.protocol}`;
    log += `\nX-Forwarded-Proto: ${req.headers['x-forwarded-proto']}`;

    res.on('finish', () => {
        // 요청 처리 시간 계산
        const duration = new Date() - start;
        // 응답 상태 및 처리 시간 로깅
        log += `\nResponse: ${res.statusCode} - Duration: ${duration}ms`;
        console.log(log);
    });

    res.on('error', (err) => {
        // 오류 발생 시 로깅
        log += `\nResponse Error: ${err}`;
        console.error(log);
    });

    next();
});

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

// 버블버블라우트
app.use('/rbb', rbbRoutes);

module.exports = app;
