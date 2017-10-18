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
  models.Bio.findAll({ })
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

    res.render('bio', {dynamicData: payload.dynamicData});
  })
});

router.get('/publications', function(req, res) {
  models.Publications.findAll({ })
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

    res.render('publications', {dynamicData: payload.dynamicData});
  })
});

router.get('/research', function(req, res) {
  models.Research.findAll({ })
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

    res.render('research', {dynamicData: payload.dynamicData});
  })
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

router.get('/adminbio', isLoggedIn, function(req, res) {
  //Pull bio data from database
  models.Bio.findAll({ })
  .then(function(data) {
    var payload = {dynamicData: data};
    payload.dynamicData["administrator"] = true;
    res.render('adminbio', {dynamicData: payload.dynamicData});
  })
});

router.get('/adminpublications', isLoggedIn, function(req, res) {
  //Pull bio data from database
  models.Publications.findAll({ })
  .then(function(data) {
    var payload = {dynamicData: data};
    payload.dynamicData["administrator"] = true;

    //Loop through each instance & add type for rendering in the CMS
    for (i=0; i < payload.dynamicData.length; i++) {
      //Check vertical alignment
      if (payload.dynamicData[i].category == "article") {
        payload.dynamicData[i]["article"] = true;
      } else {
        payload.dynamicData[i]["bookreview"] = true;
      }
    }


    res.render('adminpublications', {dynamicData: payload.dynamicData});
  })
});

