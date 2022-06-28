const { Router } = require('express')
const recommendRouter = Router()
const mongoose = require('mongoose')
const { isValidObjectId } = require('mongoose')
const { Item, Collection, User, Follow } = require('../models')

const { authAccessToken } = require('./auth')

recommendRouter.get('/collection', authAccessToken, async (req, res) => {
    try {
        let { page=1 } = req.query
        page = parseInt(page)

        const userId = req.userId
        const user = await User.findById(userId)
        const followId = user.follow
        const [myFollow, influencers] = await Promise.all([
            Follow.findById(followId),
            User.find({}).sort({ followerCount: -1 }).limit(5)
        ])

        const followUserIds = myFollow.followings.map(({ _id }) => _id)

        const [likedCollection, followCollections] = await Promise.all([
            Collection.find({ liked: { $gt: 0 } }).sort({ liked: -1 }).limit(5),
            Collection.aggregate([
                { $match: { 'user._id': { $in : followUserIds } } },
                { $sample: { size: 5 } }
            ])
        ])

        const collections = followCollections.map((collection) => {
            return {
                title: 0,
                collection
            }
        })

        // 많은 사람들의 찜에 담긴 컬렉션
        collections.push(...likedCollection.map(collection => {
            return {
                title: 1,
                collection
            }
        }))

        // 팔로워 수가 많은 유저의 랜덤 컬렉션
        const influencerCollection = influencers.map(({ _id, username, followerCount, nickname, collections }) => {
            if(collections.length) {
                targetCollection = collections[Math.floor(Math.random() * collections.length)]
                return {
                    title: 2,
                    collection: {
                        ...targetCollection._doc,
                        user: {
                            _id,
                            username,
                            nickname,
                            followerCount,
                        }
                    }
                }
            }
            return false
        })

        collections.push(...influencerCollection.filter(item => item))

        var uniqueCollections = []
        var uniqueCollectionIds = []
        collections.forEach(({ title, collection }) => {
            stringId = collection._id.toString()
            if(uniqueCollectionIds.indexOf(stringId) > -1){

            } else {
                uniqueCollectionIds.push(stringId)
                uniqueCollections.push({
                    title, collection
                })
            }
        })

        return res.status(200).send({ collections: uniqueCollections })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})


recommendRouter.get('/item', authAccessToken, async (req, res) => {
    try {
        let { page=1, recs } = req.query
        page = parseInt(page)

        if(recs){
            recs = recs.split(',').map((item) => parseInt(item))
        }
        else {
            recs = getMultipleRandom([...Array(9).keys()], 9).sort()
        }
        
        stickers = [...Array(8).keys()].map(idx => {
            stickerNo = idx+1
            sortKey = `stickers.${stickerNo}`
            obj = {

            }
            obj[sortKey] = -1
            return {
                title: `스티커 ${stickerNo}이 많은 아이템`,
                sort: obj
            }
        })
        
        recommends = [
            {
                title: '최근 등록된 아이템',
                sort: { updatedAt: -1 }
            },
            ...stickers
        ].filter(({ }, idx) => recs.includes(idx))

        const promises = recommends.map(({ sort }) => Item.find({}).sort(sort).skip((page-1)*8).limit(8))
        const result = await Promise.all(promises)

        const items = result.map((item, idx) => {
            return {
                rec: recs[idx],
                title: recommends[idx].title,
                itemList: item,
                page
            }
        })
        
        return res.status(200).send({ items })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})

// 배열에서 랜덤개수만큼 뽑기
function getMultipleRandom(arr, num) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random())
  
    return shuffled.slice(0, num)
}

module.exports = recommendRouter