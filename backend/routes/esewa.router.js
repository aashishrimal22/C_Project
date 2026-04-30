const express = require('express');
const router = express.Router();
const esewaController = require('../controller/esewa.controller');
router.post('/pay',esewaController.esewaPay);

router.get('/success', esewaController.esewaSuccess);
router.get('/fail', esewaController.esewaFail);

module.exports = router;