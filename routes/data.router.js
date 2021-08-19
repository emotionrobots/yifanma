const express = require('express')
const router = express.Router()

const dataService = require('../services/data.service')

router.post('/', dataService.getData)

module.exports = router