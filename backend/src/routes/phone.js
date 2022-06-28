const { Router } = require('express')
const phoneRouter = Router()
const mongoose = require('mongoose')
const { isValidObjectId } = require('mongoose')
const { Phone } = require('../models')

const { send } = require('../sms')

phoneRouter.post('/', async (req, res) => {
    try {
        const { phoneNumber } = req.body
        if(typeof phoneNumber !== 'string') return res.status(400).send({ err: "핸드폰 번호를 입력해주세요." })
        
        const verificationCode = Math.floor(Math.random()*1000000).toString().padStart(6, '0')
        
        const phone = new Phone({ phoneNumber, verificationCode })
        await phone.save()

        phone.verificationCode = undefined

        // 문자 발송
        send(phoneNumber.replace(/-/gi, ''), verificationCode)
            .then(res => console.log(res))
            .catch(err => console.log(err))

        return res.status(201).send({ phone })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})

phoneRouter.post('/check', async (req, res) => {
    try {
        const { phoneId, verificationCode } = req.body

        if(!isValidObjectId(phoneId)) return res.status(400).send({ err: "phoneId가 유효하지 않습니다." })
        if(typeof verificationCode !== 'string') return res.status(400).send({ err: "인증번호를 입력해주세요" })

        const phone = await Phone.findById(phoneId)
        if(!phone) res.status(400).send({ err: "인증정보가 없습니다." })

        if(phone.verificationCode !== verificationCode) return res.status(400).send({ err: "인증번호가 일치하지 않습니다." })

        const nowDate = new Date()
        const phoneDate = new Date(phone.createdAt)
        const minuteDiff = (nowDate.getTime() - phoneDate.getTime()) / (1000*60)
        if(minuteDiff > 5) return res.status(400).send({ err: "인증기한이 만료되었습니다." })

        return res.status(200).send({ message: 'success', phoneNumber: phone.phoneNumber })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})

module.exports = phoneRouter