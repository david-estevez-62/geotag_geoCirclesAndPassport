var express = require('express');
var adminController = require('../config/admin');
var router = express.Router();

router.get('/auth', function(req, res, next){
	res.redirect('/');
})

// Our get request for viewing the login page
router.get('/login', adminController.login);

// Post received from submitting the login form
router.post('/login', adminController.processLogin);

// Post received from submitting the signup form
router.post('/signup', adminController.processSignup);

// Any requests to log out can be handled at this url
router.get('/logout', adminController.logout);

module.exports = router;