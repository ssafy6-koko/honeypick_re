const { Router } = require('express')
const reviewRouter = Router({ mergeParams: true })
const mongoose = require('mongoose')
const { isValidObjectId } = require('mongoose')
const { User, Item, Review, Collection } = require('../models')

const { authAccessToken } = require('./auth')


// 리뷰 생성, 수정 시 collection에 담겨있는 내용도 같이 수정해야함
reviewRouter.post('/', authAccessToken, async (req, res) => {
  try {
      const { itemId } = req.params
      if(!isValidObjectId(itemId)) return res.status(400).send({ err: "잘못된 itemId" })
      const userId = req.userId

      const [user, item] = await Promise.all([
        User.findById(userId),
        Item.findById(itemId)
      ])

      if(!user) res.status(400).send({ err: "유저 정보가 존재하지 않습니다." })
      if(!item) res.status(400).send({ err: "아이템 정보가 존재하지 않습니다." })

      const { isRecommend, stickers } = req.body      
      if (typeof isRecommend !== 'number') return res.status(400).send({ err: "추천 정도는 필수값입니다."});
      if (!Array.isArray(stickers)) return res.status(400).send({ err: "스티커는 필수값입니다."});

      const review = new Review({ user, item, ...req.body })
      
      const changedStickers = calStickers([], stickers)

      await Promise.all([
        review.save(),
        item.updateOne({ $inc : changedStickers }),
        Collection.findOneAndUpdate({ 'user._id': userId, 'items._id': itemId }, { 'items.$.recommend': isRecommend })
      ])

      return res.status(200).send({ review })
  } catch (error) {
      console.log(error)
      return res.status(500).send({ err: error.message })
  }
})

reviewRouter.patch('/:reviewId', authAccessToken, async (req, res) => {
  try {
    const { itemId, reviewId } = req.params
    if(!isValidObjectId(reviewId)) return res.status(400).send({ err: "잘못된 reviewId" })
    const userId = req.userId

    const { isRecommend, stickers } = req.body      
    if (typeof isRecommend !== 'number') return res.status(400).send({ err: "추천 정도는 필수값입니다."});
    if (!Array.isArray(stickers)) return res.status(400).send({ err: "스티커는 필수값입니다."});

    const review = await Review.findByIdAndUpdate(reviewId, { $set: { isRecommend, stickers } })

    const changedStickers = calStickers(review.stickers, stickers)

    await Promise.all([
      Item.updateOne({ _id: itemId }, { $inc: changedStickers }),
      Collection.findOneAndUpdate({ 'user._id': userId, 'items._id': itemId }, { 'items.$.recommend': isRecommend })
    ])

    review.stickers = stickers

    return res.status(200).send({ review })
  } catch (error) {
      console.log(error)
      return res.status(500).send({ err: error.message })
  }
})

// 스티커 개수 변화 계산
function calStickers(oldReview, newReview) {
  var stickers = {}
  
  const remains = newReview.filter((a)=>{
    idx = oldReview.indexOf(a)
    if(idx > -1) {
      oldReview.splice(idx, 1)
      return false
    }
    else return true
  })

  for (var i=0; i < remains.length; ++i)
    stickers['stickers.' + remains[i]] = 1

  for (var i=0; i < oldReview.length; ++i)
    stickers['stickers.' + oldReview[i]] = -1
  return stickers
}

module.exports = reviewRouter
