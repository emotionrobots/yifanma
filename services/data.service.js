const express = require('express')

module.exports = {
    getData: (req, res) => {

        var got = req.JSON
        // var str = JSON.stringify(got, null, 2); // spacing level = 2
        // console.log("bruh")
        var jsonString = got;
        var jsonPretty = JSON.stringify(got,null,2);
        console.log(jsonPretty)
        console.log(got)

        const data = {
            'Number of People': 10,
            'Time': '3:00 PM',
        }

        return res.status(200).json({data: data})
    }
}