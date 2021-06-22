const mongoose = require('mongoose')

// User Schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: true
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
    address: {
        type: String,
        lowercase: true,
        required: true
    },
    street: {
        type: String,
        lowercase: true
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
    pin: {
        type: Number,
        required: true,
    },
    country: {
        type: String,
        lowercase: true,
        required: true
    },
    gstin: {
        type: String,
        lowercase: true,
    },
})
userSchema.statics.findusercredentials = async(ph_Number, email) => {
    userExist = await User.findOne({ phone: ph_Number }, { email: email })
}
const User = mongoose.model('user-add', userSchema)
module.exports = User