const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const passport = require('passport');

const wrapAsync = require('../utilities/wrapAsync');

// Register routes
router.route('/register')
    .get(users.renderRegister)
    .post(wrapAsync(users.register));

// Login and logout routes
router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login);

router.get('/logout', users.logout)

module.exports = router;