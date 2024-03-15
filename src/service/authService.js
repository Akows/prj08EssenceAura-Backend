const db = require("../config/database");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { savePasswordResetToken } = require("./tokenService");

// 사용자와 관련된 토큰 정보 조회 함수
// userId: 사용자 ID, isAdmin: 관리자 여부
const getUserAndTokenInfo = async (userId, isAdmin) => {
    try {
        // isAdmin을 사용하여 적절한 테이블에서 사용자 정보 조회
        const userTable = isAdmin ? 'admins' : 'users';
        const userIdField = isAdmin ? 'admin_id' : 'user_id';
        const userQuery = `SELECT * FROM ${userTable} WHERE ${userIdField} = ?`;

        const [userRows] = await db.query(userQuery, [userId]);

        if (userRows.length === 0) {
            return null;
        }

        const user = userRows[0];
        
        return { user };
    } catch (error) {
        console.error("데이터베이스 조회 중 오류 발생:", error);
        // 여기서 에러를 던지지 않고, 적절히 처리(예: null 반환)
        return null;
    }
}

/**
 * 이메일 중복 확인 함수
 * 사용자가 입력한 이메일이 데이터베이스에 이미 저장되어 있는지 확인합니다.
 * 
 * @param {string} email - 중복 확인을 위해 사용자가 입력한 이메일 주소입니다.
 * @returns {Promise<boolean>} 이메일이 사용 중이지 않으면 true를, 사용 중이면 false를 반환합니다.
 */
const checkEmailAvailability = async (email) => {
    try {
        // 사용자 테이블에서 주어진 이메일의 개수를 확인하는 쿼리입니다.
        const query = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
        // SQL 인젝션을 방지하기 위해 파라미터화된 쿼리를 사용합니다.
        const [rows] = await db.query(query, [email]);
        // 이메일이 사용 중이지 않으면 (count가 0이면) true를 반환합니다.
        return rows[0].count === 0;
    } catch (error) {
        console.error('이메일 중복 검사 DB 오류:', error);
        throw error;
    }
};

