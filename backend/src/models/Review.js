const { Schema, model, Types: { ObjectId } } = require('mongoose')

const ReviewSchema = new Schema({
    user: {
        _id: { type: ObjectId, required: true, ref: 'user' },
        username: { type: String, required: true },
        nickname: { type: String, required: true }
    },
    item: { type: ObjectId, required: true, ref: 'item' },
    isRecommend: { type: Number, required: true, default: 0 },
    stickers: { type: Array, required: true, default: []}
}, { timestamps: true })

// index - multiIndex(user, item)

const Review = model('review', ReviewSchema)

module.exports = { Review }
