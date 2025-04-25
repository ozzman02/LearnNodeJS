var express = require('express');
var router = express.Router();

/* 
  GET users listing. In this case the '/' is a reference to /users. 
  If we replace the current '/' with /edit then the route will be /users/edit 
*/
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* This one is /users/register */
router.get('/register', function(req, res, next) {
  /* This one is rendering a view. We need to have a register.jade file */
  res.render('register', {title: 'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});


module.exports = router;
