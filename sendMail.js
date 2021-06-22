const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SET_API_KEY);
require('dotenv').config()

async function sendMail(req, subject, text, attachments) {
    if (attachments) {
        stat = await sgMail.send({
            to: req.body.email,
            from: 'hunnygoel3468@gmail.com',
            subject: subject || " ",
            text: text || " ",
            attachments: attachments
        })
    } else {
        stat = await sgMail.send({
            to: req.body.email,
            from: 'hunnygoel3468@gmail.com',
            subject: subject || " ",
            text: text || " "
        })
    }
    if (stat) {
        return true
    } else {
        return false
    }

}

module.exports = sendMail;