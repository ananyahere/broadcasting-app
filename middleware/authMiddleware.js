const User = require('../modals/users')

module.exports.isAuth = (req,res,next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(401).json({ msg: 'You are not authorized to view this resource' })
  }
}

module.exports.isAdmin = (req,res,next) => {
  if (req.isAuthenticated() && req.user.admin) {
    next()
  } else {
    res.status(401).json({ msg: 'You are not authorized to view this resource because you are not an admin.' })
  }
}

module.exports.checkUser = async (req, res, next) => {
  const user = await User.findById(req.user._id)
  try{
    
    if(!user){
      res.locals.user = null
      res.locals.imageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTua0Yf5VZNfS1wzgpHViNpcRbMBjULgVvmAZCEc5S62u10bfxDMjNm8VCn9tYXPygdwyA&usqp=CAU"
      next()
    }
    else{
      if(req.isAuthenticated()){
        res.locals.user = user
        res.locals.imageUrl = `http://localhost:6969/user/${user._id}/avatar`
        next()
      }
      else{
        res.locals.user = null
        next()
      }
    }
  }catch(e){
    console.log(e)
    next()
  }
}