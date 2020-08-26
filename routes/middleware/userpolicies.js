const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../../models/User');
module.exports = function(req,res,next){

    
        const { name, email, password, password2 } = req.body;
        let errors = [];
      
        if (!name || !email || !password || !password2) {
          errors.push({ msg: 'Please enter all fields' });
        }
      
        if (password != password2) {
          errors.push({ msg: 'Passwords do not match' });
        }
      
        if (password.length < 6) {
          errors.push({ msg: 'Password must be at least 6 characters' });
        }
      
        if (errors.length > 0) {
          res.render('users/register', {
            menu:'2',
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          User.findOne({ email: email }).then(user => {
            if (user) {
              errors.push({ msg: 'Email already exists' });
              res.render('users/register', {
                menu:'2',
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
      
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser
                    .save()
                    .then(user => {
                      req.flash(
                        'success_msg',
                        'You are now registered and can log in'
                      );
                      next();
                    })
                    .catch(err => console.log(err));
                });
              });
            }
          });
        }
      
}