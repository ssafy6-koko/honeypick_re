const { Router } = require('express')
const profileRouter = Router()
const { isValidObjectId } = require('mongoose')
const { User, Follow } = require('../models')
const bcrypt = require('bcrypt')
const { authAccessToken } = require('./auth')

const { v4: uuid } = require("uuid")
const mime = require("mime-types")
const { getSignedUrl } = require('../aws')

profileRouter.get('/:userId', authAccessToken,async (req, res) => {
    try {
      if(!isValidObjectId(req.userId)) return res.status(400).send({ err: "유효하지 않은 user id" })
      const user = await User.findById(req.params.userId)
      if(user.withdraw) return res.status(400).send({msg:"탈퇴한 회원의 정보를 조회하려 하고 있습니다"})

      // 팔로우 관계
      let myFollow = false
      const account = await User.findById(req.params.userId)
      const myFollowing = await Follow.findOne({ _id: account.follow, 'followers._id': req.userId })
      if (myFollowing) { myFollow = true }

      return res.status(200).send({userId:req.params.userId,username:user.username,nickname:user.nickname,description:user.description,profileImage:user.profileImage, myFollow, following:user.followingCount,follower:user.followerCount})
    } catch (error) {
      console.log(error)
      return res.status(500).send({ err: error.message })
    }
})

profileRouter.patch('/',authAccessToken, async (req, res) => {
    try {
        let user = await User.findById(req.userId)
        const {username,nickname,imageType,description,phone} = req.body
        let profileImage
        if(username){
            if(typeof username!=="string") return res.status(400).send({err:"username 형식이 잘못되었습니다."})
            if(await User.findOne({username:username})) return res.status(400).send({err:"이미 존재하는 username입니다"})
            if(username.length>10) return res.status(400).send({err:"username 길이가 10을 넘습니다"})
            user.username = username
        }
        if(nickname){
            if(typeof nickname!=="string") return res.status(400).send({err:"nickname 형식이 잘못되었습니다."})
            if(nickname.length>10) return res.status(400).send({err:"nickname 길이가 10을 넘습니다"})
            user.nickname = nickname
        }
        if(phone){
            if(typeof phone!=="string") return res.status(400).send({err:"phone 형식이 잘못되었습니다."})
            user.phone = phone
        }
        if(imageType) {
            if(typeof imageType!=="string") return res.status(400).send({err:"imageType 형식이 잘못되었습니다."})
            const imageKey = `${uuid()}.${mime.extension(imageType) ? mime.extension(imageType) : 'jpg'}`
            const key = `raw/${imageKey}`
            const presigned = await getSignedUrl({ key })
            user.profileImage = imageKey
            profileImage = presigned
        }

        if(typeof description === "string") user.description = description
        else return res.status(400).send({err:"description의 형식이 잘못되었습니다."})

        await user.save()
        return res.status(200).send({msg:"DONE",username:user.username,nickname:user.nickname,profileImage:profileImage,description:user.description,following:user.followingCount,follower:user.followerCount })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})

profileRouter.patch('/password', authAccessToken,async (req, res) => {
    try {
        const {newPassword} = req.body
        const user =await User.findById(req.userId)
        if(typeof newPassword !=="string") return res.status(400).send({err:"newPassword는 필수입니다."})
        user.password = newPassword
        await user.save()

        return res.status(200).send({ msg:`${user.username}의 password가 변경되었습니다.` })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})

module.exports =  profileRouter
