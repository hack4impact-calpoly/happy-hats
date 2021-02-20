## Running the backend
1. Create a `.env` file in the backend directory
2. Add the port you want the express server to run on `PORT=3001`
3. Add the link to connect to the Atlas DB `DB_LINK=<url>`
4. Run server... you should see a connected message and port message

## Using the existing backend infrastructure to add new endpoints and interact with mongoose

Example files for this:
- calendar/models/calendar-schema.js
- calendar/calendar-api.js
- calendar/calendar-db.js


1. Create new directory/folder in backend for components you are adding
2. You will need in this directory:
    - Schema JS file (optionally in models/ subdirectory). This is where you will store the schema to make the model
    - API JS file. This is where you will put your endpoints
    - Database functions JS file. This is where you will put your functions that interact with mongoose/model
3. In the Schema file, make your schema that the model will use. You may also decide to put your collection name here
4. In the database function file:
    - `require` the schema and use it to make the model.
    - Create an object where inside of it each key is a function name you want to be accessible through the `MongooseConnector`
    and each value for that key is a function associated with that key (probably an `async` one)
    - Export the model (if used elsewhere) AND the object with your functions
5. In the db-helper.js file in the backend directory:
    - `require` your object with functions and model (if initializing it)
    - go to bottom of file in return value of MongooseConnector function and below other ones that look like `...convertFns(fnObject)`
    and add your own in a similar fashion: `...convertFns(newFnObject)`
6. In your API file, add your endpoints, using the same named functions you just added to MongooseConnector as needed
    - To start, make your `module.exports` a function so that the express `app` can be passed to it for your endpoints... `module.exports = (app) => { ... }`
    - Example of using your DB functions: You added a function called getStuff that retrieves stuff from the DB. Then you'd use it by doing `MongooseConnector.getStuff()`
    - If function is `async`, consider adding an `await` before it. If unfamiliar with async/await, do read up on it
7. In the index.js file in the backend directory:
    - `require` your API file in the same way you see other API files being added: `require(my-component/my-api)(app)`

**Why use this?**
- Abstracts database connection complexity
- Makes it so you don't need to check DB connection on each function call
- Makes it so you don't need to put each function in try/catch block for any async/await calls
- Generic errors can all be caught and dealt with at the same place
- Easy to extend this to allow more features that all files interacting with it can use then
- Less prone to developer errors and won't make the server crash
- Gives everyone a place to start
