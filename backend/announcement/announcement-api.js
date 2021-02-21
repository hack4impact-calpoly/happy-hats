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
        if(date !== undefined){
          let announcements = await MongooseConnector.getAnnouncementByDate();
          res.status(200).json(announcements)
        }
        else if(author !== undefined){
          let announcements = await MongooseConnector.getAnnouncementByAuthor();
          res.status(200).json(announcements)
        }
        else if(title !== undefined){
          let announcements = await MongooseConnector.getAnnouncementByTitle();
          res.status(200).json(announcements)
        }
        else{
          announcements = await MongooseConnector.getAllAnnouncements();
          res.status(200).json(announcements)
        }
      
    })

    app.post('/api/announcement', async (request, response) => {  
        const newAnnouncement = {
            title: request.body.title,
            content: request.body.content,
            author: request.body.author,
            date: request.body.date
        }

        const success = await MongooseConnector.postAnnouncement(newAnnouncement);
        checkSuccess(response, success)
    })

}
