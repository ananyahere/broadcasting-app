const mongoose = require("mongoose")
// DB string
const db = require('./keys').mongoURI
// Connect to Mongoose
const connection = mongoose.createConnection(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

module.exports = connection