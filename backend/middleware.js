const { Logger } = require('@hack4impact/logger');
const { User } = require('./user-auth/user-auth-db');
const { idTokenVerifer } = require('./aws-exports-reader');

// Parse authHeader to retrieve token
const getBearerToken = (authHeader) => {
   // Format: "Bearer <token>"
   return authHeader.split(' ')[1];
};

// Checks if the provided token is a valid token
const getUserFromTokenPayload = async (tokenPayload) => {
   // console.log(tokenPayload);
   const user = await User.findOne({
      cognito_id: tokenPayload.sub,
   });

   if (!user) {
      throw new Error("No cognito username found");
   }


   // toObject is very important... converts document to Plain JS object (POJO)
   return user.toObject();
};

const getTokenPayloadFromRequest = async (req) => {
   const authHeader = req.headers.authorization;

   if (!authHeader) {
      return false;
   }

   const token = getBearerToken(authHeader);
   if (!token) {
      return false;
   }

   const tokenPayload = await idTokenVerifer.verify(token);

   if (!("sub" in tokenPayload)) {
      throw new Error("No cognito user found from sub given");
   }
   return [tokenPayload, tokenPayload.sub];
};

const isUserAuthenticated = async (req, res, next) => {
   try {
      const retrievedPayloadInfo = await getTokenPayloadFromRequest(req);

      if (!retrievedPayloadInfo) {
         return res.status(403).json({
            status: 403,
            message: 'FORBIDDEN',
         });
      }
      const userObj = await getUserFromTokenPayload(retrievedPayloadInfo[0]);
      if (!userObj || !userObj.role) {
         return res.status(401).json({
            status: 401,
            message: 'UNAUTHORIZED',
         });
      }

      req.locals = {
         user: userObj,
      };
      next();
   } catch (err) {
      Logger.error(err);

      return res.status(401).json({
         status: 401,
         message: 'UNAUTHORIZED',
      });
   }
};

const approvedRoles = new Set(['volunteer', 'admin', 'hospital']);

const isUserApproved = async (req, res, next) => {
   isUserAuthenticated(req, res, () => {
      if ((!approvedRoles.has(req.locals?.user?.role)) || !req.locals?.user?.approved || !req.locals?.user?.decisionMade) {
         return res.status(403).json({
            message: 'Forbidden user role provided',
         });
      }

      next();
   });
};

const adminRoles = new Set(['admin']);
const isUserAdmin = async (req, res, next) => {
   isUserApproved(req, res, () => {
      if (!adminRoles.has(req.locals?.user?.role)) {
         return res.status(403).json({
            message: 'Forbidden user role provided',
         });
      }

      next();
   });
};

module.exports = {
   isUserAuthenticated,
   isUserApproved,
   isUserAdmin,
   getTokenPayloadFromRequest,
   getUserFromTokenPayload,
};
