const User = require("../models/user");
const bcrypt = require('bcryptjs');
const Cart = require("../models/cart");
const { check, validationResult } = require('express-validator/check');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  message = (message.length > 0) ? message[0] : null;
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {email: '', password: ''},
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'login',
      errorMessage: errors.array()[0].msg,
      oldInput: {email: email, password: password},
      validationErrors: errors.array()
    });
  }

  User.findOne({where: {email: email}}).then(user => {
    if (!user) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'login',
        errorMessage: 'Invalid email or password.',
        oldInput: {email: email, password: password},
        validationErrors: [{param: 'email'}, {param:'password'}]
      });
    }
    bcrypt.compare(password, user.password).then(domatch => {
      if (domatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return res.redirect('/');
      }
      res.redirect('/login');
    }).catch(err => {
      console.log(err);
    });
  })
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/');
  });
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  message = (message.length > 0) ? message[0] : null;
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {email: '', password: '', confirmPassword: ''},
    validationErrors: []
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {email: email, password: password, confirmPassword: req.body.confirmPassword},
      validationErrors: errors.array()
    });
  }
  bcrypt.hash(password, 12).then(hashed => {
      const newUser = new User({
        email: email,
        password: hashed
      });
      return newUser.save();
    }).then(createdUser => {
      createdUser.createCart().then(result => {
        res.redirect('/login');
      });  
  }).catch(err => {
    console.log(err);
  });
};