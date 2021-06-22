const express = require('express')
const router = new express.Router()
const mongoose = require('mongoose')
const passport = require('passport')
const bcryption = require('../bcryption')
const bcrypt = require('bcryptjs')
const { forwardAuthenticated, ensureAuthenticated } = require('../auth');
// Importing All the models
const Admin = require('../models/admin')
const Invoice = require('../models/invoice')
const PendingRequest = require('../models/pendingRequests')
const Products = require('../models/products')
const User = require('../models/user')
const WarrantyDeclare = require('../models/warrantyDeclare')
const ModeratorApproval = require('../models/pendingModerator')
const pdfGenerate = require('../pdfGenerator')
const hbs = require('hbs');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile)
const path = require("path")


// Importing WarrantyIdGenerator
const generateWarrantyId = require('../generateWarrantyId')

// entry point of project
router.get('', forwardAuthenticated, (req, res) => {
        res.render("index", {
            title: 'Welcome To SunGrow'
        })
    })
    // admin signUp portion
router.get('/adminSignup', forwardAuthenticated, (req, res) => {
        res.render('adminSignup')
    })
    //admin dash portion
router.get('/adminDash', ensureAuthenticated, async(req, res) => {
    var dashboard = {
        moderator: null,
        warranty: null
    }
    await ModeratorApproval.countDocuments({}, function(err, count) {
        if (err) {
            res.status(400)
            res.render('error', {
                error_message: {
                    heading: 'AN UNKNOWN ERROR OCCURED',
                    msg: 'An unknown error occured. Please try again after sometime.',
                    link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/getPendingRequest'
                }
            })
        } else {
            dashboard.moderator = count - 1
        }
    })
    await PendingRequest.countDocuments({}, function(err, count) {
        if (err) {
            res.status(400)
            res.render('error', {
                error_message: {
                    heading: 'AN UNKNOWN ERROR OCCURED',
                    msg: 'An unknown error occured. Please try again after sometime.',
                    link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/getPendingRequest'
                }
            })
        } else {
            dashboard.warranty = count
        }
    })
    res.render('adminDashboard', { layout: '/layouts/adminDash', dashboard: dashboard })
})

//Moderator Dashboard
router.get('/moderatorDash', ensureAuthenticated, async(req, res) => {
        var dashboard = null;
        await PendingRequest.countDocuments({}, function(err, count) {
            if (err) {
                res.status(400)
                res.render('error', {
                    error_message: {
                        heading: 'AN UNKNOWN ERROR OCCURED',
                        msg: 'An unknown error occured. Please try again after sometime.',
                        link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/getPendingRequest'
                    }
                })
            } else {
                dashboard = count
            }
        })
        res.render('moderatorDashboard', { layout: '/layouts/moderatorDash', dashboard: dashboard })
    })
    //admin signUp registration
router.post("/submit", async(req, res) => {
        req.body.role = 'moderator'
        const admin = new ModeratorApproval(req.body)
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(admin.password, salt, (err, hash) => {
                if (err) throw err;
                admin.password = hash;
                admin
                    .save()
                    .then(user => {
                        req.flash('success_msg', "Successfully Registered! You can login once Admin approved your access.")
                        res.redirect("/admin")

                    })
                    .catch((e) => {
                        req.flash('error_msg', "Opps Something Went Wrong")
                        res.redirect('/admin/adminSignup')
                    })
            })
        })
    })
    // login page for admin
router.post('/login', async(req, res, next) => {
    var person = await Admin.findOne({ 'email': req.body.email })

    passport.authenticate('local', {
        successRedirect: (person == null ? false : person.role == 'admin') ? '/admin/adminDash' : '/moderator/moderatorDash',
        failureRedirect: '/admin',
        failureFlash: true
    })(req, res, next);
})
router.get('/logout', async(req, res) => {
    req.logout();
    if ((req.headers.referer).search('/admin/accountSettings') > 0) {
        req.flash('success_msg', 'Successfully Updated Please Login Again');
    } else {
        req.flash('success_msg', 'Successfully Logged Out')
    }
    res.redirect('/admin');
})


