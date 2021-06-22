const express = require('express')
const mongoose = require('mongoose')
const router = new express.Router()
const User = require('../models/user')
const Invoice = require('../models/invoice')
const PendingRequest = require('../models/pendingRequests')
const WarrantyDeclare = require('../models/warrantyDeclare')
const Products = require('../models/products')
const generateWarrantyId = require('../generateWarrantyId')
const hbs = require('hbs');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile)
const path = require("path")
const pdfGenerate = require('../pdfGenerator')

//get Request
router.get('/', (req, res) => {
    res.render('service', { layout: '/layouts/userTemplate' })
})
router.get('/checkLine', (req, res) => {
        res.render('checkPage', { layout: '/layouts/userTemplate' })
    })
    // add user in the database and check warranty
router.get('/addUser', (req, res) => {
        res.render('userReg')
    })
    //Check The User Avalibility In Database
router.post('/userCheck', async(req, res) => {
    var notFound = true
    var productData = [];
    invoiceData = await Invoice.findOne({ invoice_no: req.body.invoiceNumber })
    if (invoiceData && invoiceData.customer_email == req.body.email) {
        userData = await User.findOne({ email: req.body.email }).lean()
        if (userData) {
            if (Array.isArray(req.body.serialNumber)) {
                var check = false
                for (var i = 0; i < req.body.serialNumber.length; i++) {
                    productData[i] = await Products.findOne({ "serial_no": req.body.serialNumber[i] })
                    if (!productData) {
                        check = true
                    }
                }
                if (!check) {
                    notFound = false
                }
            } else {
                productData[0] = await Products.findOne({ serial_no: req.body.serialNumber })
                if (productData) {
                    notFound = false
                }
            }
        }
    }
    if (notFound) {
        res.render('userReg', { layout: '/layouts/userTemplate', previousData: req.body })
    } else {
        const session = await mongoose.startSession()
        session.startTransaction();
        var warrantyData = ''
        var statusHold = ''
        try {
            if (Array.isArray(req.body.serialNumber)) {
                for (var i = 0; i < req.body.serialNumber.length; i++) {
                    warrantyData = {
                        warranty_no: (await generateWarrantyId(req, req.body.serialNumber[i], true)).toUpperCase(),
                        serial_no: req.body.serialNumber[i].toUpperCase(),
                        warranty_date: productData[i].sg_ref_date.toUpperCase(),
                        warranty_tenure: productData[i].warranty_tenure
                    }
                    warranty = new WarrantyDeclare(warrantyData)
                    await warranty.save({ session })
                        //generate pdf and send mail    
                    warrantyData.model = productData[i].model.toUpperCase()
                    let content = await readFile(path.join(__dirname, '../views/warrantyCertificateTemplate.hbs'), 'utf8');
                    let template = hbs.handlebars.compile(content)
                    let result = template({ warrantyData: warrantyData, userData: userData })
                        // res.send(result)
                    if (!result) {
                        throw Error('Error Compiling Warranty Template')
                    } else {
                        pdfGenerate(req, res, result, (value) => {
                            if (value == true) {
                                statusHold = true
                            } else {
                                throw Error('Error Generating PDF')
                            }
                        })
                    }
                }
            } else {
                warrantyData = {
                    warranty_no: (await generateWarrantyId(req, req.body.serialNumber, true)).toUpperCase(),
                    serial_no: req.body.serialNumber.toUpperCase(),
                    warranty_date: productData[0].sg_ref_date.toUpperCase(),
                    warranty_tenure: productData[0].warranty_tenure
                }
                warranty = new WarrantyDeclare(warrantyData)
                await warranty.save({ session })
                    //generate warranty and send mail
                warrantyData.model = productData[0].model.toUpperCase()
                let content = await readFile(path.join(__dirname, '../views/warrantyCertificateTemplate.hbs'), 'utf8');
                let template = hbs.handlebars.compile(content)
                let result = template({ userData: userData, warrantyData: warrantyData })
                if (!result) {
                    throw Error('Error Compiling Warranty Template')

                } else {
                    pdfGenerate(req, res, result, (value) => {
                        if (value == true) {
                            statusHold = true
                        } else {
                            throw Error('Error Generating PDF')
                        }
                    })
                }
            }
            await session.commitTransaction()
            res.status(200)
            res.render('success', { layout: '/layouts/userTemplate', success_msg: { title: 'Warranty Registered Successfully!', msg: 'The Warranty has been registered successfully and the warranty certificates will be sent to you on the email address provided', link: '/' } })
        } catch (err) {
            console.log(err)
            await session.abortTransaction()
            res.status(400)
            if (err.name === 'MongoError' && err.code === 11000) {
                res.render('error', { error_message: { heading: 'Warranty Already Registered', msg: 'Warranty for product with Serial No:' + err.keyValue.serial_no + ' already registered.', link: '/' } })
            } else {
                console.log(err)
                res.redirect('/error')
            }
        } finally {
            session.endSession()
        }
    }
})


router.post('/submitWarrantyRequest', async(req, res) => {
    var serialNumbers = []
    if (Array.isArray(req.body.serialNumber)) {
        for (var i = 0; i < req.body.serialNumber.length; i++) {
            serialNumbers[i] = {
                'serialNumber': req.body.serialNumber[i],
                'installationDate': req.body.installationDate[i]
            }
        }
    } else {
        serialNumbers[0] = {
            'serialNumber': req.body.serialNumber,
            'installationDate': req.body.installation
        }
    }
    const requestData = {
        'invoiceNumber': req.body.invoiceNumber,
        'name': req.body.name,
        'email': req.body.email,
        'phone': req.body.phone,
        'address': req.body.address,
        'district': req.body.district,
        'city': req.body.city,
        'state': req.body.state,
        'country': req.body.country,
        'pin': req.body.pin,
        'serialNumbers': serialNumbers
    }
    session = await mongoose.startSession()
    session.startTransaction()
    try {
        request = new PendingRequest(requestData)
        await request.save({ session })
        await session.commitTransaction()
        res.status(200)
        res.render('success', { layout: '/layouts/userTemplate', success_msg: { title: 'Request Logged Successfully!', msg: 'The Request has been logged to Database. You will recieve your Warranty Certificates on email once approved by the moderator', link: '/' } })
    } catch (err) {
        await session.abortTransaction()
        res.status(400)
        res.redirect('/error')
    } finally {
        await session.endSession()
    }
})

router.get('/error', (req, res) => {
    res.render('error')
})
router.get('/success', (req, res) => {
    res.render('success')
})
module.exports = router