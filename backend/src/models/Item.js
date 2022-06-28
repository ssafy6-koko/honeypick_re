const { Schema, model } = require('mongoose')

const ItemSchema = new Schema({
    url: { type: String, required: true },
    title: { type: String , required: false },
    thumbnail: { type: String, required: false, default: 'honeypick.png' },
    priceBefore: { type: Number, required: false },
    priceAfter: { type: Number, required: false },
    discountRate: { type: Number, required: false },
    stickers: { type: Object, required: true, default: { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0 }},
}, { timestamps: true })

ItemSchema.index({ title: 'text' })
const Item = model('item', ItemSchema)
Item.createIndexes()

module.exports = { Item, ItemSchema }