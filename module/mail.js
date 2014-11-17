// for sending email
var setting = require('../settings/mail');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(setting);
module.exports = transporter;