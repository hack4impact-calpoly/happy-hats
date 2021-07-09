/* API Endpoints for announcement */
const { request } = require('express');
const mongoose = require('mongoose');
const MongooseConnector = require('../db-helper');
const { isUserApproved } = require('../middleware');

const confirmValidDate = (date, compDate = Date.now()) => {
    date = +date;
    return !!date && (new Date(date) >= compDate);
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

module.exports = (app) => {
    app.get('/api/announcement', isUserApproved, async (req, res) => {
        const date = req.query.date
        const author = req.query.author
        const title = req.query.title
        if (confirmValidDate(date)) {
          let announcements = await MongooseConnector.getAnnouncementByDate(date);
          res.status(200).json(announcements)
        }
        else if(author){
          let announcements = await MongooseConnector.getAnnouncementByAuthor(author);
          res.status(200).json(announcements)
        }
        else if(title){
          let announcements = await MongooseConnector.getAnnouncementByTitle(title);
          res.status(200).json(announcements)
        }
        else{
          announcements = await MongooseConnector.getAllAnnouncements();
          return res.status(200).json(announcements)
        }
      
    })

    app.post('/api/announcement', isUserApproved, async (request, response) => {  
      const validated = await checkAuth(response, request.locals.user.role);

      if (!validated) {
        return;
      }
 
      if (request.body.title && request.body.content && request.body.author) {
        const newAnnouncement = {
          title: request.body.title,
          content: request.body.content,
          author: request.body.author,
          date: new Date()
        }
        const success = await MongooseConnector.postAnnouncement(newAnnouncement);
        checkSuccess(response, success)
            
      } else {
        response.status(400).json({
          message: 'Did not supply all needed post attributes',
        });
      }
   })

   app.delete('/api/announcement', isUserApproved, async (request, response) => {
    const validated = await checkAuth(response, request.locals.user.role);

    if (!validated) {
      return;
    }
    const toDelete = {
      title: request.body.title,
      content: request.body.content,
      author: request.body.author,
      date: request.body.date,
      _id: request.body._id
    }
    const success = await MongooseConnector.deleteAnnouncement(toDelete);
    checkSuccess(response, success)
   })

}
