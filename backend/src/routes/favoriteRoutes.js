const express = require('express')
const { listFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')

const router = express.Router()

router.use(authenticate, authorize('DRIVER'))

router.get('/', listFavorites)
router.post('/:parkingId', addFavorite)
router.delete('/:parkingId', removeFavorite)

module.exports = router
