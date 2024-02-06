const db = require('../config/database');
const bcrypt = require('bcrypt');
const { DatabaseError, NotFoundError, ResourceConflictError } = require('../error/error');

// 모든 유저 정보 조회
const getAllUsers = async () => {
    try {
        const [users] = await db.query('SELECT user_id, username, email, address, phone_number, created_at, is_active FROM users WHERE is_active = 1');
        return users;
    } catch (error) {
        throw new DatabaseError('유저 정보 조회 중 오류 발생');
    }
};

// 특정 유저 정보 검색
const searchUserByEmail = async (emailKeyword) => {
    try {
        // '%' 와일드카드를 사용하여 부분 일치 검색.
        const query = `SELECT * FROM users WHERE email LIKE ? AND is_active = 1`;
        const values = [`%${emailKeyword}%`];
        const [users] = await db.query(query, values);

        if (users.length === 0) {
            throw new NotFoundError('검색 결과가 없습니다.');
        }
        return users;
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new DatabaseError('이메일로 유저 검색 중 오류 발생');
    }
};

// 유저 정보 수정
const updateUser = async (userId, userData) => {
    try {
        await db.query('UPDATE users SET ? WHERE user_id = ?', [userData, userId]);
    } catch (error) {
        throw new DatabaseError('유저 정보 업데이트 중 오류 발생');
    }
};

// 유저 비활성화 (is_active = false)
const deactivateUser = async (userId) => {
    try {
        await db.query('UPDATE users SET is_active = 0 WHERE user_id = ?', [userId]);
    } catch (error) {
        throw new DatabaseError('유저 비활성화 중 데이터베이스 오류가 발생했습니다.');
    }
};

// 관리자 전체 조회
const getAllAdmins = async () => {
    try {
        const [admins] = await db.query('SELECT admin_id, username, email, created_at FROM admins');
        return admins;
    } catch (error) {
        throw new DatabaseError('관리자 정보 조회 중 오류 발생');
    }
};

// 관리자 추가
const createAdmin = async (adminData) => {
    try {
        // 먼저 데이터베이스에서 이메일 주소가 이미 사용 중인지 확인.
        const [existingAdmins] = await db.query('SELECT * FROM admins WHERE email = ?', [adminData.email]);
        if (existingAdmins.length > 0) {
            throw new ResourceConflictError('이미 사용 중인 이메일 주소입니다.');
        }

        // 이메일 주소가 중복되지 않았다면, 관리자 계정을 생성.
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        await db.query('INSERT INTO admins (username, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW());', [adminData.username, adminData.email, hashedPassword]);
    } catch (error) {
        if (error instanceof ResourceConflictError) {
            throw error;
        }
        throw new DatabaseError('관리자 추가 중 오류 발생');
    }
};

// 관리자 정보 수정
const updateAdmin = async (adminId, adminData) => {
    try {
        await db.query('UPDATE admins SET ? WHERE admin_id = ?', [adminData, adminId]);
    } catch (error) {
        throw new DatabaseError('관리자 정보 수정 중 오류 발생');
    }
};

// 관리자 삭제
const deleteAdmin = async (adminId) => {
    try {
        await db.query('DELETE FROM admins WHERE admin_id = ?', [adminId]);
    } catch (error) {
        throw new DatabaseError('관리자 삭제 중 오류 발생');
    }
};

// 상품 가져오기
const getProducts = async () => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        return products;
    } catch (error) {
        console.error('상품 추가 중 오류 발생: ', error.sqlMessage); // 로깅
        throw new DatabaseError('상품 정보 조회 중 오류 발생');
    }
};


// 상품 추가
const addProduct = async (productData) => {
    try {
        // 현재 시간을 YYYY-MM-DD HH:MM:SS 형식으로 설정
        productData.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // 문자열 값으로 넘어오는 입력값을 소수 혹은 정수로 변환
        productData.price = parseFloat(productData.price);
        productData.stock = parseInt(productData.stock);
        productData.discount_rate = parseFloat(productData.discount_rate);

        const [result] = await db.query('INSERT INTO products SET ?', productData);
        return { product_id: result.insertId, ...productData };
    } catch (error) {
        console.error('상품 추가 중 오류 발생: ', error.sqlMessage); // 로깅
        throw new DatabaseError('상품 정보 추가 중 오류 발생');
    }
};

// 상품 정보 수정
const updateProduct = async (id, productData) => {
    try {
        await db.query('UPDATE products SET ? WHERE product_id = ?', [productData, id]);
        return { id, ...productData };
    } catch (error) {
        console.error('상품 추가 중 오류 발생: ', error.sqlMessage); // 로깅
        throw new DatabaseError('상품 정보 수정 중 오류 발생');
    }
};

// 상품 삭제
const deleteProduct = async (id) => {
    try {
        await db.query('DELETE FROM products WHERE product_id = ?', id);
        return id; // 삭제된 상품의 ID 반환
    } catch (error) {
        console.error('상품 추가 중 오류 발생: ', error.sqlMessage); // 로깅
        throw new DatabaseError('상품 삭제 중 오류 발생');
    }
};

// 내보내기
module.exports = {
    getAllUsers,
    searchUserByEmail,
    updateUser,
    deactivateUser,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getProducts,
    addProduct, 
    updateProduct,
    deleteProduct,
};