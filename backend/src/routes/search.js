const { Router } = require('express')
const searchRouter = Router()
const mongoose = require('mongoose')
const { isValidObjectId } = require('mongoose')
const { Collection,Item } = require('../models')
const { authAccessToken } = require('./auth')

async function searchItem(keyword, page, res){
    try {
        let chk = new Set()
        let result=[]
        for(let i=0;i<keyword.length;i++){
            const search = await Item.find({title: {$regex:keyword[i]}}).skip((page-1)*18).limit(18)
            for(let i=0;i<search.length;i++){
                if(chk.has(JSON.stringify(search[i]._id)))continue
                chk.add(JSON.stringify(search[i]._id))
                result.push(search[i])
            }
        }
        return [...result]
    } catch (err) {
        console.log(err)
        return res.status(500).send({err:err.message})
    }   
}

async function searchCollection(keyword, res){
    try {
        let chk=new Set()
        let result = []
        for(let i=0;i<keyword.length;i++){    
            let search = await Collection.find({title: {$regex:keyword[i]}})
            for(let i=0;i<search.length;i++){
                if(chk.has(JSON.stringify(search[i]._id)))continue
                chk.add(JSON.stringify(search[i]._id))
                result.push(search[i])
            }
            search = await Collection.find({description:{$regex:keyword[i]}})
            for(let i=0;i<search.length;i++){
                if(chk.has(JSON.stringify(search[i]._id)))continue
                chk.add(JSON.stringify(search[i]._id))
                result.push(search[i])
            }
        }
        console.log(result)
        return [...result]
    } catch (err) {
        console.log(err)
        return res.status(500).send({err:err.message})
        
    }
}

searchRouter.post('/', authAccessToken, async (req, res) => {
    try {
        let {keyword} = req.body        
        let { page=1 } = req.query
        page = parseInt(page)
        keyword = keyword.split(" ");
        const [items,collections] = await Promise.all([
            searchItem(keyword, page, res),
            searchCollection(keyword, res)
        ])
        
        return res.status(200).send({ items, collections, page })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ err: error.message })
    }
})

module.exports =  searchRouter