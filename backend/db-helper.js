const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { calendarEventFns, CalendarEvent } = require('./calendar/calendar-db');
const { announcementFns, Announcement} = require('./announcement/announcement-db')
const { volunteerFns, Volunteer } = require("./volunteer/volunteer-db");

/* Load .env into environment */
dotenv.config();

/* Ensure DB_LINK exists */ 
const url = process.env.DB_LINK;
if (!url) {
    console.error('No DB_LINK environment var found... add it to your .env file!');
    process.exit(1);
}

/* Singleton design pattern */
const MongooseConnector = (() => {
    /* Must be object so it is passed by reference and updated correctly */
    const internals = {
        connected: false,
    };

    /**
     * May be changed in future to allow optional callback. Any errors that are not
     * handled in code will be caught and dealt with here
    */ 
    const handleError = (error) => {
        console.log('Encountered error: ');
        console.log(error);
        return false;
    };

    /**
     * Wrapper (higher order) function around given one that handles catching errors
        and making sure server is connected to DB
    */
    const fnWrapper = async (fn, rest) => {
        if (internals.connected) {
            try {
                /* Expand arguments to function if they exist */
                return await fn(...rest);
            } catch (error) {
                return handleError(error);
            }
        } else {
            console.warn('Not connected to DB but making DB call...');
        }
    };

    /**
     * Entry point to convert function to wrapped one. Takes an object and for each key
     * it creates a wrapped function for its value
     * -  The key for object should be the function name
     * -  The value matching that key should be the function associated with the function name 
    */
    const convertFns = (obj) => {
        const newFns = {};
        for (const [key, val] of Object.entries(obj)) {
            newFns[key] = async (...optionalArgs) => { // Allow variadic functions
                return await fnWrapper(val, optionalArgs);
            };
        }

        return newFns;
    };

    /* This is the interface that things using the MongooseConnector may interact with */
    return {
        connected: internals.connected,
        /* Call to connect to atlas DB */
        connect: async () => {
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
                    /* Initialize models */
                    await CalendarEvent.init();
                    await Volunteer.init();

                    console.log('Connected to MongoDB');
                    return true;
                } catch (error) {
                    console.log(error);
                    internals.connected = false;
                    return false;
                }
            }
        },
        /* Call to disconnect from DB connection */
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
        /* Below is where to add your database fns
            Put yours by doing:
                "...convert(givenFNs)"
        */
        ...convertFns(calendarEventFns),
        ...convertFns(announcementFns),
        ...convertFns(volunteerFns)
    };
})();

module.exports = MongooseConnector;