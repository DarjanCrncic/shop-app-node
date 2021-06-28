const express = require('express');
const { check, body } = require('express-validator/check');
const User = require('../models/user');

const authController = require('../controllers/auth');
const router = express.Router();


router.get('/login', authController.getLogin);

router.post('/login',
    check('email')
        .isEmail()
        .withMessage("Please enter a valid email.")
        .normalizeEmail(),
    body('password', 'Please enter password with only alphanumeric characters and at least 5 characters.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup',
    check('email')
        .isEmail()
        .withMessage("Please enter a valid email.")
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ where: { email: value } }).then(user => {
                if (user) {
                    return Promise.reject('Email already exists, please use a different email.');
                }
            });
        }),
    body('password', 'Please enter password with only alphanumeric characters and at least 5 characters.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match.');
        }
        return true;
    }),
    authController.postSignup);

module.exports = router;