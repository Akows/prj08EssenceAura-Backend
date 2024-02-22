const express = require('express');
const authController = require('../controllers/authController');
const { authenticateRefreshToken, authenticateAccessToken } = require('../middleware/authenticateToken');
const router = express.Router();

// 사용자 회원가입
router.post('/signup', authController.signUpHandler);

// 이메일 중복검사
router.post('/check-email', authController.checkEmailHandler);

// 사용자 로그인
router.post('/login', authController.loginHandler);

// 사용자 로그아웃 - 리프래시 토큰
router.post('/logout', authenticateRefreshToken, authController.logoutHandler);

// 사용자 로그인 상태 검증 - 액세스 토큰 검증.
router.post('/check-auth', authenticateAccessToken, authController.checkAuthHandler);

// 액세스 토큰 재발급 - 리프래시 토큰 검증.
router.get('/refresh-token', authenticateRefreshToken, authController.refreshTokenHandler);

// 이메일 찾기 라우트
router.post('/find-email', authController.findEmailHandler);

// 이메일 인증 발송 라우트
router.post('/verify-email', authController.sendVerificationEmailHandler);

// 이메일 인증 코드 검증 라우트
router.post('/verify-code', authController.verifyEmailCodeHandler);

// 회원가입 취소 라우트
router.post('/cancel-signup', authController.cancelSignUpHandler);

// 비밀번호 재설정 이메일 인증 코드 발송
router.post('/password-reset/request', authController.sendPasswordResetEmailHandler);

// 비밀번호 재설정 - 인증 코드 검증 및 비밀번호 변경
router.post('/password-reset/verify', authController.verifyAndResetPasswordHandler);

// 비밀번호 재설정 취소 라우트
router.post('/cancel-passwordreset', authController.cancelResetPasswordHandler);

module.exports = router;
