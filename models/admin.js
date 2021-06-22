const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const adminSchema = mongoose.Schema({
    full_name: {
        type: String,
        lowercase: true,
        required: true
    },
    phone_number: {
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
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        lowercase: true,
        required: true
    },
    notation: {
        type: Number,
        required: true,
        unique: true
    },
})


const Admin = mongoose.model('login-access', adminSchema)
module.exports = Admin