const mongoose = require('mongoose')
const connection = require('../config/database')

const UserSchema = new mongoose.Schema({
  username: String,
  hash: String,
  salt: String,
  admin: Boolean,
  avatar: {
    type: Buffer
  }
})

const User = connection.model('User', UserSchema)
module.exports = User