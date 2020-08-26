const User = require('../../models/User');
const jwt = require('jsonwebtoken');

module.exports.verifyToken = function(req, res, next) {

    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {

      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      jwt.verify(bearerToken, 'secretkey', (err, authData) => {
        if(err) {res.sendStatus(403);} 
        else {
            req.authData = authData;
            next();
        }
      });
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  
  }

  module.exports.verifyTokenAdmin = function(req, res, next) {

    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {

      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      jwt.verify(bearerToken, 'secretkey', (err, authData) => {
        if(err) {res.sendStatus(403);} 
        else {
          req.authData = authData;
          if(authData.user.AdminStatus){
            next();
          }
          else {res.sendStatus(403);}
        }
      });
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  
  }
  