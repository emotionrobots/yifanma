const express = require('express')
const app = express()
const data = require('./routes/data.router')

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use('/data', data)

module.exports = app