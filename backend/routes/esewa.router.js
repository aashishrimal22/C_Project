const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/esewa.controller');

router.post('/pay',    ctrl.esewaPay);
router.post('/verify', ctrl.esewaVerify);
router.get('/success', ctrl.esewaSuccess);
router.get('/fail',    ctrl.esewaFail);

module.exports = router;
