var express = require('express');
var bcrypt = require('bcryptjs');
var router = express.Router();
var models = require('../models');
var bodyParser = require('body-parser');
var connection = require('../config/connection.js');
var passport = require('passport');
var nodemailer = require('nodemailer');
var transporter = require('../config/transporter.js');
var sequelizeConnection = models.sequelize;
var multer  = require('multer');
var upload = multer({dest: __dirname + '/public/images/'}); 
var fs = require('fs');
var aws = require('aws-sdk');

//amazon S3 configuration
var S3_BUCKET = process.env.S3_BUCKET;
var S3_accessKeyId = process.env.AWS_ACCESS_KEY_ID
var S3_secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

//==================================
//=====GET routes to load pages=====
//==================================
router.get('/', function(req, res) {
  res.redirect('/index');
});

router.get('/index', function(req, res) {
    models.Carousel.findAll({})
  .then(function(data) {
    var payload = {dynamicData: data}

    //Add administrator credential to the created object
    if (req.user) {
      payload.dynamicData["administrator"] = true;
    }
    
    res.render('index', {dynamicData: payload.dynamicData});
  })
});

router.get('/bio', function(req, res) {
  models.AboutMe.findAll({ })
  .then(function(data) {
    var payload = {dynamicData: data}

    //Loop through each returned object & decode data for rendering
    for (i=0; i < payload.dynamicData.length; i++) {
      var decodeElementText = decodeURIComponent(payload.dynamicData[i].elementtext);
      payload.dynamicData[i].elementtext = decodeElementText;
    }

    //Add administrator credential to the created object
    if (req.user) {
      payload.dynamicData["administrator"] = true;
    }

    res.render('about', {dynamicData: payload.dynamicData});
  })
});

router.get('/publications', function(req, res) {
  //Add administrator credential to the created object
  // if (req.user) {
  //   payload.dynamicData["administrator"] = true;
  // }
  res.render('publications');
});

router.get('/currentresearch', function(req, res) {
  //Add administrator credential to the created object
  // if (req.user) {
  //   payload.dynamicData["administrator"] = true;
  // }
  res.render('currentresearch');
});


router.get('/contact', function(req, res) {

  var payload = {
    dynamicData: {
      administrator: false,
      messageSent: false
    }
  }

  //Add messageSent credential to the created object
  if (req.session.messageSent) {
    payload.dynamicData.messageSent = true;
    req.session.messageSent = false;
  }
    
  //Add administrator credential to the created object
  if (req.user) {
    payload.dynamicData.administrator = true;
  }
  res.render('contact', {dynamicData: payload.dynamicData});
});

router.get('/register', function(req, res) {
  res.render('register');
});

router.get('/login', function(req, res) {
  res.render('login');
});


//============================================
//=====GET PROTECTED routes to load pages=====
//============================================
router.get('/adminportal', isLoggedIn, function(req, res) {
  res.render('adminportal');
});

router.get('/viewmessages', isLoggedIn, function(req, res) {
  //Pull message data from database
  models.messages.findAll({})
  .then(function(data) {
    var payload = {dynamicData: data}
    payload.dynamicData["administrator"] = true;
    res.render('viewmessages', {dynamicData: payload.dynamicData});
  })
});

router.get('/adminaboutme', isLoggedIn, function(req, res) {
  //Pull about me data from database
  models.AboutMe.findAll({ })
  .then(function(data) {
    var payload = {dynamicData: data};
    payload.dynamicData["administrator"] = true;
    res.render('adminaboutme', {dynamicData: payload.dynamicData});
  })
});

router.get('/adminpublications', isLoggedIn, function(req, res) {
  //Pull about me data from database
  models.AboutMe.findAll({ })
  .then(function(data) {
    var payload = {dynamicData: data};
    payload.dynamicData["administrator"] = true;
    res.render('adminpublications', {dynamicData: payload.dynamicData});
  })
});

router.get('/admincurrentresearch', isLoggedIn, function(req, res) {
  //Pull about me data from database
  models.AboutMe.findAll({ })
  .then(function(data) {
    var payload = {dynamicData: data};
    payload.dynamicData["administrator"] = true;
    res.render('admincurrentresearch', {dynamicData: payload.dynamicData});
  })
});

