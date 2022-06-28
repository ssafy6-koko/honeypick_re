const { Router } = require('express')
const authRouter = Router()
const mongoose = require('mongoose')
const { isValidObjectId } = require('mongoose')
const { User,Follow } = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const generateTokens = function(userId,res){
    try {
        const accessToken =  jwt.sign({userId:userId},process.env.JWT_ACCESS_KEY,{expiresIn:process.env.JWT_ACCESS_EXPIRESIN})
        const refreshToken = jwt.sign({userId:userId},process.env.JWT_REFRESH_KEY,{expiresIn:process.env.JWT_REFRESH_EXPIRESIN})
        return {accessToken,refreshToken}
    } catch (err) {
        console.log(err)
        return res.status(400).send({err:"토큰 생성 실패"})
    }
}
function authAccessToken (req, res, next)  {
    const authHeader = req.headers["authorization"];
    const accessToken = authHeader && authHeader.split(" ")[1];
    if (!accessToken) return res.status(401).send({err:"access 토큰이 없습니다!"})
    try {
        console.log(accessToken)
        const {userId} = jwt.verify(accessToken,process.env.JWT_ACCESS_KEY)
        req.userId = userId

        next()
    } catch (err) {
        console.log(err)
        return res.status(419).send({err:"잘못된 accessToken 혹은 만료된 accessToken"})
    }
}
authRouter.post('/signup', async (req, res) => {
    try {
        const {username,phone, nickname,isAdmin} = req.body
        if(typeof username!=="string") return res.status(400).send({err:"username은 필수입니다"})
        if(typeof phone!=="string") return res.status(400).send({err:"phone은 필수입니다"})
        if(typeof nickname!=="string") return res.status(400).send({err:"nickname은 필수입니다"})
        if(isAdmin&&typeof isAdmin !=="boolean") return res.status(400).send({err:"isAdmin은 boolean이어야합니다"})

        if(nickname.length>10) return res.status(400).send({err:"nickname 길이가 10이 넘습니다"})
        if(username.length>10) return res.status(400).send({err:"username 길이가 10이 넘습니다"})

        if(await User.exists({username:username})) return res.status(400).send({ err: "중복 username" })
        
        let user = new User(req.body)
        let follow = new Follow({ ...req.body, user})
        user.follow = follow._id
        if(isAdmin) user.isAdmin = isAdmin
        const {accessToken,refreshToken} = generateTokens(user._id)
        await Promise.all([ 
            follow.save(),       
            user.save()
        ])
        return res.status(201).send({userId:user._id,username:req.body.username,description:"",profileImage:process.env.DEFAULT_PROFILE_IMG,isAdmin:user.isAdmin,accessToken:accessToken,refreshToken:refreshToken})
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        const {username,password} = req.body
        if(!username || !password) return res.status(400).send({err:'username와 password은 필수입니다.'})
        try{
            const user = await User.findOne({username:username})
            if(user.withdraw) return res.status(400).send({err:`${user.username}는 탈퇴되었습니다.`})
            if(await bcrypt.compare(password,user.password)==false) return res.status(400).send({err:'잘못된 비밀번호'})
            const {accessToken,refreshToken} = generateTokens(user._id)
            return res.status(201).send({userId:user._id, username, nickname:user.nickname, isAdmin:user.isAdmin, accessToken, refreshToken})
        }catch(err){
            console.log(err)
            return res.status(400).send({err:'로그인 중 에러가 발생했습니다.'})
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})
authRouter.post('/refresh',async (req,res)=>{
    try {
        const authHeader = req.headers["authorization"];
        const refreshToken = authHeader && authHeader.split(" ")[1];
        if(!refreshToken) return res.status(400).send({err:"refreshToken이 없습니다."})
        try {
            const {userId} = jwt.verify(refreshToken,process.env.JWT_REFRESH_KEY)
            const accessToken = jwt.sign({userId:userId},process.env.JWT_ACCESS_KEY,{expiresIn:process.env.JWT_ACCESS_EXPIRESIN})
            const user = await User.findById(userId)
            if(user.withdraw==true) return res.status(400).send({err:`${await user.usename}는 탈퇴되었습니다.`})
            return res.status(201).send({ userId:userId, username:user.username, nickname:user.nickname, isAdmin:user.isAdmin, accessToken, refreshToken })
        } catch (err) {
            console.log(err)
            return res.status(403).send({err:"refreshToken이 만료되었습니다."}) 
        }
    } catch (err) {
        console.log(err)
        return res.status(400).send({err:'error occurred while refresh token'})
    }
})

authRouter.delete('/',authAccessToken, async(req,res)=>{
    try {
        let user = await User.findById(req.userId)
        if(user.withdraw==true) return res.status(400).send({err:`${await user.username}는 이미 탈퇴되었습니다.`})
        user.withdraw = true
        await user.save()

        return res.status(200).send({msg:` [${user.username}]가 탈퇴되었습니다.`})
    } catch (err) {
        console.log(err)
        return res.status(403).send({err:"탈퇴 처리중 에러가 발생했습니다."})
    }
})

module.exports =  authRouter 
module.exports.authAccessToken = authAccessToken