// Get list of all the pending request
router.get('/getPendingRequest', ensureAuthenticated, async(req, res) => {
    await PendingRequest.find({}, function(err, pendingRequests) {
        if (err) {
            res.status(400)
            res.render('error', {
                error_message: {
                    heading: 'AN UNKNOWN ERROR OCCURED',
                    msg: 'An unknown error occured. Please try again after sometime.',
                    link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/getPendingRequest'
                }
            })
        } else {
            pendingRequests.role = req.user.role
            res.render("pendingWarranty", {
                layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'),
                pendingRequest: pendingRequests,
                role: req.user.role
            })
        }
    })
})

// Disapproving the pending warranty request
router.delete('/disapprovePendingRequest/:invoiceNumber', ensureAuthenticated, async(req, res) => {
    await PendingRequest.findOneAndDelete({ "invoiceNumber": req.params.invoiceNumber.toLowerCase() }, function(err, result) {
        if (err) {
            res.status(400)
            res.render('error', {
                error_message: {
                    heading: 'AN UNKNOWN ERROR OCCURED',
                    msg: 'An unknown error occured. Please try again after sometime.',
                    link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/getPendingRequest'
                }
            })
        } else {
            res.render("pendingWarranty", {
                layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'),
                pendingRequest: result,
                role: req.user.role
            })
        }
    })
})

router.post('/approvePendingRequest', ensureAuthenticated, async(req, res) => {
    if (req.body) {
        if (!await Invoice.findOne({ "invoice_no": req.body.invoiceNumber.toLowerCase() })) {
            res.status(400)
            res.render('error', {
                error_message: {
                    heading: 'INVOICE NOT FOUND',
                    msg: 'The details for the Invoice ' + req.body.invoiceNumber.toUpperCase() + ' not found. Please insert Invoice.',
                    link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/getPendingRequest'
                }
            })
        } else {
            session = await mongoose.startSession()
            session.startTransaction()
            try {
                var userData;
                const userExist = await User.findOne({ "email": req.body.email }).lean()
                console.log(userExist)
                if (!userExist) {
                    userData = {
                        name: req.body.name,
                        phone: req.body.phone,
                        email: req.body.email,
                        address: req.body.address,
                        district: req.body.district,
                        city: req.body.city,
                        state: req.body.state,
                        pin: req.body.pin,
                        country: req.body.country,
                        gstin: req.body.gstin,
                        invoice: req.body.invoiceNumber
                    }
                    const user = new User(userData)
                    await user.save({ session })
                } else {
                    userData = userExist
                }
                var productData = []
                if (Array.isArray(req.body.serialNumbers)) {
                    for (var i = 0; i < req.body.serialNumbers.length; i++) {
                        productData[i] = await Products.findOne({ "serial_no": req.body.serialNumbers[i] })
                        if (!productData[i]) {
                            res.status(400)
                            res.render('error', {
                                error_message: {
                                    heading: 'PRODUCT NOT FOUND',
                                    msg: 'The details for the product having Serial No: ' + req.body.serialNumbers[i].toUpperCase() + ' not found. Please insert Product.',
                                    link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/getPendingRequest'
                                }
                            })
                            throw Error('Product Not Found')
                        } else {
                            var warrantyData = {
                                warranty_no: await generateWarrantyId(req, req.body.serialNumbers[i], false),
                                serial_no: req.body.serialNumbers[i],
                                warranty_date: req.body.warrantyReferenceDate[i],
                                warranty_tenure: req.body.tenure[i]
                            }
                            warrantyData.model = productData[i].model
                            console.log(userData)
                            const warranty = new WarrantyDeclare(warrantyData)
                            await warranty.save({ session })
                            let content = await readFile(path.join(__dirname, '../views/warrantyCertificateTemplate.hbs'), 'utf8');
                            let template = hbs.handlebars.compile(content)
                            let result = template({ warrantyData: warrantyData, userData: userData })

                            if (!result) {
                                throw Error('Error Compiling Warranty Template')
                            } else {
                                pdfGenerate(req, res, result, (value) => {
                                    if (value == true) {
                                        res.status(200)
                                    } else {
                                        throw Error('Error Generating PDF')
                                    }
                                })
                            }

                        }
                    }
                } else {
                    productData[0] = await Products.findOne({ "serial_no": req.body.serialNumbers })
                    if (!productData) {
                        res.status(400)
                        res.render('error', {
                            error_message: {
                                heading: 'PRODUCT NOT FOUND',
                                msg: 'The details for the product having Serial No: ' + req.body.serialNumbers.toUpperCase() + ' not found. Please insert Product.',
                                link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/getPendingRequest'
                            }
                        })
                        throw Error('Product Not Found')
                    } else {
                        var warrantyData = {
                            warranty_no: await generateWarrantyId(req, req.body.serialNumbers, false),
                            serial_no: req.body.serialNumbers,
                            warranty_date: req.body.warrantyReferenceDate,
                            warranty_tenure: req.body.tenure
                        }
                        warrantyData.model = productData[0].model

                        const warranty = new WarrantyDeclare(warrantyData)
                        await warranty.save({ session })
                        let content = await readFile(path.join(__dirname, '../views/warrantyCertificateTemplate.hbs'), 'utf8');
                        let template = hbs.handlebars.compile(content)
                        let result = template({ warrantyData: warrantyData, userData: userData })

                        if (!result) {
                            throw Error('Error Compiling Warranty Template')
                        } else {
                            pdfGenerate(req, res, result, (value) => {
                                if (value == true) {
                                    res.status(200)
                                } else {
                                    throw Error('Error Generating PDF')
                                }
                            })
                        }

                    }
                }
                await PendingRequest.findOneAndRemove({ "invoiceNumber": req.body.invoiceNumber }, { session })
                await session.commitTransaction()
                res.status(200)
                res.render('success', {
                    success_msg: {
                        title: 'REQUEST APPROVED SUCCESSFULLY',
                        msg: 'The Warranty has been successfully approved and the warranty certificates will be sent to the customer email address.',
                        link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/getPendingRequest'
                    }
                })
            } catch (err) {
                console.log(err)
                await session.abortTransaction()
                res.status(400)
                if (err.name === 'MongoError' && err.code === 11000) {
                    res.render('error', {
                        error_message: {
                            heading: 'Warranty Already Registered',
                            msg: 'Warranty for product with Serial No:' + err.keyValue.serial_no + ' already registered.',
                            link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/getPendingRequest'
                        }
                    })
                } else {
                    res.render('error', {
                        error_message: {
                            heading: 'AN UNKNOWN ERROR OCCURED',
                            msg: 'An unknown error occured. Please try again after sometime.',
                            link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/getPendingRequest'
                        }
                    })
                }
            } finally {
                session.endSession();
            }
        }
    }
})

