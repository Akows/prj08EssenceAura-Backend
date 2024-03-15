class ApplicationError extends Error {
    constructor(message, status, code) {
        super(message); // 기본 Error 클래스의 생성자 호출
        this.status = status; // HTTP 상태 코드 (예: 404, 500)
        this.code = code; // 내부적으로 사용할 오류 코드
        this.name = this.constructor.name; // 오류 이름 설정
        Error.captureStackTrace(this, this.constructor); // 스택 추적을 캡처
    }
}

class DatabaseError extends ApplicationError {
    constructor(message = '데이터베이스 오류가 발생했습니다.', code = 'DB_ERROR') {
        super(message, 500, code);
    }
}

class DatabaseConnectionError extends DatabaseError {
    constructor(message = '데이터베이스 연결에 실패했습니다.', code = 'DB_CONNECTION_ERROR') {
        super(message, 500, code);
    }
}

class DatabaseOperationError extends DatabaseError {
    constructor(message = '데이터베이스 작업 중 오류가 발생했습니다.', code = 'DB_OPERATION_ERROR') {
        super(message, 500, code);
    }
}

class AuthenticationError extends ApplicationError {
    constructor(message = '인증 오류가 발생했습니다.', code = 'AUTH_ERROR') {
        super(message, 401, code);
    }
}

class AuthorizationError extends ApplicationError {
    constructor(message = '권한이 없습니다.', code = 'AUTHORIZATION_ERROR') {
        super(message, 403, code);
    }
}

class ValidationError extends ApplicationError {
    constructor(message = '입력 값이 유효하지 않습니다.', code = 'VALIDATION_ERROR') {
        super(message, 400, code);
    }
}

class DataIntegrityError extends ApplicationError {
    constructor(message = '데이터 무결성 오류가 발생했습니다.', code = 'DATA_INTEGRITY_ERROR') {
        super(message, 400, code);
    }
}

class NotFoundError extends ApplicationError {
    constructor(message = '리소스를 찾을 수 없습니다.', code = 'NOT_FOUND') {
        super(message, 404, code);
    }
}

class ResourceConflictError extends ApplicationError {
    constructor(message = '리소스 충돌이 발생했습니다.', code = 'RESOURCE_CONFLICT_ERROR') {
        super(message, 409, code);
    }
}

class ResourceNotFoundError extends NotFoundError {
    constructor(message = '요청한 리소스를 찾을 수 없습니다.', code = 'RESOURCE_NOT_FOUND_ERROR') {
        super(message, code);
    }
}

module.exports = {
    ApplicationError,
    DatabaseError,
    DatabaseConnectionError,
    DatabaseOperationError,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    DataIntegrityError,
    NotFoundError,
    ResourceConflictError,
    ResourceNotFoundError,
};
