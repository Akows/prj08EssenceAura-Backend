const { getAllUsers, searchUserByEmail, updateUser, deactivateUser, getAllAdmins, createAdmin, updateAdmin, deleteAdmin, updateProduct, deleteProduct, addProduct, getProducts } = require("../service/adminService");
const { DatabaseError, NotFoundError, ResourceConflictError } = require("../error/error");

// 모든 유저 정보 조회
const getAllUsersHandler = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        if (error instanceof DatabaseError) {
            res.status(500).send({ message: error.message });
        } else {
            res.status(500).send({ message: '유저 정보 조회 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};

// 특정 유저 정보 검색
const searchUserByEmailHandler = async (req, res) => {
    const emailKeyword = req.query.email;
    if (!emailKeyword) {
        return res.status(400).send({ message: '검색 키워드가 제공되지 않았습니다.' });
    }
    try {
        const users = await searchUserByEmail(emailKeyword);
        res.json(users);
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).send({ message: error.message });
        } else if (error instanceof DatabaseError) {
            res.status(500).send({ message: error.message });
        } else {
            res.status(500).send({ message: '유저 정보 검색 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};

// 유저 정보 수정
const updateUserHandler = async (req, res) => {
    try {
        await updateUser(req.params.id, req.body);
        res.send({ message: '유저 정보가 성공적으로 업데이트되었습니다.' });
    } catch (error) {
        if (error instanceof DatabaseError) {
            res.status(500).send({ message: error.message });
        } else {
            res.status(500).send({ message: '유저 정보 수정 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};

// 유저 비활성화 핸들러
const deactivateUserHandler = async (req, res) => {
    try {
        await deactivateUser(req.params.id);
        res.send({ message: '유저가 성공적으로 비활성화되었습니다.' });
    } catch (error) {
        if (error instanceof DatabaseError) {
            res.status(500).send({ message: error.message });
        } else {
            res.status(500).send({ message: '유저 정보 비활성화 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};

// 관리자 전체 조회 핸들러
const getAllAdminsHandler = async (req, res) => {
    try {
        const admins = await getAllAdmins();
        res.json(admins);
    } catch (error) {
        if (error instanceof DatabaseError) {
            res.status(500).send({ message: error.message });
        } else {
            res.status(500).send({ message: '관리자 정보 조회 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};

// 관리자 추가 핸들러
const createAdminHandler = async (req, res) => {
    try {
        await createAdmin(req.body);
        res.status(201).send({ message: '관리자가 성공적으로 추가되었습니다.' });
    } catch (error) {
        if (error instanceof ResourceConflictError) {
            res.status(409).send({ message: error.message });
        } else if (error instanceof DatabaseError) {
            res.status(500).send({ message: error.message });
        } else {
            res.status(500).send({ message: '관리자 정보 추가 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};

// 관리자 정보 수정 핸들러
const updateAdminHandler = async (req, res) => {
    try {
        await updateAdmin(req.params.id, req.body);
        res.send({ message: '관리자 정보가 성공적으로 업데이트되었습니다.' });
    } catch (error) {
        if (error instanceof DatabaseError) {
            res.status(500).send({ message: error.message });
        } else {
            res.status(500).send({ message: '관리자 정보 수정 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};

// 관리자 삭제 핸들러
const deleteAdminHandler = async (req, res) => {
    try {
        await deleteAdmin(req.params.id);
        res.send({ message: '관리자가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        if (error instanceof DatabaseError) {
            res.status(500).send({ message: error.message });
        } else {
            res.status(500).send({ message: '관리자 정보 삭제 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};



// 상품 목록을 가져오는 핸들러
const getProductsHandler = async (req, res) => {
    try {
        const products = await getProducts();
        res.json({ success: true, data: products });
    } catch (error) {
        if (error instanceof DatabaseError) {
            res.status(500).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: '관리자 상품 정보 조회 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};

// 상품을 추가하는 핸들러
const addProductHandler = async (req, res) => {
    try {
        const newProduct = await addProduct(req.body);
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        if (error instanceof DatabaseError) {
            res.status(500).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: '관리자 상품 정보 추가 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};

// 상품 정보를 수정하는 핸들러
const updateProductHandler = async (req, res) => {
    try {
        const updatedProduct = await updateProduct(req.params.id, req.body);
        res.json({ success: true, data: updatedProduct });
    } catch (error) {
        if (error instanceof DatabaseError) {
            res.status(500).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: '관리자 상품 정보 수정 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};

// 상품을 삭제하는 핸들러
const deleteProductHandler = async (req, res) => {
    try {
        const deletedProductId = await deleteProduct(req.params.id);
        res.json({ success: true, message: '상품이 삭제되었습니다.', product_id: deletedProductId });
    } catch (error) {
        if (error instanceof DatabaseError) {
            res.status(500).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: '관리자 상품 정보 삭제 중, 서버에서 오류가 발생하였습니다.' });
        }
    }
};

module.exports = {
    getAllUsersHandler,
    searchUserByEmailHandler,
    updateUserHandler,
    deactivateUserHandler,
    getAllAdminsHandler,
    updateAdminHandler,
    createAdminHandler,
    deleteAdminHandler,
    getProductsHandler,
    addProductHandler, 
    updateProductHandler,
    deleteProductHandler,
};
