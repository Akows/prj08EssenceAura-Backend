// 사용자 회원가입 유효성 검사
const validateSignupData = (formData) => {
    const errors = {};

    // 빈 값 체크
    if (!formData.username.trim()) errors.username = '사용자 이름을 입력하세요.';
    if (!formData.email.trim()) errors.email = '이메일을 입력하세요.';
    if (!formData.password) errors.password = '비밀번호를 입력하세요.';
    if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    // 이메일 유효성 검사
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = '유효한 이메일 주소를 입력하세요.';
    }

    // 비밀번호 복잡성 검사
    if (formData.password.length < 6) {
        errors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    // 추가 유효성 검사...

    return errors;
};

// 사용자 로그인 유효성 검사
const validateLoginData = (formData) => {
    const errors = {};

    // 빈 값 체크
    if (!formData.email.trim()) errors.email = '이메일을 입력하세요.';
    if (!formData.password) errors.password = '비밀번호를 입력하세요.';

    // 이메일 유효성 검사
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = '유효한 이메일 주소를 입력하세요.';
    }

    return errors;
};

// 모듈 내보내기
module.exports = {
    validateSignupData,
    validateLoginData,
};
