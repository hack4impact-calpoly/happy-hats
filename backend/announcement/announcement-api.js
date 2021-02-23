/* API Endpoints for announcement */
const mongoose = require('mongoose');
const MongooseConnector = require('../db-helper');

const confirmValidDate = (date, compDate = Date.now()) => {
    date = +date;
    return !!date && (new Date(date) >= compDate);
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
    app.get('/api/announcement', async (req, res) => {
        const date = req.query.date
        const author = req.query.author
        const title = req.query.title
        if (confirmValidDate(date)) {
          let announcements = await MongooseConnector.getAnnouncementByDate();
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
          res.status(200).json(announcements)
        }
      
    })

    app.post('/api/announcement', async (request, response) => {  
      if (request.body.title && request.body.content && request.body.date) {
        //It should be working on true??
        if (confirmValidDate(request.body.date) === false) {
          const newAnnouncement = {
            title: request.body.title,
            content: request.body.content,
            author: request.body.author,
            date: request.body.date
          }
          const success = await MongooseConnector.postAnnouncement(newAnnouncement);
          checkSuccess(response, success)
        } else {
          response.status(500).json({
            message: 'Invalid Date',
            });
        }
            
        } else {
          response.status(400).json({
          message: 'Did not supply all needed post attributes',
          });
        }
   })

}
