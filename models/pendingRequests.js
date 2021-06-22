const mongoose = require('mongoose')
    // Pending Request Schema
const pendingRequestSchema = mongoose.Schema({
    invoiceNumber: {
        required: true,
        unique: true,
        lowercase: true,
        type: String,
    },
    serialNumbers: [{
        serialNumber: {
            required: true,
            unique: true,
            lowercase: true,
            type: String
        },
        installationDate: {
            required: true,
            lowercase: true,
            type: String
        },
        warrantyReferenceDate: {
            type: String,
            lowercase: true,
        },
        warrantyTenure: {
            type: Number,
        },
    }],
    name: {
        type: String,
        lowercase: true,
        required: true
    },
    address: {
        type: String,
        lowercase: true,
        required: true
    },
    district: {
        type: String,
        lowercase: true,
        required: true,
    },
    city: {
        type: String,
        lowercase: true,
        required: true
    },
    state: {
        type: String,
        lowercase: true,
        required: true
    },
    country: {
        type: String,
        lowercase: true,
        required: true
    },
    pin: {
        type: Number,

    },
    gstin: {
        type: String,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
})

const PendingRequest = mongoose.model('pending-request', pendingRequestSchema)
module.exports = PendingRequest