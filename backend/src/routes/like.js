const { Router } = require('express')
const likeRouter = Router()
const { isValidObjectId, Types: { ObjectId } } = require('mongoose')
const { User, Collection } = require('../models')
const { authAccessToken } = require('./auth')

// 컬렉션 찜 설정/해제
likeRouter.post('/', authAccessToken, async (req, res) => {
  try {
    const { userId } = req
    const { collectionId } = req.body
    if (!isValidObjectId(userId)) return res.status(401).send({ err: "invalid userId"})
    if (!isValidObjectId(collectionId)) return res.status(400).send({ err: "invalid collectionId"})

    // user의 likes에 추가 혹은 빼기
    const [collection, isLiked] = await Promise.all([
      Collection.findById(collectionId),
      User.findOne({ _id: userId, 'likes._id': collectionId })
    ])

    if (isLiked) {
      collection.liked -= 1
      await Promise.all([
        User.updateOne({ _id: userId }, { $pull: { likes: { _id: ObjectId(collectionId) } }}),
        collection.save()
      ])
    } else {
      collection.liked += 1
      await Promise.all([
        User.updateOne({ _id: userId }, { $push: { likes: collection }}),
        collection.save()
      ])
    }
    const user = await User.findById(userId)
    return res.status(200).send({ likes: user.likes })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ err: error.message })
  }
})

// 컬렉션 찜 목록 조회
likeRouter.get('/', authAccessToken, async (req, res) => {
  try {
    const { userId } = req
    const user = await User.findById(userId)
    let likes = []
    if (user.likes.length > 0) {
      likes = user.likes
      .sort((a,b) => {
        if (a.updatedAt > b.updatedAt) {
          return -1
        } else if (a.updatedAt < b.updatedAt) {
          return 1
        }
        return 0
      })
    }
    return res.status(200).send({ likes })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ err: error.message })
  }
})

module.exports = likeRouter