router.get('/adminresearch', isLoggedIn, function(req, res) {
  //Pull research data from database
  models.Research.findAll({ })
  .then(function(data) {
    var payload = {dynamicData: data};
    payload.dynamicData["administrator"] = true;
    res.render('adminresearch', {dynamicData: payload.dynamicData});
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

//Delete Bio Object
router.get('/deleteBio/:bioId', isLoggedIn, function(req, res) {
  
  //Use Sequelize to find the relevant DB object
  models.Bio.findOne({ where: {id: req.params.bioId} })
  .then(function(id) {
    //Delete the object
    id.destroy();
  }).then(function(){
    res.redirect('../adminbio');
  })
})

//Delete Research Object
router.get('/deleteResearch/:researchId', isLoggedIn, function(req, res) {
  
  //Use Sequelize to find the relevant DB object
  models.Research.findOne({ where: {id: req.params.researchId} })
  .then(function(id) {
    //Delete the object
    id.destroy();
  }).then(function(){
    res.redirect('../adminresearch');
  })
})

//Delete Publication Object
router.get('/deletePublication/:publicationId', isLoggedIn, function(req, res) {
  
  //Use Sequelize to find the relevant DB object
  models.Publications.findOne({ where: {id: req.params.publicationId} })
  .then(function(id) {
    //Delete the object
    id.destroy();
  }).then(function(){
    res.redirect('../adminpublications');
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

router.post('/newpublication', isLoggedIn, upload.single('publicationPicture'), function(req, res) {
  
    var publicationImageToUpload;
  
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
  
        //Get S3 filepath & set it to publicationImageToUpload
        publicationImageToUpload = data.Location
  
        var currentDate = new Date();
  
        //Use Sequelize to push to DB
        models.Publications.create({
          elementimage: publicationImageToUpload,
          header: req.body.NewHeader,
          elementtext: req.body.NewBody,
          category: req.body.NewCategory,
          createdAt: currentDate,
          updatedAt: currentDate
        }).then(function(){
          res.redirect('../adminpublications');
      });
    });
  
    //Only used if no image loaded
    } else {
      publicationImageToUpload = req.body.publicationImage; //publication image was unchanged
  
      var currentDate = new Date();
  
      //Use Sequelize to push to DB
      models.Publications.create({
        elementimage: publicationImageToUpload,
        header: req.body.NewHeader,
        elementtext: req.body.NewBody,
        category: req.body.NewCategory,
        createdAt: currentDate,
        updatedAt: currentDate
      }).then(function(){
        res.redirect('../adminpublications');
      })
    }
  });
  
  router.post('/newBio', isLoggedIn, upload.single('bioPicture'), function(req, res) {
    
    var bioImageToUpload;
  
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
  
        //Get S3 filepath & set it to bioImageToUpload
        bioImageToUpload = data.Location
  
        var currentDate = new Date();
  
        //Use Sequelize to push to DB
        models.Bio.create({
            elementimage: bioImageToUpload,
            header: req.body.NewHeader,
            elementtext: req.body.NewBody,
            createdAt: currentDate,
            updatedAt: currentDate
        }).then(function(){
          res.redirect('../adminbio');
        });
      });
    //only used if no picture uploaded
    } else {
      bioImageToUpload = req.body.bioImage; //carousel image was unchanged
  
      var currentDate = new Date();
  
      //Use Sequelize to push to DB
      models.Bio.create({
        elementimage: bioImageToUpload,
        header: req.body.NewHeader,
        elementtext: req.body.NewBody,
        createdAt: currentDate,
        updatedAt: currentDate
      }).then(function(){
        res.redirect('../adminbio');
      })
    }
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

  //Only used if no image loaded
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

router.post('/newBio', isLoggedIn, upload.single('bioPicture'), function(req, res) {
  
  var bioImageToUpload;

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

      //Get S3 filepath & set it to bioImageToUpload
      bioImageToUpload = data.Location

      var currentDate = new Date();

      //Use Sequelize to push to DB
      models.Bio.create({
          elementimage: bioImageToUpload,
          header: req.body.NewHeader,
          elementtext: req.body.NewBody,
          createdAt: currentDate,
          updatedAt: currentDate
      }).then(function(){
        res.redirect('../adminbio');
      });
    });
  //only used if no picture uploaded
  } else {
    bioImageToUpload = req.body.bioImage; //carousel image was unchanged

    var currentDate = new Date();

    //Use Sequelize to push to DB
    models.Bio.create({
      elementimage: bioImageToUpload,
      header: req.body.NewHeader,
      elementtext: req.body.NewBody,
      createdAt: currentDate,
      updatedAt: currentDate
    }).then(function(){
      res.redirect('../adminbio');
    })
  }
});

router.post('/newResearch', isLoggedIn, upload.single('researchPicture'), function(req, res) {
  
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

      var currentDate = new Date();

      //Use Sequelize to push to DB
      models.Research.create({
          elementimage: researchImageToUpload,
          header: req.body.NewHeader,
          elementtext: req.body.NewBody,
          createdAt: currentDate,
          updatedAt: currentDate
      }).then(function(){
        res.redirect('../adminresearch');
      });
    });
  //only used if no picture uploaded
  } else {
    researchImageToUpload = req.body.researchImage; //carousel image was unchanged

    var currentDate = new Date();

    //Use Sequelize to push to DB
    models.Research.create({
      elementimage: researchImageToUpload,
      header: req.body.NewHeader,
      elementtext: req.body.NewBody,
      createdAt: currentDate,
      updatedAt: currentDate
    }).then(function(){
      res.redirect('../adminresearch');
    })
  }
});

//Process Carousel update requests
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

//Process Bio update requests
router.post('/updateBio/:bioId', isLoggedIn, upload.single('biopicture'), function(req, res) {
  
  //Previous settings. Used if not overwritten below.
  var bioPageImageToUpload = req.body['bioPageImage' + req.params.bioId]; 

  //Check if any image(s) were uploaded
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

      //Get S3 filepath & set it to bioPageImageToUpload
      bioPageImageToUpload = data.Location

      var currentDate = new Date();

      //Use Sequelize to find the relevant DB object
      models.Bio.findOne({ where: {id: req.params.bioId} })
      
      .then(function(id) {
        //Update the data
        id.updateAttributes({
          elementtext: req.body['BioText' + req.params.bioId],
          header: req.body['BioHeader' + req.params.bioId],
          elementimage: bioPageImageToUpload,
          // elementtextposition: elementtextposition,
          updatedAt: currentDate
        }).then(function(){
          res.redirect('../adminbio');
        })
      })
    });
  } else { //No image to upload, just update the text
    var currentDate = new Date();

    //Use Sequelize to find the relevant DB object
    models.Bio.findOne({ where: {id: req.params.bioId} })
    
    .then(function(id) {
      //Update the data
      id.updateAttributes({
        // optdes = req.body['optiondes' + optcount]
        elementtext: req.body['BioText' + req.params.bioId],
        header: req.body['BioHeader' + req.params.bioId],
        // elementtextposition: elementtextposition,
        updatedAt: currentDate
      }).then(function(){
        res.redirect('../adminbio');
      })
    })
  }
});

