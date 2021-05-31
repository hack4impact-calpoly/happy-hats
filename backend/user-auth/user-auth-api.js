/* API Endpoints for user */
const MongooseConnector = require('../db-helper');
const { getTokenPayloadFromRequest, getUserFromTokenPayload, isUserAuthenticated } = require("../middleware");
const { Logger } = require('@hack4impact/logger');

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

    // tryAddingUser(res, cognitoId);
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

    app.get('/api/users', isUserAuthenticated, async (req, res) => {
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
           
            //cognitoId = retrievedPayloadInfo[0];
        } catch (err) {
            return res.status(401).json({
                status: 401,
                message: 'UNAUTHORIZED',
            });
        }

        // attemptRegistration(res, cognitoId);
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

    app.post('/api/updateApproved', async (req, res) => {
        const volunteerObject = await MongooseConnector.getUserFromEmail(req.body.email, res);
        if (volunteerObject !== null) {
           const success = await MongooseConnector.saveUserApproved(volunteerObject.id);
           return res.status(200).json({});
        }
    });

    app.post('/api/updateRejected', async (req, res) => {
        const volunteerObject = await MongooseConnector.getUserFromEmail(req.body.email, res);
        if (volunteerObject !== null) {
           const success = await MongooseConnector.saveUserRejected(volunteerObject.id);
           return res.status(200).json({});
        }
    });
};
