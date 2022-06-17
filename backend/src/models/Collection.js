const { Schema, model, Types: { ObjectId } } = require('mongoose')

const CollectionSchema = new Schema(
  {
    user: {
      _id: { type: ObjectId, required: true, ref: 'user' },
      username: { type: String, required: true },
      nickname: { type: String, required: true }
    },
    title: { type: String , required: true },
    description: { type: String, required: false },
    thumbnail: { type: String, required: true, default: process.env.DEFAULT_PROFILE_IMG },
    items: [{
      _id: { type: ObjectId, required: true, ref: 'item'},
      thumbnail: { type: String, required: true, default: process.env.DEFAULT_PROFILE_IMG },
      recommend: { type: Number, required: true, default: 0}
    }],
    isPublic: { type: Boolean, required: true },
    liked: { type: Number, required: true, default: 0 }
  },
  { timestamps: true })

CollectionSchema.index({ title: 'text', description: 'text' })
const Collection = model('collection', CollectionSchema)
Collection.createIndexes()

module.exports = { Collection, CollectionSchema }
