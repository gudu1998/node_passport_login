const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const passport = require('passport')

// Login page
router.get('/login', (req, res) => res.render('login'))

// Register page
router.get('/register', (req, res) => res.render('register'))

// Register Handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body   //Object destructuring
  let errors = []

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' })
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' })
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be atleast 6 characters' })
  }

  const captcha = req.body['g-recaptcha-response'];
  if (!captcha) {
    errors.push({ msg: 'Please select captcha' })
  }
  // Secret key
  const secretKey = '6LdvofkUAAAAANw_sgGpTAY6X3krNfX7IYPKgUt4'

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`


  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
    })
  } else {
    // Validation passed
    User.findOne({ email: email }, (err, user) => {
      if (err) {
        console.log(err)
      } else {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.render('register', {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name,
            email,
            password
          });

          // Hash password this code we can get in documentation
          bcrypt.genSalt(10, (_err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err
              // Set password to hashed
              newUser.password = hash

              // save user
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'You are now registered and can log in')
                  res.redirect('/users/login')
                })
                .catch(err => console.log(err))

            })
          })

        }
      }
    })
  }

})

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

// Logout handle
router.get('/logout', (req, res) => {
  req.logOut()
  req.flash('success_msg', 'You are logged out')
  res.redirect('/users/login')
})

module.exports = router