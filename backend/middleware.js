const { Logger } = require('@hack4impact/logger');
const passport = require('passport');
const { User } = require('./user-auth/user-auth-db');

// Parse authHeader to retrieve token
const getBearerToken = (authHeader) => {
   // Format: "Bearer <token>"
   return authHeader.split(' ')[1];
};

// Checks if the provided token is a valid token
const verifyTokenAndGetUID = (token) => {
  return new Promise((resolve, reject) => {
    User.find({
      googleId: token,
      username: token
    }, (err, user) => {
      if(err) reject(err);
      else resolve(user.googleId);
    })
  })
};

const isUserAuthenticated = (req, res, next) => {
   const authHeader = req.headers.authorization;

   if (!authHeader) {
      return res.status(403).json({
         status: 403,
         message: 'FORBIDDEN',
      });
   } else {
      const token = getBearerToken(authHeader);

      if (token) {
         // TODO: Add verifyTokenAndGetUID function
         return verifyTokenAndGetUID(token)
            .then((userId) => {
               res.locals.auth = {
                  userId,
               };
               next();
            })
            .catch((err) => {
               Logger.error(err);

               return res.status(401).json({
                  status: 401,
                  message: 'UNAUTHORIZED',
               });
            });
      } else {
         return res.status(403).json({
            status: 403,
            message: 'FORBIDDEN',
         });
      }
   }
};

module.exports = {
   isUserAuthenticated,
};
