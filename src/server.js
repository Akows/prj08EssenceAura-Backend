const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); // CORS 에러 방지
app.use(express.json()); // JSON 본문 파싱

// 환경 변수를 사용하여 MySQL 데이터베이스와 연결 설정
const db = mysql.createConnection({
    host: process.env.DB_HOST,      // .env 파일에서 DB_HOST 변수 사용
    user: process.env.DB_USER,      // .env 파일에서 DB_USER 변수 사용
    password: process.env.DB_PASSWORD,  // .env 파일에서 DB_PASSWORD 변수 사용
    database: process.env.DB_NAME       // .env 파일에서 DB_NAME 변수 사용
});

// 데이터베이스 연결 확인
db.connect(err => {
    if (err) {
        console.error('데이터베이스 연결에 이상이 발생함. ' + err.stack);
        return;
    }
    console.log('데이터베이스가 해당 Thread ID로 연결됨. ' + db.threadId);
});

app.post('/api/create', (req, res) => {
    // req.body에서 데이터 추출
    const testData = req.body.data; // 예제 데이터, 실제로는 클라이언트에서 보낸 데이터 구조에 맞춰야 합니다.

    // 데이터베이스에 삽입 쿼리 실행
    db.query('INSERT INTO test_table (column_name) VALUES (?)', [testData], (err, results) => {
        if (err) {
            console.error('Error during the insert query', err);
            res.status(500).send('Error during the insert query');
        } else {
            res.status(200).send('Data inserted successfully');
        }
    });
});


// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 정상 동작중입니다..`);
});