router.get('/moderatorApproval', ensureAuthenticated, async(req, res) => {
    if (req.user.role != 'admin') {
        res.status(401)
        res.render('error', {
            error_message: {
                heading: 'UNAUTHORIZED ACCESS',
                msg: 'Authorization Failure! You are not autorized to access.',
                link: '/moderator/moderatorDash'
            }
        })
    } else {
        await ModeratorApproval.find({}, function(err, data) {
            if (err) {
                res.status(400)
                res.render('error', {
                    error_message: {
                        heading: 'AN UNKNOWN ERROR OCCURED',
                        msg: 'An unknown error occured. Please try again after sometime.',
                        link: '/admin/moderatorApproval'
                    }
                })
            } else {
                res.render('moderatorApproval', {
                    layout: '/layouts/adminDash',
                    moderatorDetails: data
                })
            }
        })
    }
})

router.post('/approvePendingModerator', ensureAuthenticated, async(req, res) => {
    if (req.user.role != 'admin') {
        res.status(401)
        res.render('error', {
            error_message: {
                heading: 'UNAUTHORIZED ACCESS',
                msg: 'Authorization Failure! You are not autorized to access.',
                link: '/moderator/moderatorDash'
            }
        })
    } else {
        if (req.body) {
            session = await mongoose.startSession()
            session.startTransaction()
            try {
                var notationDB = await ModeratorApproval.findOneAndUpdate({ _id: "5e9ea3a7b4d1bb62161ac31e" }, { $inc: { sequence: 1 } }, { new: false, session });
                moderatorData = await ModeratorApproval.findOne({ email: req.body.email })
                var modData = {
                    full_name: moderatorData.full_name,
                    phone_number: moderatorData.phone_number,
                    email: moderatorData.email,
                    password: moderatorData.password,
                    role: moderatorData.role,
                    notation: notationDB.sequence
                }
                const moderatorApprove = new Admin(modData)
                await moderatorApprove.save({ session })
                await ModeratorApproval.findOneAndRemove({ email: req.body.email }, { session })
                await session.commitTransaction()
                res.status(200)
                res.render('success', {
                    success_msg: {
                        title: 'REQUEST APPROVED SUCCESSFULLY',
                        msg: 'The Moderator Request is successfully approved. The person can now access the Moderator Panel',
                        link: '/admin/moderatorApproval'
                    }
                })
            } catch (err) {
                await session.abortTransaction()
                console.log(err)
                res.status(400)
                if (err.name === 'MongoError' && err.code === 11000) {
                    res.render('error', {
                        error_message: {
                            heading: 'Warranty Already Registered',
                            msg: 'Moderator with email: ' + err.keyValue.serial_no + ' is already registered.',
                            link: '/admin/moderatorApproval'
                        }
                    })
                } else {
                    res.render('error', {
                        error_message: {
                            heading: 'AN UNKNOWN ERROR OCCURED',
                            msg: 'An unknown error occured. Please try again after sometime.',
                            link: '/admin/moderatorApproval'
                        }
                    })
                }
            } finally {
                session.endSession()
            }
        }
    }
})

