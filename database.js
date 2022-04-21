var express    = require("express");
var mysql      = require('mysql');
var db = mysql.createConnection({
  host     : 'peoplecounterdatabase.c8jzelmvv4ps.us-east-2.rds.amazonaws.com',
 port      :  '3306',
  user     : 'admin',
  password : 'Emotioneering123',
  database : 'peoplecounter',
});

var app = express();

function initialize_db(){
  //TODO: add callback but prob unnecesary
  db.connect(function(err){
    if(!err) {
        console.log("Database is connected ... ");   
    } else {
        console.log("Error connecting database ... ");    
    }
  });
}

function get_entry_log(camera_id, callback){
  db.query("SELECT id, date, count FROM entry_log WHERE camera_id=" + camera_id.toString(), callback)
}

module.exports.initialize_db=initialize_db
module.exports.get_entry_log=get_entry_log