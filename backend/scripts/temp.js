const MongooseConnector = require('../db-helper');

(async () => {
    await MongooseConnector.connect();
    await MongooseConnector.updateCalendarEvent('4edd40c86762e0fb12000003', { 'hi' : 'hi' });
    await MongooseConnector.disconnect();
})();