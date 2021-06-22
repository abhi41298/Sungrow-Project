const mongoose = require('mongoose')
    //Warranty based schema
const warrantySchema = mongoose.Schema({
    warranty_no: {
        type: String,
        lowercase: true,
        unique: true
    },
    warranty_date: {
        type: String,
        lowercase: true,
        required: true,
    },
    warranty_tenure: {
        type: Number,
        required: true,
    },
    serial_no: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    old_warranty_no: {
        type: String,
        lowercase: true,
    }
})
const WarrantyDeclare = mongoose.model('warranty', warrantySchema)
module.exports = WarrantyDeclare