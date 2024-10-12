'use strict';
require('dotenv').config();
let mongodb = require('mongodb')
let mongoose = require('mongoose')
module.exports = function (app) {
  mongoose.connect(process.env.MONGO_URI , { useNewUrlParser: true, useUnifiedTopology: true })
  let issueSchema = new mongoose.Schema({
    issue_title: {type: String, required: true},
    issue_text: {type: String, required: true},
    created_by : {type: String, required: true},
    assigned_to : String,
    status_text : String,
    open: {type: Boolean, required: true},
    created_on: {type: Date, required: true},
    updated_on: {type: Date, required: true},
    project: String
  })
 
  let Issue = mongoose.model('Issue', issueSchema)
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filterObject= Object.assign(req.query);
      filterObject['project']= project;
      Issue.find(filterObject, (error, arrayOfResults)=>{
        if (!error && arrayOfResults){
          return res.json(arrayOfResults)
        }
      })
      
    })
    
    .post(function (req, res){
      let project = req.params.project;
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
        return res.json({ error: 'required field(s) missing' })
      }
      let newIssue = new Issue({
        issue_title: req.body.issue_title,
    issue_text: req.body.issue_text,
    created_by : req.body.created_by,
    assigned_to : req.body.assigned_to || '',
    status_text : req.body.status_text || '',
    open: true,
    created_on: new Date().toUTCString(),
    updated_on: new Date().toUTCString(),
    project: project
      })
      newIssue.save((error, savedIssue)=>{
        if (!error && savedIssue) {
          return res.json(savedIssue)
        }
      })
    })
    
    .put(function (req, res){
      
      let project = req.params.project;

  // Check if the request body has _id
  if (!req.body?._id) {
    return res.json({ error: 'missing _id' });
  }

  // Build the update object (excluding empty fields)
  let updateObject = {};
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== '' && key !== '_id') {  // Skip empty fields and _id
      updateObject[key] = req.body[key];
    }
  });

  // Check if there are fields to update
  if (Object.keys(updateObject).length === 0) {
    return res.json({ error: 'no update field(s) sent', _id: req.body._id });
  }

  // Add updated_on timestamp
  updateObject['updated_on'] = new Date().toUTCString();

  // Find and update the issue by _id
  Issue.findByIdAndUpdate(req.body._id, updateObject, { new: true }, (error, updatedIssue) => {
    if (!error && updatedIssue) {
      return res.json({ result: 'successfully updated', _id: req.body._id });
    } else if (!updatedIssue) {
      return res.json({ error: 'could not update', _id: req.body._id });
    } else {
      return res.status(500).json({ error: 'database update failed', _id: req.body._id });
    }
  });
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      if(!req.body?._id){
        return res.json({ error: 'missing _id' })
      }
      Issue.findByIdAndRemove(req.body._id, (error, deletedIssue) => {
        if(!error && deletedIssue){
          res.json( { result: 'successfully deleted', '_id': req.body._id })
        }else if(!deletedIssue){
          res.json({ error: 'could not delete', '_id': req.body._id })
        }
      })
    });
    
};
