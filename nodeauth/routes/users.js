var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


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

router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username or password' }),
  function(req, res) {
    console.log(`User authenticated: ${req.user.username}`);
    req.flash('success', 'You are now logged in');
    //res.redirect('/users/' + req.user.username);
    res.redirect('/');
  }
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


passport.use(new LocalStrategy(async function(username, password, done) {
  console.log(`Login attempt for: ${username}`);
  try {
    const user = await User.getUserByUsername(username);
    if (!user) {
      return done(null, false, { message: 'Unknown User' });
    }
    
    const isMatch = await User.comparePassword(password, user.password);
    if (isMatch) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Invalid Password' });
    }
  } catch (err) {
    return done(err);
  }
}));

router.post('/register', upload.single('profileimage'),
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
  function(req, res, next) {

    /* Ensure the request data is intact. */
    console.log("Request Body:", req.body)

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password;

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
      //console.log('No Errors');
      var newUser = new User({
        name: name,
        email: email,
        username: username,
        password: password,
        profileimage: profileimage
      });
      User.createUser(newUser, function(err, user) {
        if (err) throw err;
        console.log(user);
      });
      
      console.log('User saved successfully!');
      req.flash('success', 'You are now registered and can log in');
      
      res.location('/');
      res.redirect('/');
    }

    console.log(req.file);

    
    if (req.file) {
      console.log('Uploading File');
      var profileimage = req.file.filename;
    } else {
      console.log('No file Uploaded...');
      var profileimage = 'noimage.jpg';
    }

});

/* Verify Authentication Persistence */
router.get('/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Logged in as: ${req.user.username}`);
  } else {
    res.send('Not authenticated');
  }
});


module.exports = router;
