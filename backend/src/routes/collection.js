const { Router } = require('express')
const collectionRouter = Router()
const { isValidObjectId } = require('mongoose')
const { User, Collection, Follow, Item } = require('../models')
const { authAccessToken } = require('./auth')
const { Types: { ObjectId } } = require('mongoose')

// 팔로워인지 검증
async function isFollower(accountId, userId) {
  const account = await User.findById(accountId)
  const isFollow = await Follow.findOne({ _id: account.follow, 'followers._id': userId })
  if (isFollow) {
    return true
  }
  return false
}

// 컬렉션 생성
collectionRouter.post('/', authAccessToken, async (req, res) => {
  try {
    // jwt 검증: user 추출 및 검증
    const { userId } = req
    if (!isValidObjectId(userId)) return res.status(401).send({ err: "invalid userId" })
    const user = await User.findById(userId)

    // title, description, isPublic 추출 및 검증
    const { title, description, isPublic } = req.body
    if (typeof title !== 'string') return res.status(400).send({ err: "string title is required"});
    if (description && typeof description !== 'string') return res.status(400).send({ err: "description must be string type"});
    if (typeof isPublic !== 'boolean') return res.status(400).send({ err: "boolean isPublic is required"});

    // 기존 컬렉션이 30개 이상이면, 생성 차단
    if (user.collections.length >= 30) return res.status(403).send({ err: "maximum 30 collections per user" })

    // 컬렉션 자체 추가 & 회원의 컬렉션 목록에 추가
    const collection = new Collection({ ...req.body, user })
    await Promise.all([
      collection.save(),
      User.updateOne({ _id: userId }, { $push: { collections: collection }})
    ])
    return res.status(201).send({ collection })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ err: error.message })
  }
})

// 컬렉션 목록 조회
collectionRouter.get('/:accountId', authAccessToken, async (req, res) => {
  try {
    const { accountId } = req.params
    if (!isValidObjectId(accountId)) return res.status(400).send({ err: "invalid accountId"})
    const account = await User.findById(accountId)

    // 비공개인 컬렉션은, 사용자가 팔로워여야만 조회 가능 (jwt)
    const { userId } = req
    if (!isValidObjectId(userId)) return res.status(401).send({ err: "invalid userId" })
    // 팔로워 목록 조회해서, 팔로워면 all, 아니면 public 보여주기
    if (await isFollower(accountId, userId) === true || accountId == userId) {
      const allCollections = await account.collections.sort((a,b) => {
        if (a.updatedAt > b.updatedAt) {
          return -1
        } else if (a.updatedAt < b.updatedAt) {
          return 1
        }
        return 0
      })
      return res.status(200).send({ collections: allCollections })
    } else {
      const unsortedCollections = await account.collections.filter(collection => collection['isPublic'] == true)
      const publicCollections = await unsortedCollections.sort((a,b) => {
        if (a.updatedAt > b.updatedAt) {
          return -1
        } else if (a.updatedAt < b.updatedAt) {
          return 1
        }
        return 0
      })
      return res.status(200).send({ collections: publicCollections })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send({ err: error.message })
  }
})

// 컬렉션 상세 조회
collectionRouter.get('/:accountId/:collectionId', authAccessToken, async (req, res) => {
  try {
    const { accountId, collectionId } = req.params
    const { userId } = req
    if (!isValidObjectId(userId)) return res.status(401).send({ err: "invalid userId" })
    if (!isValidObjectId(accountId)) return res.status(400).send({ err: "invalid accountId" })
    if (!isValidObjectId(collectionId)) return res.status(400).send({ err: "invalid collectionId" })

    // 비공개인 경우: jwt 토큰에서 userId 가져와서 accountId 의 팔로워 목록에 있는지 확인하고, 있으면 공개, 없으면 못 봄
    const collection = await Collection.findById(collectionId)
    if (collection.isPublic === false) {
      if (await isFollower(accountId, userId) == false && accountId !== userId) {
        return res.status(400).send({ err: 'private collection'})
      }
    }

    // 찜 여부
    let liked = false
    const inLikes = await User.findOne({ _id: userId, 'likes._id': ObjectId(collectionId) })
    if (inLikes) { liked = true }

    // 아이템 넣어주기
    var idList = collection.items.map(({ _id }) => ObjectId(_id))
    var itemList = await Item.find({ _id: { $in: idList }})
    const items = itemList.map((item, idx) => {
      return { ...item._doc, recommend: collection.items[idx].recommend }
    })

    // 팔로우 관계
    let myFollow = false
    const account = await User.findById(accountId)
    const myFollowing = await Follow.findOne({ _id: account.follow, 'followers._id': userId })
    if (myFollowing) { myFollow = true }

    return res.status(200).send({ collection, items, myFollow, liked })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ err: error.message })
  }
})

// 컬렉션 수정(제목, 설명, 공개여부. 아이템 추가 및 제거는 item.js에서 처리)
collectionRouter.patch('/:accountId/:collectionId', authAccessToken, async (req, res) => {
  try {
    const { accountId, collectionId } = req.params
    const { title, description, isPublic } = req.body
    const { userId } = req
    let collection = await Collection.findById(collectionId)

    if (!isValidObjectId(userId)) return res.status(401).send({ err: "invalid userId" })
    if (collection.user._id.toString() !== userId || userId !== accountId) return res.status(401).send({ err: "Unauthorized" })
    if (title && typeof title !== 'string') return res.status(400).send({ err: "title must be a string" })
    if (description !== undefined && typeof description !== 'string') return res.status(400).send({ err: "description must be a string" })
    if (typeof isPublic !== 'undefined' && typeof isPublic !== 'boolean') return res.status(400).send({ err: "isPublic must be a boolean" })

    const collectionUpdate = {}
    const userUpdate = {}

    if (title) {
      collectionUpdate['title'] = title
      userUpdate['collections.$.title'] = title
    }
    if (description !== undefined && description !== null) {
      collectionUpdate['description'] = description
    }
    if (typeof isPublic !== 'undefined') {
      collectionUpdate['isPublic'] = isPublic
    }

    [collection, _] = await Promise.all([
      Collection.findByIdAndUpdate(collectionId, collectionUpdate, { new: true }),
      User.updateOne({ _id: userId, 'collections._id': collectionId }, userUpdate)
    ])

    return res.status(200).send({ collection })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ err: error.message })
  }
})

// 컬렉션 삭제
collectionRouter.delete('/:accountId/:collectionId', authAccessToken, async (req, res) => {
  try {
    const { accountId, collectionId } = req.params
    const { userId } = req
    if (!isValidObjectId(userId)) return res.status(401).send({ err: "invalid userId"})
    if (!isValidObjectId(accountId)) return res.status(400).send({ err: "invalid accountId"})
    if (userId !== accountId) return res.status(401).send({ err: "Unauthorized" })
    if (!isValidObjectId(collectionId)) return res.status(400).send({ err: "invalid collectionId"})

    await Promise.all([
      Collection.findByIdAndDelete(collectionId),
      User.findByIdAndUpdate(accountId, { $pull: { collections: { _id: collectionId }}})
    ])
    return res.status(204).send()
  } catch (error) {
    console.log(error)
    return res.status(500).send({ err: error.message })
  }
})

module.exports = collectionRouter
