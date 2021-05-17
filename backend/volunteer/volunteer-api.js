/* API Endpoints for calendar */
const mongoose = require('mongoose');
const { Logger } = require("@hack4impact/logger");
const MongooseConnector = require('../db-helper');
const { isUserAuthenticated } = require("../middleware");

const confirmValidObjectId = (objectId) => {
   return !!objectId && mongoose.isValidObjectId(objectId);
};

const checkAuth = async (res, userRole) => {
   if (userRole !== 'admin') {
     res.status(401).json({
       message: 'Insufficient role for resource',
     });
     return false;
   }
 
   return true;
 };

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

const getVolunteerObject = async (req, res) => {
   const { id } = req.params;
   const { user } = req.body;

   if (!confirmValidObjectId(id) || !confirmValidObjectId(user)) {
      res.status(400).json({
         message: 'Required body not included or malformed',
      });
      return null;
   }

   const volunteerObjectId = mongoose.Types.ObjectId(id);
   const userObjectId = mongoose.Types.ObjectId(user);

   const retrievedVolunteerObject = await MongooseConnector.getVolunteer(volunteerObjectId);

   const { id: retrievedVolunteerObjectId } = retrievedVolunteerObject;

   if (!retrievedVolunteerObjectId) {
      res.status(404).json({
         message: 'Volunteer not found',
      });
      return null;
   }

   // Confirm requesting user is the volunteer
   if (!userObjectId.equals(retrievedVolunteerObjectId)) {
      res.status(401).json({
         message: 'Authorization denied',
      });
      return null;
   }

   return retrievedVolunteerObject;
};


module.exports = (app) => {
   app.get('/api/volunteers', isUserAuthenticated, async (req, res) => {
      Logger.log("GET: All Volunteers...");
      const volunteers = await MongooseConnector.getAllVolunteers();
      res.status(200).json({
         volunteers,
      });
   });

   app.get('/api/volunteer/:id', isUserAuthenticated, async (req, res) => {
      Logger.log("GET: Volunteer...");
      const volunteerObject = await getVolunteerObject(req, res);
      if (volunteerObject !== null) {
         return volunteerObject;
      }
   });

   app.get('/api/volunteer/:id/hours/scheduled', isUserAuthenticated, async (req, res) => {
      Logger.log("GET: Scheduled Hours...");
      const volunteerObject = await getVolunteerObject(req, res);
      if (volunteerObject !== null) {
         return volunteerObject.scheduledHours;
      }
   });

   app.get('/api/volunteer/:id/hours/completed', isUserAuthenticated, async (req, res) => {
      Logger.log("GET: Completed Hours...");
      const volunteerObject = await getVolunteerObject(req, res);
      if (volunteerObject !== null) {
         return volunteerObject.completedHours;
      }
   });

   app.get('/api/volunteer/:id/hours/not-completed', isUserAuthenticated, async (req, res) => {
      Logger.log("GET: Not Completed Hours...");
      const volunteerObject = await getVolunteerObject(req, res);
      if (volunteerObject !== null) {
         return volunteerObject.nonCompletedHours;
      }
   });

   app.post('/api/volunteer/:id/hours/completed', isUserAuthenticated, async (req, res) => {
      Logger.log("POST: Completed Hours...");
      const volunteerObject = await getVolunteerObject(req, res);
      if (volunteerObject !== null) {
         const { hours } = req.body;

         if (typeof hours !== "number") {
            res.status(400).json({
               message: "Hours must be a numerical value"
            });
         }

         const success = await MongooseConnector.saveVolunteerCompletedHours(req.params.id, hours);

         checkSuccess(res, success);
      }
   });

   app.post('/api/volunteer/:id/hours/not-completed', isUserAuthenticated, async (req, res) => {
      Logger.log("POST: Not Completed Hours...");
      const volunteerObject = await getVolunteerObject(req, res);
      if (volunteerObject !== null) {
         const { hours } = req.body;

         if (typeof hours !== "number") {
            res.status(400).json({
               message: "Hours must be a numerical value"
            });
         }

         const success = await MongooseConnector.saveVolunteerNotCompletedHours(req.params.id, hours);

         checkSuccess(res, success);
      }
   });

   app.delete('/api/volunteer', async (request, response) => {
      const validated = await checkAuth(response, request.locals.user.role);

      if (!validated) {
         return;
      }

      const toDelete = {
         _id: request.body._id,
         firstName: request.body.firstName,
         lastName: request.body.lastName,
         email: request.body.email,
         completedHours: request.body.completedHours,
         scheduledHours: request.body.scheduledHours,
         nonCompletedHours: request.body.nonCompletedHours
      }
      Logger.log("after assignment");
      const success = await MongooseConnector.deleteVolunteer(toDelete);
      checkSuccess(response, success)
     })
  
};