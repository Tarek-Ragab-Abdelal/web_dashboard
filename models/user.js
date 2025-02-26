const mongoose = require('mongoose');

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,  
        lowercase: true,
        match: [emailRegex, 'Please provide a valid email address']
    },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
