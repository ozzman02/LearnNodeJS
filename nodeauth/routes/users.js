var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});

const { check, validationResult } = require('express-validator');

/* Error formatter function */
function formatError({ path, msg, value }) {
  const namespace = path.split('.'); // Use 'path' to handle nested properties
  let formParam = namespace.shift();
  while (namespace.length) {
    formParam += `[${namespace.shift()}]`;
  }
  return {
    param: formParam, // Correctly formatted parameter name (e.g., user[address][street])
    msg: msg,         // Error message
    value: value      // Input value that caused the error
  };
}

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

router.post('/register', 
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').notEmpty()
      .withMessage('Email is required')
      .isEmail().withMessage('Invalid email address'),
    check('username').notEmpty().withMessage('Username is required'),
    check('password').notEmpty().withMessage('Password is required'),
    check('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ],
  upload.single('profileimage'), function(req, res, next) {

    /* Validation inline syntax with custom error formatter function */
    const errors = validationResult(req).formatWith(formatError);


    /* 
      Custom error formatter function as argument of formatWith function

      var errors = validationResult(req).formatWith(({ path, msg, value }) => {
        const namespace = path.split('.'); // Use 'path' instead of 'param'
        let formParam = namespace.shift();
        while (namespace.length) {
          formParam += `[${namespace.shift()}]`;
        }
        return {
          param: formParam, // Correctly formatted parameter name
          msg: msg,         // Error message
          value: value      // Input value that caused the error
        };
      });
    */

    // Handle validation errors
    if (!errors.isEmpty()) {
      //console.log('Errors');
      //return res.status(400).json({ errors: errors.array() });
      res.render('register', {
        errors: errors.array()
      });
    } else {
      console.log('No Errors');
    }

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password;
    
    //console.log(req.file);
    
    if (req.file) {
      console.log('Uploading File');
      var profileimage = req.file.filename;
    } else {
      console.log('No file Uploaded...');
      var profileimage = 'noimage.jpg';
    }

  


});

module.exports = router;
