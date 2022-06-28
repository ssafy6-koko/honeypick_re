const { Schema, model, Types: { ObjectId } } = require('mongoose')

const FollowSchema = new Schema(
  {
    user: {
      _id: { type: ObjectId, required: true, ref: 'user' },
      username: { type: String, required: true }
    },
    followings: [{
      _id: { type: ObjectId, required: true, ref: 'user' },
      username: { type: String, required: true },
      nickname: { type: String, required: true },
      description: { type: String, required: false },
      profileImage: { type: String, required: false },
      myFollow: { type: Boolean, required: false },
      updatedAt: { type: Date, required: false }
    }],
    followers: [{
      _id: { type: ObjectId, required: true, ref: 'user' },
      username: { type: String, required: true },
      nickname: { type: String, required: true },
      description: { type: String, required: false },
      profileImage: { type: String, required: false },
      myFollow: { type: Boolean, required: false },
      updatedAt: { type: Date, required: false }
    }]
  }
)

const Follow = model('follow', FollowSchema)

module.exports = { Follow }
