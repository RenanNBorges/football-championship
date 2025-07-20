const express = require('express');
const authController = require('../../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../../middleware/validation');
const { requireApiAuth } = require('../../middleware/auth');
const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, authController.register);
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/logout', requireApiAuth, authController.logout);
router.get('/profile', requireApiAuth, authController.profile);

module.exports = router;
