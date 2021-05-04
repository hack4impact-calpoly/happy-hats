const { Logger } = require('@hack4impact/logger');
const { User } = require('./user-auth/user-auth-db');
const { verifierFactory } = require('@southlane/cognito-jwt-verifier');

const verifier = verifierFactory({
   region: process.env.AWS_REGION,
   userPoolId: process.env.COGNITO_USER_POOL_ID,
   appClientId: process.env.APP_CLIENT_ID,
   tokenType: 'id', // either "access" or "id"
});

// Parse authHeader to retrieve token
const getBearerToken = (authHeader) => {
   // Format: "Bearer <token>"
   return authHeader.split(' ')[1];
};

// Checks if the provided token is a valid token
const verifyTokenAndGetUser = async (token) => {
   const tokenPayload = await verifier.verify(token);
   return {
      role: tokenPayload.role,
      userId: tokenPayload["cognito:username"],
   };
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
