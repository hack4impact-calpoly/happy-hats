/* API Endpoints for user */
const MongooseConnector = require('../db-helper');
const { getTokenPayloadFromRequest, getUserFromTokenPayload, isUserAuthenticated } = require("../middleware");
const { Logger } = require('@hack4impact/logger');

const tryAddingUser = async (res, cognitoId) => {
    Logger.log(`Registering user ${cognitoId}...`);
    const success = await MongooseConnector.addUser({
        cognito_id: cognitoId,
        role: 'none',
    });

    if (success) {
        Logger.log(`User ${cognitoId} registered.`);
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

const attemptRegistration = async (res, cognitoId) => {
    const existingUser = await MongooseConnector.getUserFromCognitoId(cognitoId);
    if (existingUser) {
        res.status(409).json({
            message: "User already exists",
        });
        return false;
    }

    tryAddingUser(res, cognitoId);
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

            cognitoId = retrievedPayloadInfo[0];
        } catch (err) {
            return res.status(401).json({
                status: 401,
                message: 'UNAUTHORIZED',
            });
        }

        attemptRegistration(res, cognitoId);
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
            attemptRegistration(res, cognitoId);
        }
    });
};
