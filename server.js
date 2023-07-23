const express = require('express')
const session = require('express-session')
var adminRoutes = require('./routes/admin')
var userRoutes = require('./routes/user')
var passport = require('passport')
const MongoStore = require('connect-mongo')(session)
const connection = require('./config/database')
var socket = require('socket.io')
var path = require('path')
const Message = require('./modals/message')

const isAdmin = require('./middleware/authMiddleware').isAdmin
const User = require('./modals/users')
const {checkUser} = require('./middleware/authMiddleware')

// App setup
const app = express()

// Path
const publicDirPath = path.join(__dirname, 'public')
const viewDirPath = path.join(__dirname, 'views')

// View Engine setup
app.set('views', viewDirPath)
app.set('view engine', 'ejs')

// Setup static directory to serve 
app.use(express.static(publicDirPath))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())


// Session Setup
const sessionStore = new MongoStore({
  mongooseConnection: connection,
  collection: 'sessions'
})

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    maxAge: 1000*60*60*24
  }
}))

// Passport.js
require('./config/passport')

app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use(adminRoutes)
app.use(userRoutes)

var server = app.listen(8080, () => {
  console.log('Listening at port 8080')
})

// Socket setup
var io = socket(server)

io.on('connection', (socket) => {
  console.log('made socket connection', socket.id)

  socket.on('chat', function(data){
    io.sockets.emit('chat', data) 

    const newMessage = new Message({
      sentBy: data.handle,
      url: data.url,
      // text is subject of meet.
      text: data.message
    })
    
    newMessage.save()
    .then((message) => {
      console.log(message)
    })
  })
})

