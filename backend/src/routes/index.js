const router = require('express').Router()

router.use('/auth', require('./auth'))
router.use('/item', require('./item'))
router.use('/collection', require('./collection'))
router.use('/follow', require('./follow'))
router.use('/vote', require('./vote'))
router.use('/phone', require('./phone'))
router.use('/profile',require('./profile'))
router.use('/like', require('./like'))
router.use('/search', require('./search'))
router.use('/recommend', require('./recommend'))
router.use('/event',require('./event'))
module.exports = router
