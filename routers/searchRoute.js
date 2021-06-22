const express = require('express')
const router = new express.Router()
const Invoice = require("../models/invoice")
const WarrantyDeclare = require("../models/warrantyDeclare")
const Products = require("../models/products")
const User = require("../models/user")
const { forwardAuthenticated, ensureAuthenticated } = require('../auth');
//search warranty
router.get('/searchWarranty', ensureAuthenticated, async(req, res) => {
        res.render('searchWarranty', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), role: req.user.role })
    })
    //Search Invoice
router.get('/searchInvoice', ensureAuthenticated, async(req, res) => {
        res.render('searchInvoice', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), role: req.user.role })
    })
    //Search Products
router.get('/searchProduct', ensureAuthenticated, async(req, res) => {
    res.render('searchProduct', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), role: req.user.role })
})

router.get('/searchCustomer', ensureAuthenticated, (req, res) => {
    res.render('searchCustomer', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), role: req.user.role })
})


//Display Search Invoice
router.post('/displaySearchInvoice', ensureAuthenticated, async(req, res) => {
        if (req.body.searchBy == 'invoice_no') {
            await Invoice.findOne({ invoice_no: req.body.searchQuery.toLowerCase() }, (err, data) => {
                if (data) {
                    res.status(200)
                    res.render('searchInvoice', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), searchResult: [data], role: req.user.role })
                } else {
                    res.render('searchInvoice', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), noneFound: true, role: req.user.role })
                }
            })
        } else if (req.body.searchBy == 'customer_email') {
            await Invoice.find({ customer_email: req.body.searchQuery.toLowerCase() }, (err, data) => {
                if (data) {
                    res.status(200)
                    res.render('searchInvoice', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), searchResult: data, role: req.user.role })
                } else {
                    res.render('searchInvoice', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), noneFound: true, role: req.user.role })
                }
            })
        }
    })
    //Display search warranty
router.post('/displaySearchWarranty', ensureAuthenticated, async(req, res) => {
        if (req.body.searchBy == 'warranty_no') {
            await WarrantyDeclare.findOne({ warranty_no: req.body.searchQuery.toLowerCase() }, (err, data) => {
                if (data) {
                    res.status(200)
                    res.render('searchWarranty', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), searchResult: data, role: req.user.role })
                } else {
                    res.render('searchWarranty', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), noneFound: true, role: req.user.role })
                }
            })
        } else if (req.body.searchBy == 'serial_no') {
            await WarrantyDeclare.findOne({ serial_no: req.body.searchQuery.toLowerCase() }, (err, data) => {
                if (data) {
                    res.status(200)
                    res.render('searchWarranty', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), searchResult: data, role: req.user.role })
                } else {
                    res.render('searchWarranty', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), noneFound: true, role: req.user.role })
                }
            })
        }
    })
    //display search product
router.post('/displaySearchProduct', ensureAuthenticated, async(req, res) => {
    await Products.findOne({ serial_no: req.body.searchQuery.toLowerCase() }, (err, data) => {
        if (data) {
            res.render('searchProduct', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), searchResult: data, role: req.user.role })
        } else {
            res.render('searchProduct', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), noneFound: true, role: req.user.role })
        }
    })
})

// Display Search Customer
router.post('/displaySearchCustomer', ensureAuthenticated, async(req, res) => {
    if (req.body.searchBy == 'customer_email') {
        await User.findOne({ email: req.body.searchQuery.toLowerCase() }, (err, data) => {
            if (data) {
                res.status(200)
                res.render('searchCustomer', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), searchResult: data, role: req.user.role })
            } else {
                res.render('searchCustomer', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), noneFound: true, role: req.user.role })
            }
        })
    } else if (req.body.searchBy == 'customer_mobile') {
        await User.findOne({ phone: req.body.searchQuery }, (err, data) => {
            if (data) {
                res.status(200)
                res.render('searchCustomer', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), searchResult: data, role: req.user.role })
            } else {
                res.render('searchCustomer', { layout: '/layouts' + (req.user.role == 'admin' ? '/adminDash' : '/moderatorDash'), noneFound: true, role: req.user.role })
            }
        })
    }
})
module.exports = router