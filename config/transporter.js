//Settings for email application
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
        user: '', // Your email id
        pass: '' // Your password
    }
});

module.exports = transporter;
