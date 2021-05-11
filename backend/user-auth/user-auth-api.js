/* API Endpoints for user */
const MongooseConnector = require('../db-helper');
const { getTokenPayloadFromRequest } = require("../middleware");

module.exports = (app) => {
    app.post('/register', async (req, res) => {
        let retrievedPayloadInfo;

        try {
            retrievedPayloadInfo = await getTokenPayloadFromRequest(req);
        } catch (err) {
            return res.status(401).json({
                status: 401,
                message: 'UNAUTHORIZED',
            });
        }

        if (!retrievedPayloadInfo) {
            return res.status(401).json({
                status: 401,
                message: 'UNAUTHORIZED',
            });
        }

        const [tokenPayload, cognitoId] = tokenPayload;

        const existingUser = MongooseConnector.getUserFromCognitoId(cognitoId);
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const success = await MongooseConnector.addUser({
            cognito_id: cognitoId,
            role: 'none',
        });
    });
};
