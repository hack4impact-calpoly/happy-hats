const { Logger } = require("@hack4impact/logger")

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
