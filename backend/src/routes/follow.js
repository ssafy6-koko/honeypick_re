const { Router } = require('express')
const followRouter = Router()
const { isValidObjectId, Types: { ObjectId } } = require('mongoose')
const { Follow, User } = require('../models')
const { authAccessToken } = require('./auth')

// 전체 페이지 수 (한 페이지에 30개)
function getTotalPages(length) {
  if (length % 30) {
    return (parseInt(length / 30) + 1)
  } else {
    return (length / 30)
  }
}

// 팔로우 또는 팔로우 취소
followRouter.post('/', authAccessToken, async (req, res) => {
    try {
    const { userId } = req
    const { accountId } = req.body
    if (!isValidObjectId(userId)) return res.status(401).send({ err: "invalid userId" })
    if (!isValidObjectId(accountId)) return res.status(401).send({ err: "invalid accountId" })
    if (userId == accountId) return res.status(401).send({ err: "self-following is not allowed" })
    let [user, account, isFollowing] = await Promise.all([
      User.findById(userId),
      User.findById(accountId),
      Follow.findOne({ "user._id": userId, followings: { $elemMatch: { _id: ObjectId(accountId)}}})
    ])

    if (isFollowing) {
      await Promise.all([
        Follow.updateOne({ "user._id": userId }, { $pull: { followings: { _id: ObjectId(accountId) } }}),
        Follow.updateOne({ "user._id": accountId }, { $pull: { followers: { _id: ObjectId(userId) } }}),
        User.updateOne({ _id: userId }, { $inc: { followingCount: -1 }}),
        User.updateOne({ _id: accountId }, { $inc: { followerCount: -1 }})
      ])
      return res.status(201).send({ message: '팔로우 취소' })
    } else {
      await Promise.all([
        Follow.updateOne({ "user._id": userId }, { $push: { followings: account }}),
        Follow.updateOne({ "user._id": accountId }, { $push: { followers: user }}),
        User.updateOne({ _id: userId }, { $inc: { followingCount: 1 }}),
        User.updateOne({ _id: accountId }, { $inc: { followerCount: 1 }})
      ])
      return res.status(201).send({ message: '팔로우 시작' })
    }
    } catch (error) {
      console.log(error)
      return res.status(500).send({ err: error.message })
    }
})

// 팔로워 목록 조회
followRouter.get('/:accountId/followers', authAccessToken, async (req, res) => {
  try {
    let { page=1 } = req.query
    page = parseInt(page)
    const { userId } = req
    const { accountId } = req.params
    if (!isValidObjectId(userId)) return res.status(401).send({ err: "invalid userId" })
    if (!isValidObjectId(ObjectId(accountId))) return res.status(401).send({ err: "invalid accountId" })

    let follow = await Follow.findOne({ "user._id": accountId })
    const followers = follow.followers
    const promises = []

    // update myFollow
    for (let i=0; i < followers.length; i++) {
      let user = await User.findById(followers[i]._id)
      let myFollowing = await Follow.findOne({ _id: user.follow, 'followers._id': userId})
      if (myFollowing) {
        promises.push(Follow.updateOne({ _id: follow._id, 'followers._id': followers[i]._id }, { $set: { 'followers.$.myFollow': true }}))
      } else {
        promises.push(Follow.updateOne({ _id: follow._id, 'followers._id': followers[i]._id }, { $set: { 'followers.$.myFollow': false }}))
      }
    }
    await Promise.all(promises)
    // pagination: 최근 추가순. page는 1부터 시작. 30개씩 조회.
    follow = await Follow.findOne({ "user._id": accountId })
    const [sortedFollowers, totalPages] = await Promise.all([
      follow.followers
        .sort((a,b) => {
          if (a.updatedAt > b.updatedAt) {
            return -1
          } else if (a.updatedAt < b.updatedAt) {
            return 1
          }
          return 0
        })
        .slice((page-1)*30, page*30),
      getTotalPages(follow.followers.length)
    ])
    return res.status(200).send({ totalPages, page, followers: sortedFollowers })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ err: error.message })
  }
})

// 팔로잉 목록 조회
followRouter.get('/:accountId/followings', authAccessToken, async (req, res) => {
  try {
    let { page=1 } = req.query
    page = parseInt(page)
    const { userId } = req
    const { accountId } = req.params
    if (!isValidObjectId(userId)) return res.status(401).send({ err: "invalid userId" })
    if (!isValidObjectId(ObjectId(accountId))) return res.status(401).send({ err: "invalid accountId" })

    let follow = await Follow.findOne({ "user._id": accountId })
    const followings = follow.followings
    const promises = []

    // update myFollow
    for (let i=0; i < followings.length; i++) {
      let user = await User.findById(followings[i]._id)
      let myFollowing = await Follow.findOne({ _id: user.follow, 'followers._id': userId})
      if (myFollowing) {
        promises.push(Follow.updateOne({ _id: follow._id, 'followings._id': followings[i]._id }, { $set: { 'followings.$.myFollow': true }}))
      } else {
        promises.push(Follow.updateOne({ _id: follow._id, 'followings._id': followings[i]._id }, { $set: { 'followings.$.myFollow': false }}))
      }
    }
    await Promise.all(promises)
    // sorting and pagination(user의 updatedAt 내림차순. page는 1부터 시작. 30개씩 조회.)
    follow = await Follow.findOne({ "user._id": accountId })
    const [sortedFollowings, totalPages] = await Promise.all([
      follow.followings
        .sort((a,b) => {
          if (a.updatedAt > b.updatedAt) {
            return -1
          } else if (a.updatedAt < b.updatedAt) {
            return 1
          }
          return 0
        })
        .slice((page-1)*30, page*30),
      getTotalPages(follow.followings.length)
    ])
    return res.status(200).send({ totalPages, page, followings: sortedFollowings })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ err: error.message })
  }
})

module.exports = followRouter
