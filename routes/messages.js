const router = require('express').Router();
const loginController = require('../controller/loginController');
const messageController = require('../controller/messageController');
require('dotenv').config();

router.post('/sendMessages', messageController.sendMessgae);

module.exports = router;
