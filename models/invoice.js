const mongoose = require('mongoose')

const invoiceSchema = mongoose.Schema({
    invoice_no: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    invoice_date: {
        type: String,
        lowercase: true,
        required: true,
    },
    delivery_order_no: {
        type: String,
        lowercase: true,
    },
    customer_email: {
        type: String,
        required: true,
        lowercase: true,
    },
    po_no: {
        type: String,
        lowercase: true,
    },
    po_date: {
        type: String,
        lowercase: true,
    },
    part_no: {
        type: String,
        lowercase: true,
    },
    serial_no: [{
        type: String,
        unique: true,
        lowercase: true,
    }],
    material_description: {
        type: String,
        lowercase: true,
    },
})
const Invoice = mongoose.model('invoice', invoiceSchema)
module.exports = Invoice