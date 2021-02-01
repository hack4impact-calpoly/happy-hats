const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { calendarEventFns, CalendarEvent } = require('./calendar/calendar-db');

// Load .env into environment
dotenv.config();

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.omjjl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// Singleton design pattern
const MongooseConnector = (() => {
    const internals = {
        connected: false,
    };

    const handleError = (error) => {
        console.log('Encountered error: ');
        console.log(error);
        return false;
    };

    const fnWrapper = async (fn, rest) => {
        if (internals.connected) {
            try {
                return await fn(...rest);
            } catch (error) {
                return handleError(error);
            }
        }
    };

    const convertFns = (obj) => {
        const newFns = {};
        for (const [key, val] of Object.entries(obj)) {
            newFns[key] = async (...optionalArgs) => {
                return await fnWrapper(val, optionalArgs)
            };
        }

        return newFns;
    };

    return {
        connected: internals.connected,
        connect: async () => {
            // Copied
            if (!internals.connected) {
                try {
                    internals.connected = true;
                    await mongoose.connect(url, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        useFindAndModify: false,
                        useCreateIndex: true,
                        autoIndex: true,
                    });
                    await CalendarEvent.init();
                    console.log('Connected to MongoDB');
                    return true;
                } catch (error) {
                    console.log(error);
                    internals.connected = false;
                    return false;
                }
            }
        },
        disconnect: async () => {
            if (internals.connected) {
                try {
                    await mongoose.disconnect();
                    internals.connected = false;
                    console.log('Disconnected');
                    return true;
                } catch (error) {
                    console.log(error);
                    return false;
                }
            }
        },
        ...convertFns(calendarEventFns)
    };
})();

module.exports = MongooseConnector;