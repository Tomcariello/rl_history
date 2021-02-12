const express = require('express');
const Handlebars = require('handlebars');
const expressHandlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const fs = require('fs');
const aws = require('aws-sdk');
const passport = require('passport');
const multer = require('multer');
const transporter = require('../config/transporter.js');

const app = express();
app.engine('handlebars', expressHandlebars({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
}));
app.set('view engine', 'handlebars');

// const bcrypt = require('bcryptjs');
// const bodyParser = require('body-parser');
// const connection = require('../config/connection.js');
// const nodemailer = require('nodemailer');
// const sequelizeConnection = models.sequelize;
const upload = multer({ dest: __dirname + '/public/images/' });
const models = require('../models');

// amazon S3 configuration
const S3_BUCKET = process.env.S3_BUCKET;
const S3AccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const S3SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// route middleware to make sure user is verified
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    return next();
  }

  // if they aren't redirect them to the home page
  res.redirect('/');
}

// Function to faciliate sending email alerts
function sendAutomaticEmail(mailOptions, req, res) {
  console.log(`${req} ${res}`);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Message sent: ${info.response}`);
    }
  });
}

// =====GET routes to load pages=====
app.get('/', (req, res) => {
  models.Carousel.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };

      // Add administrator credential to the created object
      if (req.user) {
        payload.dynamicData.administrator = true;
      }
      res.render('index', { dynamicData: payload.dynamicData });
    });
});

app.get('/bio', (req, res) => {
  models.Bio.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };
      // Loop through each returned object & decode data for rendering
      for (let i = 0; i < payload.dynamicData.length; i += 1) {
        const decodeElementText = decodeURIComponent(payload.dynamicData[i].elementtext);
        payload.dynamicData[i].elementtext = decodeElementText;

        // Header
        const decodeHeadline = decodeURIComponent(payload.dynamicData[i].header);
        payload.dynamicData[i].header = decodeHeadline;

        // Caption
        const decodeCaption = decodeURIComponent(payload.dynamicData[i].imagecaption);
        payload.dynamicData[i].imagecaption = decodeCaption;
      }

      // Add administrator credential to the created object
      if (req.user) {
        payload.dynamicData.administrator = true;
      }

      res.render('bio', { dynamicData: payload.dynamicData });
    });
});

app.get('/publications', (req, res) => {
  models.Publications.findAll({
    order: [['id', 'DESC']],
  }).then((data) => {
    const payload = { dynamicData: data };

    // Loop through each returned object...
    for (let i = 0; i < payload.dynamicData.length; i += 1) {
      // ...& add element to indicate if it is a book review or article
      if (payload.dynamicData[i].category == 'article') {
        payload.dynamicData[i].isArticle = true;
      } else {
        payload.dynamicData[i].isBookReview = true;
      }

      // ...& decode data for rendering
      const decodeElementText = decodeURIComponent(payload.dynamicData[i].elementtext);
      payload.dynamicData[i].elementtext = decodeElementText;

      const decodeHeadlineText = decodeURIComponent(payload.dynamicData[i].header);
      payload.dynamicData[i].header = decodeHeadlineText;

      const decodeCaptionText = decodeURIComponent(payload.dynamicData[i].imagecaption);
      payload.dynamicData[i].imagecaption = decodeCaptionText;
    }

    // Add administrator credential to the created object
    if (req.user) {
      payload.dynamicData.administrator = true;
    }

    res.render('publications', { dynamicData: payload.dynamicData });
  });
});

app.get('/research', (req, res) => {
  models.Research.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };

      // Loop through each returned object & decode data for rendering
      for (let i = 0; i < payload.dynamicData.length; i += 1) {
        // Body
        const decodeElementText = decodeURIComponent(payload.dynamicData[i].elementtext);
        payload.dynamicData[i].elementtext = decodeElementText;

        // Header
        const decodeHeadline = decodeURIComponent(payload.dynamicData[i].header);
        payload.dynamicData[i].header = decodeHeadline;

        // Caption
        const decodeCaption = decodeURIComponent(payload.dynamicData[i].imagecaption);
        payload.dynamicData[i].imagecaption = decodeCaption;
      }

      // Add administrator credential to the created object
      if (req.user) {
        payload.dynamicData.administrator = true;
      }

      res.render('research', { dynamicData: payload.dynamicData });
    });
});

app.get('/teaching', (req, res) => {
  models.Teaching.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };

      // Loop through each returned object & decode data for rendering
      for (let i = 0; i < payload.dynamicData.length; i += 1) {
        // Body
        const decodeElementText = decodeURIComponent(payload.dynamicData[i].elementtext);
        payload.dynamicData[i].elementtext = decodeElementText;

        // Header
        const decodeHeadline = decodeURIComponent(payload.dynamicData[i].header);
        payload.dynamicData[i].header = decodeHeadline;

        // Caption
        const decodeCaption = decodeURIComponent(payload.dynamicData[i].imagecaption);
        payload.dynamicData[i].imagecaption = decodeCaption;
      }

      // Add administrator credential to the created object
      if (req.user) {
        payload.dynamicData.administrator = true;
      }
      res.render('teaching', { dynamicData: payload.dynamicData });
    });
});

app.get('/events', (req, res) => {
  models.Events.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };

      // Loop through each returned object & decode data for rendering
      for (let i = 0; i < payload.dynamicData.length; i += 1) {
        // Body
        const decodeElementText = decodeURIComponent(payload.dynamicData[i].elementtext);
        payload.dynamicData[i].elementtext = decodeElementText;

        // Header
        const decodeHeadline = decodeURIComponent(payload.dynamicData[i].header);
        payload.dynamicData[i].header = decodeHeadline;

        // Caption
        const decodeCaption = decodeURIComponent(payload.dynamicData[i].imagecaption);
        payload.dynamicData[i].imagecaption = decodeCaption;
      }

      // Add administrator credential to the created object
      if (req.user) {
        payload.dynamicData.administrator = true;
      }
      res.render('events', { dynamicData: payload.dynamicData });
    });
});

app.get('/contact', (req, res) => {
  const payload = {
    dynamicData: {
      administrator: false,
      messageSent: false,
    },
  };

  // Add messageSent credential to the created object
  if (req.session.messageSent) {
    payload.dynamicData.messageSent = true;
    req.session.messageSent = false;
  }

  // Add administrator credential to the created object
  if (req.user) {
    payload.dynamicData.administrator = true;
  }
  res.render('contact', { dynamicData: payload.dynamicData });
});

app.get('/register', (req, res) => {
  // res.render('register');
  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.render('login');
});

// ============================================
// =====GET PROTECTED routes to load pages=====
// ============================================
app.get('/adminportal', isLoggedIn, (req, res) => {
  res.render('adminportal');
});

app.get('/viewmessages', isLoggedIn, (req, res) => {
  // Pull message data from database
  models.messages.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };
      payload.dynamicData.administrator = true;
      res.render('viewmessages', { dynamicData: payload.dynamicData });
    });
});

app.get('/adminbio', isLoggedIn, (req, res) => {
  // Pull bio data from database
  models.Bio.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };
      payload.dynamicData.administrator = true;
      res.render('adminbio', { dynamicData: payload.dynamicData });
    });
});

app.get('/adminpublications', isLoggedIn, (req, res) => {
  // Pull bio data from database
  models.Publications.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };
      payload.dynamicData.administrator = true;

      // Loop through each instance & add type for rendering in the CMS
      for (let i = 0; i < payload.dynamicData.length; i += 1) {
        // Check vertical alignment
        if (payload.dynamicData[i].category == 'article') {
          payload.dynamicData[i].article = true;
        } else {
          payload.dynamicData[i].bookreview = true;
        }
      }

      res.render('adminpublications', { dynamicData: payload.dynamicData });
    });
});

app.get('/adminresearch', isLoggedIn, (req, res) => {
  // Pull research data from database
  models.Research.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };
      payload.dynamicData.administrator = true;
      res.render('adminresearch', { dynamicData: payload.dynamicData });
    });
});
app.get('/adminteaching', isLoggedIn, (req, res) => {
  // Pull teaching data from database
  models.Teaching.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };
      payload.dynamicData.administrator = true;
      res.render('adminteaching', { dynamicData: payload.dynamicData });
    });
});
app.get('/adminevents', isLoggedIn, (req, res) => {
  // Pull teaching data from database
  models.Events.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };
      payload.dynamicData.administrator = true;
      res.render('adminevents', { dynamicData: payload.dynamicData });
    });
});

app.get('/admincarousel', isLoggedIn, (req, res) => {
  models.Carousel.findAll({})
    .then((data) => {
      const payload = { dynamicData: data };
      payload.dynamicData.administrator = true;

      // Loop through each instance & add positional elements for rendering in the CMS
      for (let i = 0; i < payload.dynamicData.length; i += 1) {
        // Check vertical alignment
        if (payload.dynamicData[i].vAlignment == 'bottom') {
          payload.dynamicData[i].bottom = true;
        } else {
          payload.dynamicData[i].top = true;
        }

        // Check horizontal alignment
        if (payload.dynamicData[i].hAlignment == 'left') {
          payload.dynamicData[i].left = true;
        } else {
          payload.dynamicData[i].right = true;
        }
      }
      res.render('admincarousel', { dynamicData: payload.dynamicData });
    });
});

// Delete Message
app.get('/deletemessage/:messageId', isLoggedIn, (req, res) => {
  // Use Sequelize to find the relevant DB object
  // models.messages.findOne({ where: { id: req.params.messageId} })
  models.messages.findOne({
    where: { id: req.params.messageId },
  })
    .then((id) => {
      // Delete the object
      id.destroy();
    }).then(() => {
      res.redirect('../viewmessages');
    });
});

// Delete Carousel Object
app.get('/deleteCarousel/:carouselId', isLoggedIn, (req, res) => {
  // Use Sequelize to find the relevant DB object
  models.Carousel.findOne({ where: { id: req.params.carouselId } })
    .then((id) => {
      // Delete the object
      id.destroy();
    }).then(() => {
      res.redirect('../admincarousel');
    });
});

// Delete Bio Object
app.get('/deleteBio/:bioId', isLoggedIn, (req, res) => {
  // Use Sequelize to find the relevant DB object
  models.Bio.findOne({ where: { id: req.params.bioId } })
    .then((id) => {
      // Delete the object
      id.destroy();
    }).then(() => {
      res.redirect('../adminbio');
    });
});

// Delete Research Object
app.get('/deleteResearch/:researchId', isLoggedIn, (req, res) => {
  // Use Sequelize to find the relevant DB object
  models.Research.findOne({ where: { id: req.params.researchId } })
    .then((id) => {
      // Delete the object
      id.destroy();
    }).then(() => {
      res.redirect('../adminresearch');
    });
});

// Delete Teaching Object
app.get('/deleteTeaching/:teachingId', isLoggedIn, (req, res) => {
  // Use Sequelize to find the relevant DB object
  models.Teaching.findOne({ where: { id: req.params.teachingId } })
    .then((id) => {
      // Delete the object
      id.destroy();
    }).then(() => {
      res.redirect('../adminteaching');
    });
});

// Delete Teaching Object
app.get('/deleteEvents/:eventId', isLoggedIn, (req, res) => {
  // Use Sequelize to find the relevant DB object
  models.Events.findOne({ where: { id: req.params.eventId } })
    .then((id) => {
      // Delete the object
      id.destroy();
    }).then(() => {
      res.redirect('../adminevents');
    });
});

// Delete Publication Object
app.get('/deletePublication/:publicationId', isLoggedIn, (req, res) => {
  // Use Sequelize to find the relevant DB object
  models.Publications.findOne({ where: { id: req.params.publicationId } })
    .then((id) => {
      // Delete the object
      id.destroy();
    }).then(() => {
      res.redirect('../adminpublications');
    });
});

// ===============================================
// =====POST routes to record to the database=====
// ===============================================

// Process registration requests using Passport
app.post('/register', passport.authenticate('local-signup', {
  successRedirect: ('../adminportal'), // if authenticated, proceed to adminportal page
  failureRedirect: ('login'), // if failed, redirect to login page (consider options here!!)
}));

// Process login requests with Passport
app.post('/login', passport.authenticate('local-login', {
  successRedirect: ('../adminportal'), // if login successful, proceed to adminportal page
  failureRedirect: ('login'), // if failed, redirect to login page (consider options here!!)
}));

app.post('/contact/message', (req, res) => {
  const currentDate = new Date();

  // Use Sequelize to push to DB
  models.messages.create({
    name: req.body.fname,
    email: req.body.email,
    message: req.body.message,
    createdAt: currentDate,
    updatedAt: currentDate,
  }).then(() => {
    // Send email to alert the admin that a message was recieved
    const mailOptions = {
      from: 'contact@RaechelLutz.com', // sender address
      to: 'Raechel.Lutz@gmail.com', // list of recipients
      subject: 'Someone left you a message', // Subject line
      text: `Name: ${req.body.fname} \n Message: ${req.body.message}`,
    };

    sendAutomaticEmail(mailOptions);
    req.session.messageSent = true;
    res.redirect('../contact');
  });
});

app.post('/newpublication', isLoggedIn, upload.single('publicationPicture'), (req, res) => {
  let publicationImageToUpload;

  // Check if image was upload & process it
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();

    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }

      // Get S3 filepath & set it to publicationImageToUpload
      publicationImageToUpload = data.Location;

      const currentDate = new Date();

      // Use Sequelize to push to DB
      models.Publications.create({
        elementimage: publicationImageToUpload,
        header: req.body.NewHeader,
        elementtext: req.body.NewBody,
        category: req.body.NewCategory,
        imagecaption: req.body.NewCaption,
        createdAt: currentDate,
        updatedAt: currentDate,
      }).then(() => {
        res.redirect('../adminpublications');
      });
    });

    // Only used if no image loaded
  } else {
    publicationImageToUpload = req.body.publicationImage; // publication image was unchanged

    const currentDate = new Date();

    // Use Sequelize to push to DB
    models.Publications.create({
      elementimage: publicationImageToUpload,
      header: req.body.NewHeader,
      elementtext: req.body.NewBody,
      category: req.body.NewCategory,
      imagecaption: req.body.NewCaption,
      createdAt: currentDate,
      updatedAt: currentDate,
    }).then(() => {
      res.redirect('../adminpublications');
    })
      .catch((err) => {
        // print the error details
        console.log(err);
      });
  }
});

app.post('/newBio', isLoggedIn, upload.single('bioPicture'), (req, res) => {
  let bioImageToUpload;

  // Check if image was upload & process it
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();

    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }

      // Get S3 filepath & set it to bioImageToUpload
      bioImageToUpload = data.Location;
      const currentDate = new Date();

      // Use Sequelize to push to DB
      models.Bio.create({
        elementimage: bioImageToUpload,
        header: req.body.NewHeader,
        elementtext: req.body.NewBody,
        imagecaption: req.body.NewCaption,
        createdAt: currentDate,
        updatedAt: currentDate,
      }).then(() => {
        res.redirect('../adminbio');
      });
    });
    // only used if no picture uploaded
  } else {
    bioImageToUpload = req.body.bioImage; // image was unchanged

    const currentDate = new Date();

    // Use Sequelize to push to DB
    models.Bio.create({
      elementimage: bioImageToUpload,
      header: req.body.NewHeader,
      elementtext: req.body.NewBody,
      imagecaption: req.body.NewCaption,
      createdAt: currentDate,
      updatedAt: currentDate,
    }).then(() => {
      res.redirect('../adminbio');
    });
  }
});

app.post('/newCarousel', isLoggedIn, upload.single('carouselPicture'), (req, res) => {
  let carouselImageToUpload;

  // Check if image was upload & process it
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();

    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }

      // Get S3 filepath & set it to carouselImageToUpload
      carouselImageToUpload = data.Location;
      const currentDate = new Date();

      // Use Sequelize to push to DB
      models.Carousel.create({
        imagepath: carouselImageToUpload,
        quote: req.body.NewQuote,
        quotesource: req.body.NewSource,
        createdAt: currentDate,
        updatedAt: currentDate,
        hAlignment: req.body.newHPosition,
        vAlignment: req.body.newVPosition,
        quoteWidth: req.body.newQuoteWidth,
        quoteHeight: req.body.newQuoteHeight,
      }).then(() => {
        res.redirect('../admincarousel');
      });
    });

    // Only used if no image loaded
  } else {
    carouselImageToUpload = req.body.carouselImage; // carousel image was unchanged

    const currentDate = new Date();

    // Use Sequelize to push to DB
    models.Carousel.create({
      imagepath: carouselImageToUpload,
      quote: req.body.NewQuote,
      quotesource: req.body.NewSource,
      createdAt: currentDate,
      updatedAt: currentDate,
      hAlignment: req.body.newHPosition,
      vAlignment: req.body.newVPosition,
      quoteWidth: req.body.newQuoteWidth,
      quoteHeight: req.body.newQuoteHeight,
    }).then(() => {
      res.redirect('../admincarousel');
    });
  }
});

app.post('/newResearch', isLoggedIn, upload.single('researchPicture'), (req, res) => {
  let researchImageToUpload;

  // Check if image was upload & process it
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();

    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }

      // Get S3 filepath & set it to researchImageToUpload
      researchImageToUpload = data.Location;
      const currentDate = new Date();

      // Use Sequelize to push to DB
      models.Research.create({
        elementimage: researchImageToUpload,
        header: req.body.NewHeader,
        elementtext: req.body.NewBody,
        imagecaption: req.body.NewCaption,
        createdAt: currentDate,
        updatedAt: currentDate,
      }).then(() => {
        res.redirect('../adminresearch');
      });
    });
    // only used if no picture uploaded
  } else {
    researchImageToUpload = req.body.researchImage; // carousel image was unchanged

    const currentDate = new Date();

    // Use Sequelize to push to DB
    models.Research.create({
      elementimage: researchImageToUpload,
      header: req.body.NewHeader,
      elementtext: req.body.NewBody,
      imagecaption: req.body.NewCaption,
      createdAt: currentDate,
      updatedAt: currentDate,
    }).then(() => {
      res.redirect('../adminresearch');
    })
      .catch((err) => {
        // print the error details
        console.log(err);
      });
  }
});

app.post('/newTeaching', isLoggedIn, upload.single('teachingPicture'), (req, res) => {
  let teachingImageToUpload;

  // Check if image was upload & process it
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();

    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }

      // Get S3 filepath & set it to teachingImageToUpload
      teachingImageToUpload = data.Location;

      const currentDate = new Date();

      // Use Sequelize to push to DB
      models.Teaching.create({
        elementimage: teachingImageToUpload,
        header: req.body.NewHeader,
        elementtext: req.body.NewBody,
        imagecaption: req.body.NewCaption,
        createdAt: currentDate,
        updatedAt: currentDate,
      }).then(() => {
        res.redirect('../adminteaching');
      });
    });
    // only used if no picture uploaded
  } else {
    teachingImageToUpload = req.body.teachingImage; // carousel image was unchanged

    const currentDate = new Date();

    // Use Sequelize to push to DB
    models.Teaching.create({
      elementimage: teachingImageToUpload,
      header: req.body.NewHeader,
      elementtext: req.body.NewBody,
      imagecaption: req.body.NewCaption,
      createdAt: currentDate,
      updatedAt: currentDate,
    }).then(() => {
      res.redirect('../adminteaching');
    })
      .catch((err) => {
        // print the error details
        console.log(err);
      });
  }
});

app.post('/newEvents', isLoggedIn, upload.single('eventsPicture'), (req, res) => {
  let eventsImageToUpload;

  // Check if image was upload & process it
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();

    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(`err is ${err}`);
      }

      // Get S3 filepath & set it to eventsImageToUpload
      eventsImageToUpload = data.Location;
      const currentDate = new Date();

      // Use Sequelize to push to DB
      models.Events.create({
        elementimage: eventsImageToUpload,
        header: req.body.NewHeader,
        elementtext: req.body.NewBody,
        imagecaption: req.body.NewCaption,
        createdAt: currentDate,
        updatedAt: currentDate,
      }).then(() => {
        res.redirect('../adminevents');
      });
    });
    // only used if no picture uploaded
  } else {
    eventsImageToUpload = req.body.eventsImage; // carousel image was unchanged

    const currentDate = new Date();

    // Use Sequelize to push to DB
    models.Events.create({
      elementimage: eventsImageToUpload,
      header: req.body.NewHeader,
      elementtext: req.body.NewBody,
      imagecaption: req.body.NewCaption,
      createdAt: currentDate,
      updatedAt: currentDate,
    }).then(() => {
      res.redirect('../adminevents');
    })
      .catch((err) => {
        console.log(err);
      });
  }
});

// Process Carousel update requests
app.post('/updateCarousel', isLoggedIn, upload.single('carouselPicture'), (req, res) => {
  let carouselImageToUpload;

  // Check if image was uploaded & process it
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();

    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }

      // Get S3 filepath & set it to carouselImageToUpload
      carouselImageToUpload = data.Location;
      const currentDate = new Date();

      // Use Sequelize to find the record
      models.Carousel.findOne({ where: { id: req.body.dbid } })
        .then((id) => {
          // Update the data
          id.updateAttributes({
            imagepath: carouselImageToUpload,
            quote: req.body.carouselQuote,
            quotesource: req.body.carouselSource,
            updatedAt: currentDate,
            hAlignment: req.body.hPosition,
            vAlignment: req.body.vPosition,
            quoteWidth: req.body.quoteWidth,
            quoteHeight: req.body.quoteHeight,
          }).then(() => {
            res.redirect('../admincarousel');
          });
        });
    });
  } else {
    carouselImageToUpload = req.body.carouselImage; // carousel image was unchanged
    const currentDate = new Date();

    // Use Sequelize to push to DB
    models.Carousel.findOne({ where: { id: req.body.dbid } })
      .then((id) => {
        // Update the data
        id.updateAttributes({
          imagepath: carouselImageToUpload,
          quote: req.body.carouselQuote,
          quotesource: req.body.carouselSource,
          updatedAt: currentDate,
          hAlignment: req.body.hPosition,
          vAlignment: req.body.vPosition,
          quoteWidth: req.body.quoteWidth,
          quoteHeight: req.body.quoteHeight,
        }).then(() => {
          res.redirect('../admincarousel');
        });
      });
  }
});

// Process Bio update requests
app.post('/updateBio/:bioId', isLoggedIn, upload.single('biopicture'), (req, res) => {
  // Previous settings. Used if not overwritten below.
  let bioPageImageToUpload = req.body[`bioPageImage${req.params.bioId}`];

  // Check if any image(s) were uploaded
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();
    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }

      // Get S3 filepath & set it to bioPageImageToUpload
      bioPageImageToUpload = data.Location;
      const currentDate = new Date();

      // Use Sequelize to find the relevant DB object
      models.Bio.findOne({ where: { id: req.params.bioId } })

        .then((id) => {
          // Update the data
          id.updateAttributes({
            elementtext: req.body[`BioText${req.params.bioId}`],
            header: req.body[`BioHeader${req.params.bioId}`],
            elementimage: bioPageImageToUpload,
            imagecaption: req.body[`BioCaption${req.params.bioId}`],
            updatedAt: currentDate,
          }).then(() => {
            res.redirect('../adminbio');
          });
        });
    });
  } else { // No image to upload, just update the text
    const currentDate = new Date();

    // Use Sequelize to find the relevant DB object
    models.Bio.findOne({ where: { id: req.params.bioId } })
      .then((id) => {
        // Update the data
        id.updateAttributes({
          elementtext: req.body[`BioText${req.params.bioId}`],
          header: req.body[`BioHeader${req.params.bioId}`],
          imagecaption: req.body[`BioCaption${req.params.bioId}`],
          updatedAt: currentDate,
        }).then(() => {
          res.redirect('../adminbio');
        });
      });
  }
});

// Process Research update requests
app.post('/updateResearch/:researchId', isLoggedIn, upload.single('researchpicture'), (req, res) => {
  // Previous settings. Used if not overwritten below.
  let researchPageImageToUpload = req.body.researchPageImage;

  // Check if any image(s) were uploaded
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();

    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }

      // Get S3 filepath & set it to researchPageImageToUpload
      researchPageImageToUpload = data.Location;
      const currentDate = new Date();

      // Use Sequelize to find the relevant DB object
      models.Research.findOne({ where: { id: req.params.researchId } })
        .then((id) => {
          // Update the data
          id.updateAttributes({
            elementtext: req.body[`ResearchText${req.params.researchId}`],
            header: req.body[`ResearchHeader${req.params.researchId}`],
            elementimage: researchPageImageToUpload,
            imagecaption: req.body[`ResearchCaption${req.params.researchId}`],
            updatedAt: currentDate,
          }).then(() => {
            res.redirect('../adminresearch');
          });
        });
    });
  } else { // No image to upload, just update the text
    const currentDate = new Date();

    // Use Sequelize to find the relevant DB object
    models.Research.findOne({ where: { id: req.params.researchId } })

      .then((id) => {
        // Update the data
        id.updateAttributes({
          // optdes = req.body['optiondes' + optcount]
          elementtext: req.body[`ResearchText${req.params.researchId}`],
          header: req.body[`ResearchHeader${req.params.researchId}`],
          imagecaption: req.body[`ResearchCaption${req.params.researchId}`],
          updatedAt: currentDate,
        }).then(() => {
          res.redirect('../adminresearch');
        });
      });
  }
});

// Process Teaching update requests
app.post('/updateTeaching/:teachingId', isLoggedIn, upload.single('teachingpicture'), (req, res) => {
  // Previous settings. Used if not overwritten below.
  let teachingPageImageToUpload = req.body.teachingPageImage;

  // Check if any image(s) were uploaded
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();
    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }

      // Get S3 filepath & set it to teachingPageImageToUpload
      teachingPageImageToUpload = data.Location;

      const currentDate = new Date();

      // Use Sequelize to find the relevant DB object
      models.Teaching.findOne({ where: { id: req.params.teachingId } })

        .then((id) => {
          // Update the data
          id.updateAttributes({
            elementtext: req.body[`TeachingText${req.params.teachingId}`],
            header: req.body[`TeachingHeader${req.params.teachingId}`],
            elementimage: teachingPageImageToUpload,
            imagecaption: req.body[`TeachingCaption${req.params.teachingId}`],
            updatedAt: currentDate,
          }).then(() => {
            res.redirect('../adminteaching');
          });
        });
    });
  } else { // No image to upload, just update the text
    const currentDate = new Date();

    // Use Sequelize to find the relevant DB object
    models.Teaching.findOne({ where: { id: req.params.teachingId } })
      .then((id) => {
        // Update the data
        id.updateAttributes({
          // optdes = req.body['optiondes' + optcount]
          elementtext: req.body[`TeachingText${req.params.teachingId}`],
          header: req.body[`TeachingHeader${req.params.teachingId}`],
          imagecaption: req.body[`TeachingCaption${req.params.teachingId}`],
          updatedAt: currentDate,
        }).then(() => {
          res.redirect('../adminteaching');
        });
      });
  }
});

// Process Events update requests
app.post('/updateEvents/:eventsId', isLoggedIn, upload.single('eventspicture'), (req, res) => {
  // Previous settings. Used if not overwritten below.
  let eventsPageImageToUpload = req.body.eventsPageImage;

  // Check if any image(s) were uploaded
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();

    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }

      // Get S3 filepath & set it to eventsPageImageToUpload
      eventsPageImageToUpload = data.Location;

      const currentDate = new Date();

      // Use Sequelize to find the relevant DB object
      models.Events.findOne({ where: { id: req.params.eventsId } })

        .then((id) => {
          // Update the data
          id.updateAttributes({
            elementtext: req.body[`EventsText${req.params.eventsId}`],
            header: req.body[`EventsHeader${req.params.eventsId}`],
            elementimage: eventsPageImageToUpload,
            imagecaption: req.body[`EventsCaption${req.params.eventsId}`],
            updatedAt: currentDate,
          }).then(() => {
            res.redirect('../adminevents');
          });
        });
    });
  } else { // No image to upload, just update the text
    const currentDate = new Date();

    // Use Sequelize to find the relevant DB object
    models.Events.findOne({ where: { id: req.params.eventsId } })

      .then((id) => {
        // Update the data
        id.updateAttributes({
          // optdes = req.body['optiondes' + optcount]
          elementtext: req.body[`EventsText${req.params.eventsId}`],
          header: req.body[`EventsHeader${req.params.eventsId}`],
          imagecaption: req.body[`EventsCaption${req.params.eventsId}`],
          updatedAt: currentDate,
        }).then(() => {
          res.redirect('../adminevents');
        });
      });
  }
});

// Process Publication update requests
app.post('/updatepublication/:publicationId', isLoggedIn, upload.single('publicationpicture'), (req, res) => {
  // Previous settings. Used if not overwritten below.
  let publicationImageToUpload = req.body[`publicationImage${req.params.publicationId}`];

  // Check if any image(s) were uploaded
  if (typeof req.file !== 'undefined') {
    // Process file being uploaded
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const stream = fs.createReadStream(req.file.path); // Create "stream" of the file

    // Create Amazon S3 specific object
    const s3 = new aws.S3();

    const params = {
      Bucket: S3_BUCKET,
      Key: fileName, // This is what S3 will use to store the data uploaded.
      Body: stream, // the actual *file* being uploaded
      ContentType: fileType, // type of file being uploaded
      ACL: 'public-read', // Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3AccessKeyId,
      secretAccessKey: S3SecretAccessKey,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }

      // Get S3 filepath & set it to publicationsImageToUpload
      publicationImageToUpload = data.Location;

      const currentDate = new Date();

      // Use Sequelize to find the relevant DB object
      models.Publications.findOne({ where: { id: req.params.publicationId } })

        .then((id) => {
          // Update the data
          id.updateAttributes({
            elementtext: req.body[`PublicationText${req.params.publicationId}`],
            header: req.body[`PublicationHeader${req.params.publicationId}`],
            category: req.body[`category${req.params.publicationId}`],
            elementimage: publicationImageToUpload,
            imagecaption: req.body[`PublicationCaption${req.params.publicationId}`],
            updatedAt: currentDate,
          }).then(() => {
            res.redirect('../adminpublications');
          });
        });
    });
  } else { // No image to upload, just update the text
    const currentDate = new Date();

    // Use Sequelize to find the relevant DB object
    models.Publications.findOne({ where: { id: req.params.publicationId } })

      .then((id) => {
        // Update the data
        id.updateAttributes({
          // optdes = req.body['optiondes' + optcount]
          elementtext: req.body[`PublicationText${req.params.publicationId}`],
          header: req.body[`PublicationHeader${req.params.publicationId}`],
          category: req.body[`category${req.params.publicationId}`],
          imagecaption: req.body[`PublicationCaption${req.params.publicationId}`],
          updatedAt: currentDate,
        }).then(() => {
          res.redirect('../adminpublications');
        });
      });
  }
});

module.exports = app;
