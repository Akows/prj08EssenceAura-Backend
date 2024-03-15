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

    // 비밀번호 길이 및 복잡성 검증
    if (formData.password.length < 8 || !/\d/.test(formData.password) || !/[A-Z]/.test(formData.password)) {
        errors.password = '비밀번호는 최소 8자 이상이며, 하나 이상의 숫자와 대문자를 포함해야 합니다.';
    }

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
