const mongoose = require('mongoose')
const connection = require('../config/database')
const validator = require('validator')

const MessageSchema = new mongoose.Schema({
  id: {
    type: mongoose.ObjectId 
  },
  sentBy: {
    type: String,
    required: true
  },
  url : {
    type: String,
    required: true,
    validate(value){
      if (!validator.isURL(value)){
        throw new Error('invalid url')
      }
    },
    trim: true
  },
  //text is subject of meet.
  text:{
    type: String,
    required: true,
  }
})

const Message = connection.model('Message', MessageSchema)
module.exports = Message