//Process Research update requests
router.post('/updateResearch/:researchId', isLoggedIn, upload.single('researchpicture'), function(req, res) {
  
  //Previous settings. Used if not overwritten below.
  var researchPageImageToUpload = req.body.researchPageImage; 

  //Check if any image(s) were uploaded
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

      //Get S3 filepath & set it to researchPageImageToUpload
      researchPageImageToUpload = data.Location

      var currentDate = new Date();

      //Use Sequelize to find the relevant DB object
      models.Research.findOne({ where: {id: req.params.researchId} })
      
      .then(function(id) {
        //Update the data
        id.updateAttributes({
          elementtext: req.body['ResearchText' + req.params.researchId],
          header: req.body['ResearchHeader' + req.params.researchId],
          elementimage: researchPageImageToUpload,
          // elementtextposition: elementtextposition,
          updatedAt: currentDate
        }).then(function(){
          res.redirect('../adminresearch');
        })
      })
    });
  } else { //No image to upload, just update the text
    var currentDate = new Date();

    //Use Sequelize to find the relevant DB object
    models.Research.findOne({ where: {id: req.params.researchId} })
    
    .then(function(id) {
      //Update the data
      id.updateAttributes({
        // optdes = req.body['optiondes' + optcount]
        elementtext: req.body['ResearchText' + req.params.researchId],
        header: req.body['ResearchHeader' + req.params.researchId],
        // elementtextposition: elementtextposition,
        updatedAt: currentDate
      }).then(function(){
        res.redirect('../adminresearch');
      })
    })
  }
});

//Process Publication update requests
router.post('/updatepublication/:publicationId', isLoggedIn, upload.single('publicationpicture'), function(req, res) {
  //Previous settings. Used if not overwritten below.
  var publicationImageToUpload = req.body['publicationImage' + req.params.publicationId]; 

  //Check if any image(s) were uploaded
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

      //Get S3 filepath & set it to publicationsImageToUpload
      publicationsImageToUpload = data.Location

      var currentDate = new Date();

      //Use Sequelize to find the relevant DB object
      models.Publications.findOne({ where: {id: req.params.publicationId} })
      
      .then(function(id) {
        //Update the data
        id.updateAttributes({
          elementtext: req.body['PublicationText' + req.params.publicationId],
          header: req.body['PublicationHeader' + req.params.publicationId],
          category: req.body['category' + req.params.publicationId],
          elementimage: publicationsImageToUpload,
          // elementtextposition: elementtextposition,
          updatedAt: currentDate
        }).then(function(){
          res.redirect('../adminpublications');
        })
      })
    });
  } else { //No image to upload, just update the text
    var currentDate = new Date();

    //Use Sequelize to find the relevant DB object
    models.Publications.findOne({ where: {id: req.params.publicationId} })
    
    .then(function(id) {
      //Update the data
      id.updateAttributes({
        // optdes = req.body['optiondes' + optcount]
        elementtext: req.body['PublicationText' + req.params.publicationId],
        header: req.body['PublicationHeader' + req.params.publicationId],
        category: req.body['category' + req.params.publicationId],
        // elementtextposition: elementtextposition,
        updatedAt: currentDate
      }).then(function(){
        res.redirect('../adminpublications');
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