
const express = require('express');
const { check, body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',
    body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('description')
        .isLength({ min: 5 })
        .trim(),
    body('imageUrl')
        .isURL(),
    body('price')
        .isFloat(),
    isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product',
    body('title')
        .isAlphanumeric()
        .isLength({ min: 3 })
        .trim(),
    body('description')
        .isLength({ min: 5 })
        .trim(),
    body('imageUrl')
        .isURL(),
    body('price')
        .isFloat(),
    isAuth, adminController.postEditProduct);

router.post('/delete-product/:productId', isAuth, adminController.deleteProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
