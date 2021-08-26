const express = require('express')

module.exports = {
    getData: (req, res) => {

        // var got = req.body.ding
        // console.log(got)

        const data = {
            'Number of People': 10,
            'Time': '3:00 PM',
        }
        const data1 = 'Hunter x Hunter'

        // return res.status(200).json({data: data})
        return res.status(200).send(data1)
    }
}