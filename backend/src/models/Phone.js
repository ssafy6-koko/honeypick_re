const { Schema, model } = require('mongoose')

const PhoneSchema = new Schema({
    phoneNumber: { type: String, required: true },
    verificationCode: { type: String , required: true },
}, { timestamps: true })

const Phone = model('phone', PhoneSchema)

module.exports = { Phone }