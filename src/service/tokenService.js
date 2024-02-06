const db = require('../config/database');
const crypto = require('crypto');

const saveRefreshToken = async (userId, refreshToken, isAdmin) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

  // isAdmin에 따라 user_id 또는 admin_id 컬럼에 값을 저장
  const column = isAdmin ? 'admin_id' : 'user_id';
  await db.query(`INSERT INTO refresh_tokens (${column}, token, expires_at, is_admin) VALUES (?, ?, ?, ?)`, 
                 [userId, refreshToken, expiresAt, isAdmin]);
};

// 리프레시 토큰 무효화 함수
const invalidateRefreshToken = async (userId, isAdmin) => {
  // isAdmin에 따라 user_id 또는 admin_id 컬럼을 사용하여 토큰을 삭제
  const column = isAdmin ? 'admin_id' : 'user_id';
  await db.query(`DELETE FROM refresh_tokens WHERE ${column} = ?`, [userId]);
};

// 만료된 토큰을 자동으로 제거하는 함수 (사용 방법 고민중..)
const cleanUpExpiredTokens = async () => {
  await db.query("DELETE FROM refresh_tokens WHERE expires_at < NOW()");
};


// 비밀번호 재설정 토큰 생성 및 저장 함수 (로직 변경으로 미사용)
const savePasswordResetToken = async (userId) => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1시간 후 만료

  await db.query(`INSERT INTO password_reset_requests (user_id, token, created_at, expires_at) VALUES (?, ?, NOW(), ?)`, [userId, resetToken, expiresAt]);

  return resetToken;
};

// 비밀번호 재설정 토큰 검증 함수 (로직 변경으로 미사용)
const verifyPasswordResetToken = async (token) => {
  const [rows] = await db.query(`SELECT user_id FROM password_reset_requests WHERE token = ? AND expires_at > NOW()`, [token]);
  
  return rows.length ? rows[0].user_id : null;
};

// 비밀번호 재설정 토큰 무효화 함수 (로직 변경으로 미사용)
const invalidatePasswordResetToken = async (token) => {
  await db.query(`DELETE FROM password_reset_requests WHERE token = ?`, [token]);
};

// 만료된 비밀번호 재설정 토큰 정리 함수 (로직 변경으로 미사용)
const cleanupExpiredPasswordResetTokens = async () => {
  await db.query("DELETE FROM password_reset_requests WHERE expires_at < NOW()");
};

module.exports = {
  saveRefreshToken,
  invalidateRefreshToken,
  cleanUpExpiredTokens,
  savePasswordResetToken,
  verifyPasswordResetToken,
  invalidatePasswordResetToken,
  cleanupExpiredPasswordResetTokens,
};