router.get('/admincarousel', isLoggedIn, function(req, res) {
  models.Carousel.findAll({})
  .then(function(data) {
    var payload = {dynamicData: data}
    payload.dynamicData["administrator"] = true;

    //Loop through each instance & add positional elements for rendering in the CMS
    for (i=0; i < payload.dynamicData.length; i++) {
      //Check vertical alignment
      if (payload.dynamicData[i].vAlignment == "bottom") {
        payload.dynamicData[i]["bottom"] = true;
      } else {
        payload.dynamicData[i]["top"] = true;
      }

      //Check horizontal alignment
      if (payload.dynamicData[i].hAlignment == "left") {
        payload.dynamicData[i]["left"] = true;
      } else {
        payload.dynamicData[i]["right"] = true;
      }

    }

    res.render('admincarousel', {dynamicData: payload.dynamicData});
  })

});

//Delete Message
router.get('/deletemessage/:messageId', isLoggedIn, function(req, res) {

  //Use Sequelize to find the relevant DB object
  models.messages.findOne({ where: {id: req.params.messageId} })
  .then(function(id) {
    //Delete the object
    id.destroy();
  }).then(function(){
    res.redirect('../viewmessages');
  })
})

//Delete Carousel Object
router.get('/deleteCarousel/:carouselId', isLoggedIn, function(req, res) {

  //Use Sequelize to find the relevant DB object
  models.Carousel.findOne({ where: {id: req.params.carouselId} })
  .then(function(id) {
    //Delete the object
    id.destroy();
  }).then(function(){
    res.redirect('../admincarousel');
  })
})



//===============================================
//=====POST routes to record to the database=====
//===============================================

//Process registration requests using Passport
router.post('/register', passport.authenticate('local-signup', {
  successRedirect: ('../adminportal'), //if authenticated, proceed to adminportal page
  failureRedirect: ('login') //if failed, redirect to login page (consider options here!!)
}));

//Process login requests with Passport
router.post('/login', passport.authenticate('local-login', {
  successRedirect: ('../adminportal'), //if login successful, proceed to adminportal page
  failureRedirect: ('login') //if failed, redirect to login page (consider options here!!)
}));

router.post('/contact/message', function(req, res) {

  var currentDate = new Date();

  //Use Sequelize to push to DB
  models.messages.create({
      name: req.body.fname,
      email: req.body.email,
      message: req.body.message,
      createdAt: currentDate,
      updatedAt: currentDate
  }).then(function(){

    //Send email to alert the admin that a message was recieved
    var mailOptions = {
        from: 'contact@tomcariello.com', // sender address
        to: 'tomcariello@gmail.com', // list of recipients
        subject: 'Someone left you a message', // Subject line
        text: 'Name: ' + req.body.fname + '\n Message: ' + req.body.message
    };

    sendAutomaticEmail(mailOptions);
    req.session.messageSent = true;

    res.redirect('../contact');
  })
});

//Process About Me update requests
router.post('/updateAboutMe/:aboutMeId', isLoggedIn, upload.single('aboutmepicture'), function(req, res) {
  
  //Previous settings. Used if not overwritten below.
  var aboutPageImageToUpload = req.body.aboutPageImage; 

  //Check if any image(s) were uploaded
  if (typeof req.files !== "undefined") {

    //Process file being uploaded
    var fileName = req.file.originalname;
    var fileType = req.file.mimetype;
    var stream = fs.createReadStream(req.file.path) //Create "stream" of the file

    //Create Amazon S3 specific object
    var s3 = new aws.S3();

    var params = {
      Bucket: S3_BUCKET,
      Key: fileName, //This is what S3 will use to store the data uploaded.
      Body: stream, //the actual *file* being uploaded
      ContentType: fileType, //type of file being uploaded
      ACL: 'public-read', //Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3_accessKeyId,
      secretAccessKey: S3_secretAccessKey
    }

    s3.upload( params, function(err, data) {
      if (err) {
        console.log("err is " + err);
      }

      //Get S3 filepath & set it to aboutPageImageToUpload
      aboutPageImageToUpload = data.Location

      var currentDate = new Date();

      //Use Sequelize to find the relevant DB object
      models.AboutMe.findOne({ where: {id: req.params.aboutMeId} })
      
      .then(function(id) {
        //Update the data
        id.updateAttributes({
          elementtext: req.body['AboutMeText' + req.params.aboutMeId],
          header: req.body['AboutMeHeader' + req.params.aboutMeId],
          // elementtextposition: elementtextposition,
          updatedAt: currentDate
        }).then(function(){
          res.redirect('../adminaboutme');
        })
      })
    });
  } else { //No image to upload, just update the text
    var currentDate = new Date();

    //Use Sequelize to find the relevant DB object
    models.AboutMe.findOne({ where: {id: req.params.aboutMeId} })
    
    .then(function(id) {
      //Update the data
      id.updateAttributes({
        // optdes = req.body['optiondes' + optcount]
        elementtext: req.body['AboutMeText' + req.params.aboutMeId],
        header: req.body['AboutMeHeader' + req.params.aboutMeId],
        // elementtextposition: elementtextposition,
        updatedAt: currentDate
      }).then(function(){
        res.redirect('../adminaboutme');
      })
    })
  }
});

