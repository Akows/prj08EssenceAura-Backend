const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); // CORS 에러 방지
app.use(express.json()); // JSON 본문 파싱

// 환경 변수를 사용하여 MySQL 데이터베이스와 연결 설정
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// 데이터베이스 연결 확인
dbPool.connect(err => {
    if (err) {
        console.error('데이터베이스 연결에 이상이 발생함. ' + err.stack);
        return;
    }
    console.log('데이터베이스가 해당 Thread ID로 연결됨. ' + dbPool.threadId);
});

// DB 연결 확인용 임시 기능 코드.
app.post('/api/create', (req, res) => {
    // req.body에서 데이터 추출
    const testData = req.body.data; // 예제 데이터, 실제로는 클라이언트에서 보낸 데이터 구조에 맞춰야 합니다.

    // 데이터베이스에 삽입 쿼리 실행
    dbPool.query('INSERT INTO test_table (column_name) VALUES (?)', [testData], (err, results) => {
        if (err) {
            console.error('데이터 삽입 중 에러 발생', err);
            res.status(500).json({ message: '데이터를 삽입하는 동안 문제가 발생했습니다', error: err.message });
        } 
        else {
            res.status(200).json({ message: '데이터가 성공적으로 삽입되었습니다', data: results });
        }
    });
});

app.get('/api/getAll', (req, res) => {
    // 'SELECT' 쿼리를 사용하여 'test_table'의 모든 데이터를 가져옴
    db.query('SELECT * FROM test_table', (err, results) => {
        if (err) {
            // 쿼리 실행 중 에러가 발생한 경우
            console.error('데이터를 불러오는 중 에러 발생', err);
            res.status(500).json({ message: '데이터를 불러오는 중 문제가 발생했습니다', error: err.message });
            return;
        }
        // 성공적으로 데이터를 가져온 경우
        res.status(200).json({ message: '데이터 불러오기 성공', data: results });
    });
});

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 정상 동작중입니다..`);
});
