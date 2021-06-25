const User = require("../models/user");
const bcrypt = require('bcryptjs');
const Cart = require("../models/cart");

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({where: {email: email}}).then(user => {
    if (!user) {
      return res.redirect('/login');
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
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword; // need to implement later

  User.findOne({where: {email: email}}).then(user => {
    if(user) {
      return res.redirect('/signup');
    }
    return bcrypt.hash(password, 12).then(hashed => {
      const newUser = new User({
        email: email,
        password: hashed
      });
      return newUser.save();
    }).then(createdUser => {
      createdUser.createCart().then(result => {
        res.redirect('/login');
      });
    });  
  }).catch(err => {
    console.log(err);
  });
};