const express = require('express');
const router = express.Router();
const memberPortalController = require('../../controllers/Common/memberPortalController');

router.post('/login', memberPortalController.loginMember);
router.get('/my-details', memberPortalController.getMyDetails);

module.exports = router;