//Process research update requests
router.post('/updateresearch', isLoggedIn, upload.single('researchpicture'), function(req, res) {
  var researchImageToUpload;

  //Check if image was upload & process it
  if (typeof req.file !== "undefined") {

    //Process file being uploaded
    var fileName = req.file.originalname;
    var fileType = req.file.mimetype;
    var stream = fs.createReadStream(req.file.path) //Create "stream" of the file

    //Create Amazon S3 specific object
    var s3 = new aws.S3();

    var params = {
      Bucket: S3_BUCKET,
      Key: fileName, //This is what S3 will use to store the data uploaded.
      Body: stream, //the actual *file* being uploaded
      ContentType: fileType, //type of file being uploaded
      ACL: 'public-read', //Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3_accessKeyId,
      secretAccessKey: S3_secretAccessKey
     }

    s3.upload( params, function(err, data) {
      if (err) {
        console.log("err is " + err);
      }

      //Get S3 filepath & set it to researchImageToUpload
      researchImageToUpload = data.Location

    });

  } else { //image did not change, so maintain the old URL
    researchImageToUpload = req.body.researchimage; 
  }

  //Use Sequelize to find the relevant DB object
  models.research.findOne({ where: {id: 1} })
  
  .then(function(id) {
    var currentDate = new Date();

    //Update the data
    id.updateAttributes({
        researchtext: req.body.researchText,
        researchimage: researchImageToUpload,
        updatedAt: currentDate
    }).then(function(){
      res.redirect('../adminresearch');
    })
  })
});


router.post('/newpublication', isLoggedIn, function(req, res) {

  var currentDate = new Date();

  //Use Sequelize to push to DB
  models.publications.create({
      publicationname: req.body.NewpublicationName,
      description: req.body.NewDescription,
      url: req.body.NewpublicationURL,
      createdAt: currentDate,
      updatedAt: currentDate
  }).then(function(){

    res.redirect('../adminpublications');
  })
});

router.post('/updatepublication', isLoggedIn, function(req, res) {
  var currentDate = new Date();

  //Use Sequelize to find the relevant DB object
  models.publications.findOne({ where: {id: req.body.dbid} })

  .then(function(id) {
    //Update the data
    id.updateAttributes({
        publicationname: req.body.publicationname,
        description: req.body.description,
        url: req.body.url,
        updatedAt: currentDate
    }).then(function(){
      res.redirect('../adminpublications');
    })
  })
});

