const awsexports = require('./aws-exports');
const { verifierFactory } = require('@southlane/cognito-jwt-verifier');

const idTokenVerifer = verifierFactory({
    region: awsexports.aws_cognito_region,
    userPoolId: awsexports.aws_user_pools_id,
    appClientId: awsexports.aws_user_pools_web_client_id,
    tokenType: 'id', // either "access" or "id"
});

module.exports = {
    idTokenVerifer,
};