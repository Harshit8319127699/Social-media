var express = require('express');
var router = express.Router();
var passport=require('passport');
const userModel=require('./users');
const postModel=require('./post');
const sendmail=require('./nodemailer');
const localstrategy=require('passport-local');
const commentModel=require('./comments');
const multer = require('multer');
const { uuid } = require('uuidv4');
passport.use(new localstrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})



const upload = multer({ storage: storage })


router.post('/upload', upload.single('picture'), function (req, res, next) {
  userModel.findOne({username: req.session.passport.user})
  .then(function(foundUser){
    foundUser.Profile.push(req.file.filename);
    foundUser.save()
    res.redirect('/profile')
  })
})

router.get('/',function(req, res, next) {
  // res.render('index');
  // console.log(uuid());
  res.render('index');
  
});
router.get('/reset',function(req, res, next) {
  res.render('reset');
  
});
router.post('/reset',function(req, res, next) {
  userModel.findOne({email:req.body.email})
  .then(function(founduser){
    if(founduser!==null){
      var secret=uuid();
      founduser.secret=secret;
      founduser.expiry=Date.now()+24*60*60*1000;
      founduser.save()
      .then(function(data){
        sendmail(req.body.email,`http://localhost:3000/reset/${founduser._id}/${secret}`)
        .then(function(){
          res.send("mail sent! check your email please.")
        })

      })
    
    }
    else{
      res.send('user doesnt exist')
    }
  })
  
});

router.get('/reset/:id/:secret', function(req, res){
  userModel.findOne({_id: req.params.id})
  .then(function(foundUser){
    if(foundUser.secret === req.params.secret){
      console.log(foundUser)
      res.render('password', {foundUser})

    }
  })
})

router.post('/reset/:id', function(req, res){
  userModel.findOne({_id: req.params.id})
  .then(function(foundUser){
    if(req.body.password1 === req.body.password2){
      foundUser.setPassword(req.body.password1, function(){
        foundUser.save()
        .then(function(updatedUser){
          req.logIn(updatedUser, function(err){
            if (err) { return next(err); }
            return res.redirect('/profile');
          })
          
        })
      })
    }
  })
})

router.post('/password/:id',function(req,res){
userModel.findOne({_id:req.params.id})
.then(function(data){
  console.log(data);
})
})

router.post('/register', function(req, res) {
  var data = new userModel({
      name: req.body.name,
      username: req.body.name,
      email:req.body.email
  })
  userModel.register(data, req.body.password)
      .then(function(u) {
          passport.authenticate('local')(req, res, function() {
              res.redirect('/profile')
          })
      })
      .catch(function(e) {
          res.send(e);
      })
});
router.get('/allpictures/:id',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(data){
res.render('allpictures',{data});
  })
})
router.get('/profile',isLoggedIn,function(req,res){
  userModel.findOne({ username: req.session.passport.user })
  .populate('totalpost')
  .then(function(postdata) {
      res.render('profile', { postdata })
  })
})
router.post('/createpost',isLoggedIn,function(req,res){
  userModel.findOne({ username: req.session.passport.user })
  .then(function(founduser) {
      postModel.create({
              content: req.body.content,
              user: founduser,
              imageurl: req.body.imageurl
          })
          .then(function(data) {
              founduser.totalpost.push(data);
              founduser.save()
                  .then(function() {
                      res.redirect('/profile')
                  })
          })
  })

})
router.get('/likes/:id', function(req, res) {
  userModel.findOne({ username: req.session.passport.user }).then(function(founduser) {
      postModel.findOne({ _id: req.params.id })
          .then(function(foundpost) {
              if (foundpost.likes.indexOf(founduser._id) === -1) {
                  foundpost.likes.push(founduser._id);
              } else {
                  foundpost.likes.splice(founduser._id, 1);
              }
              foundpost.save()
                  .then(function() {
                      res.redirect(req.headers.referer);
                  })
          })

  })

})
router.get('/update/:id', function(req, res) {
  postModel.findOne({ _id: req.params.id })
      .then(function(data) {
          res.render('update', { data })
          console.log(data);
      })
})
router.post('/update/:id', function(req, res) {
  var user = {
      imageurl: req.body.imageurl,
      content: req.body.content
  }
  postModel.findOneAndUpdate({ _id: req.params.id }, user)
      .then(function(as) {
          res.redirect('/profile')
      })
})
router.get('/back', function(req, res) {
  res.redirect('/profile')
})
router.get('/delete/:id', function(req, res) {
  postModel.findOneAndDelete({ _id: req.params.id })
      .then(function() {
          res.redirect("/profile")
      })
})
router.get("/allpost", isLoggedIn, function(req, res) {
  postModel.find()
  .populate('comment')
      .then(function(allpost) {
          res.render('allpost', { allpost })
      })

})
router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/'
}), function(req, res, next) {})

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/')
});
router.post('/comments/:id',function(req,res){
  postModel.findOne({_id:req.params.id})
  .then(function(data){
commentModel.create({
comments:req.body.comments,
postid:data,
}).then(function(params){
data.comment.push(params)
data.save()
.then(function(){
res.redirect('/allpost');
})
})  
  })
})

router.post('/reply/:id',function(req,res){
commentModel.findOne({postid:req.params.id})
.then(function(postdata){
postdata.reply.push(req.body.reply)
postdata.save()
.then(function(){
  res.redirect('/allpost');
  console.log(postdata.reply);
})
})
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();

  } else {
      res.redirect('/');
  }

}
function checkLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
return next();
  } else {
      res.redirect('/profile');
  }

}
module.exports = router;
