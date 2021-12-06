const router = require("express").Router();
const passport = require("passport");
const genPassword = require("../libs/passportUtils").genPassword;
const isAdmin = require("../middleware/authMiddleware").isAdmin;
const User = require("../modals/users");
const Message = require("../modals/message");
const checkUser = require("../middleware/authMiddleware").checkUser;
const multer = require('multer')

// multer setup
const upload = multer({
  fileFilter(req, file, cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return cb(new Error('Please upload an image'))
    }
    cb(undefined, true)
  }
})

// POST
router.post("/register-admin", (req, res, next) => {
  const saltHash = genPassword(req.body.pw);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = new User({
    username: req.body.uname,
    hash: hash,
    salt: salt,
    admin: true,
  });

  newUser.save().then((user) => {
    console.log(user);
  });

  res.redirect("/login-admin");
});

router.post(
  "/login-admin",
  passport.authenticate("local", {
    failureRedirect: "/login-admin-failure",
    successRedirect: "/admin-route",
  })
);

router.post('/admin-route/avatar', isAdmin, checkUser, upload.single('avatar'), async (req, res) => {
  try{
    req.user.avatar = req.file.buffer 
    await req.user.save()
    console.log('binary', req.user)
    res.status(200).send({msg: 'Avatar Uploaded'})
  }catch(e){
    console.log(e)
    res.status(400).send({ error: e.message})
  }
})

router.delete('/admin-route/avatar', isAdmin, async (req, res) => {
  try{
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send({message: 'profile deleted'})
  }catch(err){
    res.status(500).send({error: err.message})
  }
})

// GET
router.get("/admin-route", isAdmin, checkUser, (req, res, next) => {
  // res.send('You made it to the admin route.')
  // res.sendFile(path.join(__dirname + '../../public/admin.html'))
  Message.find({}).exec((err, oldMessages) => {
    if (err) throw err;
    res.render("admin", { allMessage: oldMessages });
  });
});

router.get("/login-admin-failure", isAdmin, (req, res, next) => {
  res.send(
    'You entered the wrong password.<a href="/login-admin">Go to login-admin route</a></p>'
  );
});

router.get("/login-admin", (req, res, next) => {
  const form =
    '<h1>Login Page</h1><form method="POST" action="/login-admin">\
  Enter Username:<br><input type="text" name="uname">\
  <br>Enter Password:<br><input type="password" name="pw">\
  <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

router.get("/register-admin", (req, res, next) => {
  const form =
    '<h1>Register Page</h1><form method="post" action="/register-admin">\
                  Enter Username:<br><input type="text" name="uname">\
                  <br>Enter Password:<br><input type="password" name="pw">\
                  <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

router.get('/user/:id/avatar', checkUser, async (req, res) => {
  try{
  const userId = req.params.id
  const user = await User.findById(userId)
  if(!user || !user.avatar){
    throw new Error('user not found or pic not found')
  }
  res.set('Content-Type', 'image/jpg')
  res.send(user.avatar)
  }catch(err){
    res.send(err)
  }
})

module.exports = router;
