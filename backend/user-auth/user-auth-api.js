/* API Endpoints for user */
const MongooseConnector = require('../db-helper');
const { getTokenPayloadFromRequest, getUserFromTokenPayload, isUserAdmin, isUserApproved, isUserAuthenticated } = require("../middleware");
const { Logger } = require('@hack4impact/logger');

const checkSuccess = (res, val) => {
    if (!val) {
       res.status(500).json({
          message: 'Database error',
       });
       return;
    }
 
    res.status(200).json({
       successful: val,
    });
 };
 

const tryAddingUser = async (res, retrievedPayloadInfo) => {
    cognitoId = retrievedPayloadInfo[0].sub;
    email = retrievedPayloadInfo[0].email;
    Logger.log(`Registering user ${cognitoId}...`);
    const success = await MongooseConnector.addUser({
        role: 'none',
        cognito_id: cognitoId,
        firstName: '',
        lastName: '',
        email: email,
        completedHours: 0,
        scheduledHours: 0,
        nonCompletedHours: 0,
        approved: false,
        decisionMade: false
    });

    if (success) {
        Logger.log(`User ${cognitoId} with email ${email} registered.`);
        return res.status(200).json({
            message: 'success',
        });
    } else {
        res.status(500).json({
            message: 'Unable to register',
        });
        return false;
    }
};

const attemptRegistration = async (res, retrievedPayloadInfo) => {
    cognitoId = retrievedPayloadInfo[0];
    const existingUser = await MongooseConnector.getUserFromCognitoId(cognitoId);
    if (existingUser) {
        res.status(409).json({
            message: "User already exists",
        });
        return false;
    }

    tryAddingUser(res, retrievedPayloadInfo);
};

const getTokenPayloadOrError = async (req, res) => {
    let retrievedPayloadInfo;

    try {
        retrievedPayloadInfo = await getTokenPayloadFromRequest(req);
    } catch (err) {
        res.status(401).json({
            status: 401,
            message: 'UNAUTHORIZED',
        });
        return false;
    }

    if (!retrievedPayloadInfo) {
        res.status(401).json({
            status: 401,
            message: 'UNAUTHORIZED',
        });
        return false;
    }

    return retrievedPayloadInfo;
};

module.exports = (app) => {

    app.get('/api/email', async (req, res) => {
        Logger.log("GET: User from email...");
        const volunteer = await MongooseConnector.getUserFromEmail(req.query.email);
        return res.status(200).json({
            user: volunteer
        });
     });


    app.get('/api/users', isUserApproved, async (req, res) => {
        Logger.log("GET: All Users...");
        const volunteers = await MongooseConnector.getAllUsers();
        res.status(200).json({
            users: volunteers
        });
     });



    app.post('/api/register', async (req, res) => {
        let cognitoId, retrievedPayloadInfo;

        try {
            retrievedPayloadInfo = await getTokenPayloadOrError(req, res);
            if (!retrievedPayloadInfo || retrievedPayloadInfo?.length !== 2) {
                return;
            }
        } catch (err) {
            return res.status(401).json({
                status: 401,
                message: 'UNAUTHORIZED',
            });
        }

        attemptRegistration(res, retrievedPayloadInfo);
    });

    app.post('/api/login', async (req, res) => {
        let tokenPayload, cognitoId, retrievedPayloadInfo;

        try {
            retrievedPayloadInfo = await getTokenPayloadOrError(req, res);
            if (!retrievedPayloadInfo || retrievedPayloadInfo?.length !== 2) {
                return;
            }

            [tokenPayload, cognitoId] = retrievedPayloadInfo;
        } catch (err) {
            return res.status(401).json({
                status: 401,
                message: 'UNAUTHORIZED',
            });
        }

        try {
            const user = await getUserFromTokenPayload(tokenPayload);

            if (!user) {
                return res.status(401).json({
                    status: 401,
                    message: 'UNAUTHORIZED',
                });
            }

            Logger.log(`User ${cognitoId} logged in.`);
            return res.status(200).json({
                user,
            });
        } catch (err) {
            // Don't need check user existence because we know it doesn't exist
            attemptRegistration(res, retrievedPayloadInfo);
        }
    });

    app.post('/api/updateApproved', isUserAdmin, async (req, res) => {
        if (!req.body.email) {
            return res.status(400).json({
                message: 'Bad request format. No email specified'
            });
        }

        const volunteerObject = await MongooseConnector.getUserFromEmail(req.body.email);
        if (!volunteerObject) {
            return res.status(404).json({
                message: 'User email not found',
            });
        }

        const user = await MongooseConnector.saveUserApproved(volunteerObject.id);
        console.log(user);
        return res.status(200).json({
            user,
        });
    });

    app.post('/api/updateRejected', isUserAdmin, async (req, res) => {
        if (!req.body.email) {
            return res.status(400).json({
                message: 'Bad request format. No email specified'
            });
        }

        const volunteerObject = await MongooseConnector.getUserFromEmail(req.body.email);
        if (!volunteerObject) {
            return res.status(404).json({
                message: 'User email not found',
            });
        }


        const user = await MongooseConnector.saveUserRejected(volunteerObject.id);
        console.log(user);
        return res.status(200).json({
            user,
        });
    });

    app.post('/api/volunteerData', isUserAuthenticated, async (request, response) => {
        if (request.body.firstName && request.body.lastName) {
          const updateNames = {
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            id: request.body.id
          }
          const success = await MongooseConnector.updateVolunteer(updateNames);
          checkSuccess(response, success)
              
        } else {
          response.status(400).json({
            message: 'Did not supply all needed post attributes',
          });
        }
     });
};
