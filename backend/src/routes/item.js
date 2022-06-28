const { Router } = require('express')
const itemRouter = Router()
const mongoose = require('mongoose')
const { isValidObjectId } = require('mongoose')
const { User, Item, Review, Collection } = require('../models')

const { v4: uuid } = require("uuid")
const mime = require("mime-types")

const { authAccessToken } = require('./auth')
const { getSignedUrl } = require('../aws')

const axios = require('axios')

CRAWLING_SERVER_URL = process.env.CRAWLING_SERVER_URL

itemRouter.use('/:itemId/review', require('./review'))

itemRouter.post('/', authAccessToken, async (req, res) => {
    try {
        let { url } = req.body
        if(typeof url !== 'string') return res.status(400).send({ err: "url is required" })
        url = url.indexOf('?') > -1 ? url.slice(0, url.indexOf('?')) : url

        var item = await Item.findOne({ url })

        var needCrawl = false

        if(!item) {
            item = new Item({ url })
            await item.save()
            needCrawl = true
        }

        if(item.updatedAt) {
            const nowDate = new Date()
            const crawlDate = new Date(item.updatedAt)
            const hourDiff = (nowDate.getTime() - crawlDate.getTime()) / (1000*60*60)
            if(hourDiff > 24) needCrawl = true
        }

        if(needCrawl) {
            axios({
                method: 'post',
                url: `${CRAWLING_SERVER_URL}/item`,
                headers: { user_id: req.userId },
                data: {
                    url: url,
                    item_id: item._id,
                }
            }).then(() => {
                console.log('item crawl success')
            }).catch(({response}) => {
                console.log(response)
            })
        }

        return res.status(201).send({ _id: item._id })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})

itemRouter.get('/:itemId', authAccessToken, async (req, res) => {
    try {
        const { itemId } = req.params
        var { userId } = req.query

        // query에 userId가 없을 경우 본인의 리뷰 가져오기
        if(!userId) userId = req.userId

        if(!isValidObjectId(itemId)) return res.status(400).send({ err: "잘못된 itemId" })
        if(!isValidObjectId(userId)) return res.status(400).send({ err: "잘못된 userId" })

        // 해당아이템이 포함된 내 컬렉션 가져오기
        const [item, review, collections] = await Promise.all([
            Item.findById(itemId),
            Review.findOne({ 'user._id': userId, item: itemId }),
            Collection.find({ 'user._id': userId, 'items._id': itemId })
        ])
        if(!item) res.status(400).send({ err: "아이템이 존재하지 않습니다." })
        item.stickers = Object.entries(item.stickers).sort(([, a], [, b]) => b - a).slice(0, 3)

        collections.forEach(collection => {
            collection.items = undefined
            collection.user = undefined
            collection.isPublic = undefined
        })

        return res.status(200).send({ item, review, collections })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})

// User 테이블에 있는 컬렉션의 items도 수정을해줘야함 -> thumbnail정도만 변경해주는걸로 하는게 나을듯
itemRouter.patch('/:itemId', authAccessToken, async (req, res) => {
    try {
        const userId = req.userId
        const { itemId } = req.params
        const { originalCollectionId, collectionId } = req.body
        if(!isValidObjectId(itemId)) return res.status(400).send({ err: "잘못된 itemId" })

        const [item, originalCollection] = await Promise.all([
            Item.findById(itemId),
            Collection.findById(originalCollectionId)
        ])

        if(!item) return res.status(400).send({ err: "아이템이 존재하지 않습니다." })
        var promises = []
        if(originalCollectionId) {
            if(!isValidObjectId(originalCollectionId)) return res.status(400).send({ err: "잘못된 originalCollectionId" })
            const idList = originalCollection.items.map(({_id}) => _id.toString())
            const itemList = await Item.find({ _id: { $in: idList }})
            let targetThumbnail = itemList.filter(({ _id }) => _id.toString() !== itemId ).slice(-1)[0]
            if (!targetThumbnail) {
              targetThumbnail = process.env.DEFAULT_PROFILE_IMG
            } else {
              targetThumbnail = targetThumbnail['thumbnail']
            }
            promises.push(Collection.findOneAndUpdate({ _id: originalCollectionId, 'user._id': userId }, { $pull: { items: { _id: itemId } } }, { new: true }))
            promises.push(User.updateOne({ _id: userId , 'collections._id': originalCollectionId }, { 'collections.$.thumbnail': targetThumbnail }))
        }
        if(collectionId) {
            if(!isValidObjectId(collectionId)) return res.status(400).send({ err: "잘못된 collectionId" })
            const review = await Review.findOne({ user: userId, item: itemId })
            const recommend = review?.isRecommend
            promises.push(Collection.findOneAndUpdate({_id: collectionId, 'user._id': userId}, { $addToSet: { items: { _id: itemId, thumbnail: item.thumbnail, recommend } } }))
            promises.push(User.updateOne({ _id: userId, 'collections._id': collectionId }, { 'collections.$.thumbnail': item.thumbnail }))
        }

        await Promise.all(promises)

        return res.status(200).send({ message: 'success' })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})

itemRouter.post('/:itemId/presigned', async(req, res) => {
    try {
        const { itemId } = req.params
        if(!isValidObjectId(itemId)) return res.status(400).send({ err: "잘못된 itemId" })

        const { contentType } = req.body

        const imageKey = `${uuid()}.${mime.extension(contentType) ? mime.extension(contentType) : 'jpg'}`
        const key = `raw/${imageKey}`
        const presigned = await getSignedUrl({ key })

        await Item.findByIdAndUpdate(itemId, { $set: { thumbnail: imageKey } })

        return res.status(200).send({ imageKey, presigned })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})

module.exports = itemRouter
