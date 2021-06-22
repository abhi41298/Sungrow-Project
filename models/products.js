const mongoose = require('mongoose')
const productSchema = mongoose.Schema({
    serial_no: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    type: {
        type: String,
        required: true,
        lowercase: true,
    },
    model: {
        type: String,
        required: true,
        lowercase: true,
    },
    sg_ref_date: {
        type: String,
        required: true,
        lowercase: true,
    },
    warranty_tenure: {
        type: Number,
        required: true,
    }
})
const Product = mongoose.model('product', productSchema)

module.exports = Product