const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// db.connect(err => {
//     if (err) {
//         console.error('데이터베이스 연결 실패: ' + err.stack);
//         return;
//     }
//     console.log('데이터베이스 연결 성공, Thread ID: ' + db.threadId);
// });

module.exports = db;