router.post('/newCarousel', isLoggedIn, upload.single('carouselPicture'), function(req, res) {

  var carouselImageToUpload;

  //Check if image was upload & process it
  if (typeof req.file !== "undefined") {
    //Process file being uploaded
    var fileName = req.file.originalname;
    var fileType = req.file.mimetype;
    var stream = fs.createReadStream(req.file.path) //Create "stream" of the file

    //Create Amazon S3 specific object
    var s3 = new aws.S3();

    var params = {
      Bucket: S3_BUCKET,
      Key: fileName, //This is what S3 will use to store the data uploaded.
      Body: stream, //the actual *file* being uploaded
      ContentType: fileType, //type of file being uploaded
      ACL: 'public-read', //Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3_accessKeyId,
      secretAccessKey: S3_secretAccessKey
     }

    s3.upload( params, function(err, data) {
      if (err) {
        console.log("err is " + err);
      }

      //Get S3 filepath & set it to carouselImageToUpload
      carouselImageToUpload = data.Location

      var currentDate = new Date();

      //Use Sequelize to push to DB
      models.Carousel.create({
          imagepath: carouselImageToUpload,
          quote: req.body.NewQuote,
          quotesource: req.body.NewSource,
          createdAt: currentDate,
          updatedAt: currentDate,
          hAlignment: req.body.newHPosition,
          vAlignment: req.body.newVPosition,
          quoteWidth: req.body.newQuoteWidth,
          quoteHeight: req.body.newQuoteHeight
      }).then(function(){
        res.redirect('../admincarousel');
    });
  });

  //This can likely be deleted since uploading an image is a requirement for a new carousel
  } else {
    carouselImageToUpload = req.body.carouselImage; //carousel image was unchanged

    var currentDate = new Date();

    //Use Sequelize to push to DB
    models.Carousel.create({
        imagepath: carouselImageToUpload,
        quote: req.body.NewQuote,
        quotesource: req.body.NewSource,
        createdAt: currentDate,
        updatedAt: currentDate,
        hAlignment: req.body.newHPosition,
        vAlignment: req.body.newVPosition,
        quoteWidth: req.body.newQuoteWidth,
        quoteHeight: req.body.newQuoteHeight
    }).then(function(){
      res.redirect('../admincarousel');
    })
  }
});

router.post('/updateCarousel', isLoggedIn, upload.single('carouselPicture'), function(req, res) {

  var carouselImageToUpload;

  //Check if image was uploaded & process it
  if (typeof req.file !== "undefined") {
    //Process file being uploaded
    var fileName = req.file.originalname;
    var fileType = req.file.mimetype;
    var stream = fs.createReadStream(req.file.path) //Create "stream" of the file

    //Create Amazon S3 specific object
    var s3 = new aws.S3();

    var params = {
      Bucket: S3_BUCKET,
      Key: fileName, //This is what S3 will use to store the data uploaded.
      Body: stream, //the actual *file* being uploaded
      ContentType: fileType, //type of file being uploaded
      ACL: 'public-read', //Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3_accessKeyId,
      secretAccessKey: S3_secretAccessKey
     }

    s3.upload( params, function(err, data) {
      if (err) {
        console.log("err is " + err);
      }

      //Get S3 filepath & set it to carouselImageToUpload
      carouselImageToUpload = data.Location

      var currentDate = new Date();

      //Use Sequelize to find the record
      models.Carousel.findOne({ where: {id: req.body.dbid} })
      
      .then(function(id) {
        //Update the data
        id.updateAttributes({
            imagepath: carouselImageToUpload,
            quote: req.body.carouselQuote,
            quotesource: req.body.carouselSource,
            updatedAt: currentDate,
            hAlignment: req.body.hPosition,
            vAlignment: req.body.vPosition,
            quoteWidth: req.body.quoteWidth,
            quoteHeight: req.body.quoteHeight
        }).then(function(){
          res.redirect('../admincarousel');
        })
      })
    });
  } else {
    carouselImageToUpload = req.body.carouselImage; //carousel image was unchanged

    var currentDate = new Date();

    //Use Sequelize to push to DB
    models.Carousel.findOne({ where: {id: req.body.dbid} })
      
    .then(function(id) {
      //Update the data
      id.updateAttributes({
          imagepath: carouselImageToUpload,
          quote: req.body.carouselQuote,
          quotesource: req.body.carouselSource,
          updatedAt: currentDate,
          hAlignment: req.body.hPosition,
          vAlignment: req.body.vPosition,
          quoteWidth: req.body.quoteWidth,
          quoteHeight: req.body.quoteHeight

        }).then(function(){
        res.redirect('../admincarousel');
      })
    })
  }
});

// route middleware to make sure user is verified
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

//Function to faciliate sendin email alerts
function sendAutomaticEmail(mailOptions, req, res) {
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    } else {
        console.log('Message sent: ' + info.response);
    };
  });
}


module.exports = router;