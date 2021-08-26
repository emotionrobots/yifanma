const express = require('express')
const router = express.Router()

const dataService = require('../services/data.service')

router.get('/', dataService.getData)

module.exports = router