// 사용자 정보 조회 함수 (이메일 기준)
// email: 조회할 사용자의 이메일
const getUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = ?`;

    try {
        const [rows] = await db.query(query, [email]);
        if (rows.length > 0) {
            return rows[0]; // 유저가 존재하는 경우 해당 유저 정보 반환
        } else {
            return null; // 유저가 존재하지 않는 경우 null 반환
        }
    } catch (error) {
        console.error("데이터베이스 조회 중 오류 발생:", error);
        return null; // 데이터베이스 조회 중 오류 발생시 null 반환
    }
}

const getAdminByEmail = async (email) => {
    const query = `SELECT * FROM admins WHERE email = ?`;

    try {
        const [rows] = await db.query(query, [email]);
        if (rows.length > 0) {
            return rows[0]; // 관리자가 존재하는 경우 해당 유저 정보 반환
        } else {
            return null; // 관리자가 존재하지 않는 경우 null 반환
        }
    } catch (error) {
        console.error("데이터베이스 조회 중 오류 발생:", error);
        return null; // 데이터베이스 조회 중 오류 발생시 null 반환
    }
}

// 사용자 비밀번호 유효성 검증 함수
// email: 사용자 이메일, password: 확인할 비밀번호, isAdmin: 관리자 여부
const validateUserPassword = async (email, password, isAdmin) => {
    let result; 

    // 관리자 여부를 확인하여 어느 테이블에서 정보를 조회해야하는지 확인.
    if (isAdmin) {
        result = await getAdminByEmail(email);
    }
    else {
        result = await getUserByEmail(email);
    }

    // 조회된 정보가 없으면 false를 반환.
    if (!result) {
        return false;
    }

    const isValid = await bcrypt.compare(password, result.password);
    return isValid ? result : null;
}

/**
 * 임시 회원 정보 생성 함수
 * 이메일 인증 과정 중에 데이터베이스에 임시 사용자를 생성합니다.
 * 
 * @param {string} email - 임시 사용자를 생성하기 위한 이메일 주소입니다.
 * @returns {Promise<number>} 생성된 임시 사용자의 ID를 반환합니다.
 */
const createUserTemp = async (email) => {
    try {
        // 임시 비밀번호
        const tempPassword = 'tempPassword'; 
        const query = `
            INSERT INTO users (email, password, created_at, updated_at, is_active, is_verified)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 0)
        `;
        // 임시 사용자 데이터를 삽입하는 쿼리를 실행합니다.
        const result = await db.execute(query, [email, tempPassword]);

        // 삽입된 임시 사용자의 ID를 반환합니다.
        return result[0].insertId; 
    } catch (error) {
        console.error("임시 사용자 데이터 저장 중 오류 발생:", error);
        throw error;
    }
}

// 임시 회원 정보 삭제 함수 - 트랜잭션 사용
// email: 삭제할 임시 회원의 이메일 주소
const deleteTempUser = async (email) => {
    // 데이터베이스 연결 풀에서 연결을 가져옴
    const connection = await db.getConnection();
    try {
        // 트랜잭션 시작
        await connection.beginTransaction();

        // 먼저 email_verification 테이블에서 해당 이메일과 관련된 레코드를 삭제
        // 이 작업은 users 테이블의 레코드를 참조하는 외래 키 제약 조건을 해결하기 위함임
        const deleteEmailVerification = `DELETE FROM email_verification WHERE email = ?; `;
        await connection.query(deleteEmailVerification, [email]);

        // email_verification 테이블에서 레코드를 성공적으로 삭제한 후,
        // users 테이블에서 해당 이메일을 가진 사용자를 삭제
        // is_verified가 0인 사용자만 삭제하여 임시 사용자를 타겟팅함
        const deleteUser = `
            DELETE FROM users
            WHERE email = ? AND is_verified = 0;
        `;
        await connection.query(deleteUser, [email]);

        // 모든 쿼리가 성공적으로 실행되면 트랜잭션을 커밋함
        await connection.commit();
    } catch (error) {
        // 오류가 발생하면 트랜잭션을 롤백하여 데이터베이스의 일관성 유지
        await connection.rollback();
        console.error("임시 사용자 데이터 삭제 중 오류 발생:", error);
        throw error;
    } finally {
        // 작업이 완료되면 데이터베이스 연결을 풀로 반환
        connection.release();
    }
};

/**
 * 실제 사용자 정보 업데이트 함수
 * 회원가입이 완료되면 사용자의 정보를 데이터베이스에 업데이트합니다.
 * 
 * @param {string} email - 업데이트할 사용자의 이메일 주소입니다.
 * @param {Object} userData - 사용자의 새로운 정보를 담은 객체입니다. 
 *                            이 객체에는 사용자 이름, 비밀번호, 주소 등이 포함됩니다.
 * @returns {Promise<void>}
 */
const updateUser = async (email, userData) => {
    const { username, password, address, building_name, phone_number } = userData;

    try {
        // 보안을 위해 사용자의 비밀번호를 해시 처리합니다.
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            UPDATE users
            SET username = ?, password = ?, address = ?, building_name = ?, phone_number = ?, updated_at = CURRENT_TIMESTAMP, is_active = 1, is_verified = 1
            WHERE email = ?
        `;

        // 제공된 사용자 데이터로 업데이트 쿼리를 실행합니다.
        await db.execute(query, [username, hashedPassword, address, building_name, phone_number, email]);
    } catch (error) {
        console.error("사용자 데이터 업데이트 중 오류 발생:", error);
        throw error;
    }
}

// 이메일 찾기 함수
const findEmailByNameAndPhone = async (name, phone) => {
    try {
        const query = 'SELECT email FROM users WHERE username = ? AND phone_number = ?';
        const [users] = await db.query(query, [name, phone]);

        if (users.length > 0) {
            return users[0].email;
        } else {
            return null;
        }
    } catch (error) {
        console.error('이메일 찾기 중 오류 발생', error);
        throw error;
    }
};

// 이메일 인증 여부 확인 함수
const checkEmailVerified = async (email) => {
    const query = 'SELECT is_verified FROM users WHERE email = ?';
    const [results] = await db.query(query, [email]);

    // 이메일 주소가 존재하고 인증된 상태인지 확인
    if (results.length > 0 && results[0].is_verified) {
        return true;
    } else {
        return false;
    }
};

