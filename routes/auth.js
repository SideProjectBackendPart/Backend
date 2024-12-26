const router = require('express').Router();
const loginController = require('../controller/loginController');
const messageController = require('../controller/messageController');
require('dotenv').config();

router.post('/login', loginController.login);
router.post('/register', loginController.register);

router.post('/emailAuth', loginController.sendAuthEmail);
router.post('/checkAuthCode', loginController.checkAuthCode);


module.exports = router;
