const router = require("express").Router();
const passport = require("passport");
const genPassword = require("../libs/passportUtils").genPassword;
const connection = require("../config/database");
const isAuth = require("../middleware/authMiddleware").isAuth;
const isAdmin = require("../middleware/authMiddleware").isAdmin;
const User = require("../modals/users");
const Message = require("../modals/message");
const multer = require('multer')
const checkUser = require("../middleware/authMiddleware").checkUser;

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
router.post("/register-user", (req, res, next) => {
  const saltHash = genPassword(req.body.pw);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = new User({
    username: req.body.uname,
    hash: hash,
    salt: salt,
    admin: false,
  });

  newUser.save().then((user) => {
    console.log(user);
  });

  res.redirect("/login-user");
});

router.post(
  "/login-user",
  passport.authenticate("local", {
    failureRedirect: "/login-user-failure",
    successRedirect: "/login-user-success",
  })
);

router.post('/login-user-success/avatar', isAuth, checkUser,  upload.single('avatar'), async (req, res) => {
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

router.delete('/login-user-success/avatar', isAuth, async (req, res) => {
  try{
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send({message: 'profile deleted'})
  }catch(err){
    res.status(500).send({error: err.message})
  }
})

router.patch("/avatar", isAuth, async (req, res) => {
  try {
    const avatar = req.body.avatarURL;
    const userId = req.user._id;
    const user = User.findByIdAndUpdate(userId, { avatar }, { new: true });
    res.status(200).json({
      url: avatar,
    });
  } catch (e) {
    res.status(500).send(e);
  }
});

// GET
router.get("/register-user", (req, res, next) => {
  const form =
    '<h1>Register Page</h1><form method="post" action="/register-user">\
                  Enter Username:<br><input type="text" name="uname">\
                  <br>Enter Password:<br><input type="password" name="pw">\
                  <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

router.get("/login-user", (req, res, next) => {
  const form =
    '<h1>Login Page</h1><form method="POST" action="/login-user">\
  Enter Username:<br><input type="text" name="uname">\
  <br>Enter Password:<br><input type="password" name="pw">\
  <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

router.get("/login-user-success", isAuth, checkUser, (req, res, next) => {
  // res.send('You made it to the route.')
  // res.sendFile(path.join(__dirname + '../../public/user.html'))
  Message.find({}).exec((err, oldMessages) => {
    if (err) throw err;
    res.render("user", { allMessage: oldMessages });
  });
});

router.get("/login-user-failure", (req, res, next) => {
  res.send(
    'You entered the wrong password. <a href="/login-user">Go to login-user route</a></p>'
  );
});

module.exports = router;
