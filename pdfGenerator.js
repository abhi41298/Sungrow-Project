const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SET_API_KEY);
require('dotenv').config()
let pdf = require("html-pdf");

function pdfGenerate(req, res, result, callback) {
    let options = {
        "format": "A4",
        "orientation": "portrait",

        "border": {
            "top": "1cm", // default is 0, units: mm, cm, in, px
            "right": "2.5cm",
            "bottom": "1cm",
            "left": "2.5cm"
        },
        "footer": {
            "height": "15mm",
            "contents": '<div class="last"><h4>* THIS IS A COMPUTER GENERATED DOCUMENT AND REQUIRES NO SIGNATURE *</h4></div>'
        },
        "type": "pdf"
    };
    pdf.create(result, options).toBuffer(async function(err, buffer) {
        let stat
        if (err) {
            res.status(400)
            res.redirect('/error')
        } else {
            stat = await sgMail.send({
                to: req.body.email,
                from: 'hunnygoel3468@gmail.com',
                subject: 'Warranty Certificate',
                text: 'Warranty has been registered successfully and the certificate for the same is attached below.',
                attachments: [{
                    content: buffer.toString('base64'),
                    filename: "warranty.pdf",
                    //   path : req.file.path,
                    type: "application/pdf",
                }],
            })
        }
        if (stat) {
            callback(true)
        } else {
            callback(false)
        }
    });
}
module.exports = pdfGenerate