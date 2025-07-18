const express = require('express');
const authController = require('../../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../../middleware/validation');
const router = express.Router();

// Formulário de login
router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        layout: 'auth'
    });
});

// Processar login
router.post('/login', validateLogin, handleValidationErrors, authController.login);

// Formulário de registro
router.get('/register', (req, res) => {
    res.render('auth/register', {
        title: 'Criar Conta',
        layout: 'auth'
    });
});

// Processar registro
router.post('/register', validateRegister, handleValidationErrors, authController.register);

// Logout
router.post('/logout', authController.logout);

module.exports = router;