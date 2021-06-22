const mongoose = require('mongoose')

const pendingModeratorSchema = mongoose.Schema({
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
    sequence: {
        type: Number,
    }
})

const PendingModerator = mongoose.model('pending-moderator', pendingModeratorSchema)
module.exports = PendingModerator