// 인증 코드 생성 및 저장 함수
const createVerificationCode = async (email, userId) => {
    // 인증 코드 생성 (예: 랜덤 문자열)
    const verificationCode = crypto.randomBytes(16).toString('hex');

    // 최근 5분 이내에 생성된 인증 코드가 있는지 확인
    const existingCodeQuery = `
        SELECT expires_at FROM email_verification
        WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `;
    const [existingCodes] = await db.query(existingCodeQuery, [email]);

    // 최근 5분 이내에 생성된 인증 코드가 있다면 오류를 발생시키고 함수 실행을 중지
    if (existingCodes.length > 0) {
        return { error: '인증 재시도는 5분 후에 가능합니다.' };
    }

    // 생성된 코드를 데이터베이스에 저장
    const insertQuery = `
        INSERT INTO email_verification (user_id, email, code, created_at, expires_at)
        VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 5 MINUTE))
    `;
    await db.query(insertQuery, [userId, email, verificationCode]);

    return verificationCode;
};

// 인증 코드 검증 함수
const verifyVerificationCode = async (email, code) => {

    // 데이터베이스에서 인증 코드 확인
    const selectQuery = `
        SELECT * FROM email_verification
        WHERE email = ? AND code = ? AND expires_at > NOW()
    `;
    const [results] = await db.query(selectQuery, [email, code]);

    // 인증 코드가 데이터베이스에 존재하면 true 반환
    if (results.length > 0) {
        // 인증이 완료되면 해당 레코드 삭제
        const deleteQuery = `DELETE FROM email_verification WHERE email = ?`;
        await db.query(deleteQuery, [email]);

        // 사용자의 is_verified 상태를 true로 업데이트
        const updateQuery = `UPDATE users SET is_verified = 1 WHERE email = ?`;
        await db.query(updateQuery, [email]);

        return true;
    } else {
        return false;
    }
};

// 비밀번호 재설정 함수
const updateUserPassword = async (email, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = 'UPDATE users SET password = ? WHERE email = ?';
    await db.query(query, [hashedPassword, email]);
};

// 비밀번호 재설정 취소 함수
const deleteVerificationInfo = async (email, user_id) => {
    // 데이터베이스 연결 풀에서 연결을 가져옴
    const connection = await db.getConnection();
    try {
        // 트랜잭션 시작
        await connection.beginTransaction();

        // 먼저 email_verification 테이블에서 해당 이메일과 관련된 레코드를 삭제
        // 이 작업은 users 테이블의 레코드를 참조하는 외래 키 제약 조건을 해결하기 위함임
        const deleteVerificationInfo = `DELETE FROM email_verification WHERE email = ? AND user_id = ?;`;
        await connection.query(deleteVerificationInfo, [email, user_id]);

        // 모든 쿼리가 성공적으로 실행되면 트랜잭션을 커밋함
        await connection.commit();
    } catch (error) {
        // 오류가 발생하면 트랜잭션을 롤백하여 데이터베이스의 일관성 유지
        await connection.rollback();
        console.error("임시 사용자 데이터 삭제 중 오류 발생:", error);
        throw error;
    } finally {
        // 작업이 완료되면 데이터베이스 연결을 풀로 반환
        connection.release();
    }
};

// DB 정리 함수들.
// 사용자가 임의로 호출하는게 아닌, 백엔드에서 주기적으로 자동 호출하도록 구현해야함.
// 주기적인 임시 사용자 데이터 삭제 로직 (미사용)
const cleanUpTempUsers = async () => {
    // 예: 인증받지 못한 사용자 데이터를 48시간 후에 삭제
    const query = `
        DELETE FROM users
        WHERE is_verified = 0 AND created_at < NOW() - INTERVAL 48 HOUR
    `;

    try {
        await db.execute(query);
        console.log('임시 사용자 데이터가 정리되었습니다.');
    } catch (error) {
        console.error('임시 사용자 데이터 정리 중 에러:', error);
    }
};
// 인증코드 자동 정리 함수 (미사용)
const cleanUpExpiredVerificationCodes = async () => {
    const query = `
        DELETE FROM email_verification
        WHERE expires_at < NOW()
    `;

    try {
        await db.execute(query);
        console.log('만료된 인증 코드가 정리되었습니다.');
    } catch (error) {
        console.error('만료된 인증 코드 정리 중 오류 발생:', error);
    }
};

module.exports = {
    getUserAndTokenInfo,
    checkEmailAvailability,
    getUserByEmail,
    validateUserPassword,
    createUserTemp,
    deleteTempUser,
    updateUser,
    cleanUpTempUsers,
    findEmailByNameAndPhone,
    checkEmailVerified,
    createVerificationCode,
    verifyVerificationCode,
    cleanUpExpiredVerificationCodes,
    updateUserPassword,
    deleteVerificationInfo,
};
