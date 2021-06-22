const express = require('express')
const router = new express.Router()
const mongoose = require('mongoose')
const Products = require("../models/products")
const User = require("../models/user")
const Invoice = require("../models/invoice")
const { forwardAuthenticated, ensureAuthenticated } = require('../auth');
//Product Add Form
router.get('/addProductPage', ensureAuthenticated, (req, res) => {
        res.render('addProductPage', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), role: req.user.role })
    })
    //Add product
router.post('/addProducts', ensureAuthenticated, async(req, res) => {
        if (req.body) {
            const session = await mongoose.startSession()
            session.startTransaction();
            try {
                if (Array.isArray(req.body.serialNumber)) {
                    for (var i = 0; i < req.body.serialNumber.length; i++) {
                        var productData = {
                            serial_no: req.body.serialNumber[i],
                            type: req.body.category[i],
                            model: req.body.model[i],
                            sg_ref_date: req.body.sgReferenceDate[i],
                            warranty_tenure: req.body.warranty_tenure[i]
                        }
                        const data = new Products(productData)
                        await data.save({ session });
                    }
                } else {
                    var productData = {
                        serial_no: req.body.serialNumber,
                        type: req.body.category,
                        model: req.body.model,
                        sg_ref_date: req.body.sgReferenceDate,
                        warranty_tenure: req.body.warranty_tenure
                    }
                    const data = new Products(productData)
                    await data.save({ session });
                }
                await session.commitTransaction()
                res.status(200)
                res.render('success', {
                    success_msg: {
                        title: 'PRODUCT ADDED SUCCESSFULLY',
                        msg: 'The Product/s have been successfully added to the database.',
                        link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/add/addProductPage'
                    }
                })
            } catch (err) {
                await session.abortTransaction()
                console.error(err)
                if (err.name === 'MongoError' && err.code === 11000) {
                    res.render('error', {
                        error_message: {
                            heading: 'PRODUCT ALREADY EXIST',
                            msg: 'Product with Serial No:' + err.keyValue.serial_no + ' already exist.',
                            link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/add/addProductPage'
                        }
                    })
                } else {
                    res.render('error', {
                        error_message: {
                            heading: 'AN UNKNOWN ERROR OCCURED',
                            msg: 'An unknown error occured. Please try again after sometime.',
                            link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/add/addProductPage'
                        }
                    })
                }
            } finally {
                session.endSession();
            }
        }
    })
    // Add New Invoice In Exsisting User
    //Add Invoice Page
router.get('/addInvoicePage', ensureAuthenticated, async(req, res) => {
        res.render('addInvoicePage', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), role: req.user.role })
    })
    //Add Invoice
router.post('/addInvoice', ensureAuthenticated, async(req, res) => {
        if (req.body) {
            var productMissing = false
            if (Array.isArray(req.body.serial_no)) {
                for (var i = 0; i < req.body.serial_no.length; i++) {
                    if (!await Products.findOne({ serial_no: req.body.serial_no[i].toLowerCase() })) {
                        productMissing = true
                        res.status(400)
                        res.render('error', {
                            error_message: {
                                heading: 'PRODUCT NOT FOUND',
                                msg: 'Product with Serial No:' + req.body.serial_no[i].toUpperCase() + ' not found.Please insert the product before inserting invoice.',
                                link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/add/addInvoicePage'
                            }
                        })
                    }
                }
            } else {
                if (!await Products.findOne({ serial_no: req.body.serial_no.toLowerCase() })) {
                    productMissing = true
                    res.status(400)
                    res.render('error', {
                        error_message: {
                            heading: 'PRODUCT NOT FOUND',
                            msg: 'Product with Serial No:' + req.body.serial_no.toUpperCase() + ' not found.Please insert the product before inserting invoice.',
                            link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/add/addInvoicePage'
                        }
                    })
                }
            }
            if (!productMissing) {
                const session = await mongoose.startSession()
                session.startTransaction();
                try {
                    invoiceData = new Invoice(req.body)
                    await invoiceData.save({ session })
                    await session.commitTransaction()
                    res.status(200)
                    res.render('success', {
                        success_msg: {
                            title: 'INVOICE ADDED SUCCESSFULLY',
                            msg: 'The Invoice have been successfully added to the database.',
                            link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/add/addInvoicePage'
                        }
                    })
                } catch (err) {
                    await session.abortTransaction()
                    console.error(err)
                    res.status(400)
                    if (err.name === 'MongoError' && err.code === 11000) {
                        res.render('error', {
                            error_message: {
                                heading: 'INVOICE ALREADY EXIST',
                                msg: 'Invoice with Invoice No:' + err.keyValue.invoice_no + ' already exist.',
                                link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/add/addInvoicePage'
                            }
                        })
                    } else {
                        res.render('error', {
                            error_message: {
                                heading: 'AN UNKNOWN ERROR OCCURED',
                                msg: 'An unknown error occured. Please try again after sometime.',
                                link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/add/addInvoicePage'
                            }
                        })
                    }
                } finally {
                    session.endSession();
                }
            }
        }
    })
    //Add Customer Page
router.get('/addCustomerPage', ensureAuthenticated, (req, res) => {
    res.render('addCustomerPage', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), role: req.user.role })
})

router.post('/addCustomer', ensureAuthenticated, async(req, res) => {
    session = await mongoose.startSession()
    session.startTransaction()
    try {
        var user = new User(req.body)
        await user.save({ session })
        await session.commitTransaction()
        res.status(200)
        res.render('success', {
            success_msg: {
                title: 'CUSTOMER ADDED SUCCESSFULLY',
                msg: 'The Customer have been successfully added to the database.',
                link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/add/addCustomerPage'
            }
        })
    } catch (err) {
        await session.abortTransaction()
        res.send(400, '/error')
        res.status(400)
        if (err.name === 'MongoError' && err.code === 11000) {
            res.render('error', {
                error_message: {
                    heading: 'CUSTOMER ALREADY EXIST',
                    msg: 'Customer with email:' + err.keyValue.email + ' already exist.',
                    link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/add/addCustomerPage'
                }
            })
        } else {
            res.render('error', {
                error_message: {
                    heading: 'AN UNKNOWN ERROR OCCURED',
                    msg: 'An unknown error occured. Please try again after sometime.',
                    link: (req.user.role == 'admin' ? '/admin' : '/moderator') + '/add/addCustomerPage'
                }
            })
        }

    } finally {
        session.endSession()
    }
})


module.exports = router