// Disapproving the pending warranty request
router.delete('/disapproveModerator/:email', ensureAuthenticated, async(req, res) => {
    if (req.user.role != 'admin') {
        res.status(401)
        res.render('error', {
            error_message: {
                heading: 'UNAUTHORIZED ACCESS',
                msg: 'Authorization Failure! You are not autorized to access.',
                link: '/moderator/moderatorDash'
            }
        })
    } else {
        await ModeratorApproval.findOneAndDelete({ email: req.params.email }, function(err, result) {
            if (err) {
                res.status(400)
                res.render('error', {
                    error_message: {
                        heading: 'AN UNKNOWN ERROR OCCURED',
                        msg: 'An unknown error occured. Please try again after sometime.',
                        link: '/admin/moderatorApproval'
                    }
                })
            } else {
                res.status(200)
                res.render('success', {
                    success_msg: {
                        title: 'MODERATOR REQUEST DELETED SUCCESSFULLY',
                        msg: 'The Moderator Request is disapproved successfully and is removed permanently from the database.',
                        link: '/admin/moderatorApproval'
                    }
                })
            }
        })
    }
})


//Account Setting Page
router.get('/accountSettings', ensureAuthenticated, (req, res) => {
    res.render('accountSetting', {
        layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'),
        userDetails: req.user
    })
})
router.post('/accountSettings', ensureAuthenticated, async(req, res) => {
    try {
        Admin.updateOne({ _id: req.body.id }, { full_name: req.body.full_name, phone_number: req.body.phone_number, email: req.body.email }, (err, data) => {
            if (data) {
                res.status(200)
                res.header({ update: 'updated account' })
                res.redirect((req.user.role == 'admin' ? '/admin/logout' : '/moderator/logout'))
            } else {
                throw Error()
            }
        })
    } catch (e) {
        res.status(400)
        res.render('error', {
            error_message: {
                heading: 'ERROR WHILE UPDATING DETAILS',
                msg: 'An unknown error occured when attempting to update the details. Please try again after sometime.',
                link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/accountSettings'
            }
        })
    }
})
router.post('/changePassword/accountSettings', async(req, res) => {
    try {
        const userExist = await Admin.findOne({ _id: req.body.id })
        if (userExist) {
            bcrypt.compare(req.body.old_pass, userExist.password, (err, match) => {
                if (match) {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(req.body.new_pass, salt, (err, hash) => {
                            if (err) throw err;
                            userExist.password = hash;
                            userExist.save().then(user => {
                                    res.status(200)
                                    res.redirect((req.user.role == 'admin' ? '/admin/logout' : '/moderator/logout'))
                                })
                                .catch((e) => {
                                    req.flash('error_msg', "Opps Something Went Wrong")
                                    res.redirect((req.user.role == 'admin' ? '/admin' : '/moderator') + '/accountSettings')
                                })

                        })
                    })
                } else {
                    req.flash('error_msg', "Wrong Old Password")
                    res.redirect((req.user.role == 'admin' ? '/admin' : '/moderator') + '/accountSettings')
                }
            })
        }
    } catch (e) {
        res.status(400)
        res.render('error', {
            error_message: {
                heading: 'ERROR WHILE UPDATING PASSWORD',
                msg: 'An unknown error occured when attempting to update the password. Please try again after sometime.',
                link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/accountSettings'
            }
        })
    }
})
module.exports = router