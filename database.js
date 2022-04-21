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
  //TODO: Prone to sql injection
  db.query("SELECT id, date, count FROM entry_log WHERE camera_id=" + camera_id.toString(), callback)
}

// Calculates people in room for the current day
function getCurrentPeopleInRoomToday(camera_id, callback, err_handler){
  db.query("select count \
  from entry_log \
  where day(date) = day(NOW()) and camera_id = ?;",[
    camera_id
  ], (error, results) => {
    if(error) {
      err_handler(error)
    } else {
      callback(results)
    }
  });
}

// Calculates people in room for the current day
function getCurrentPeopleInRoomCurrentHour(camera_id, callback, err_handler){
  db.query("select count \
  from entry_log \
  where day(date) = day(NOW()) and \
  hour(date) = hour(now()) and \
  camera_id = 1;",[
    camera_id
  ], (error, results) => {
    if(error) {
      err_handler(error)
    } else {
      callback(results)
    }
  });
}

function addCameraHistory(camera_id, change) {
  db.query("INSERT INTO `peoplecounter`.`entry_log` (`camera_id`, `date`, `count`) VALUES (?, NOW(), ?);",
  [
    camera_id,
    change
  ], (error, results) => {})
}

const USER_ASSOC = `
SELECT memberships.org_id, 
		organizations.org_name, 
		rooms.room_id, 
		rooms.location, 
		rooms.name as \`room_name\`, 
		cameras.camera_id, 
		cameras.device_name 
FROM memberships 
INNER JOIN organizations ON memberships.org_id = organizations.org_id
LEFT JOIN rooms ON memberships.org_id = rooms.org_id
LEFT JOIN cameras ON cameras.room_id = rooms.room_id
WHERE memberships.member_id = ?;
`

function getUserAssociation(user_id, callback, err_handler) {
  db.query(USER_ASSOC, [user_id], (error, results) => {
    if(error) {
      err_handler(error)
    } else {
      callback(results)
    }
  });
}

module.exports.initialize_db=initialize_db
module.exports.get_entry_log=get_entry_log
module.exports.getCurrentPeopleInRoomToday=getCurrentPeopleInRoomToday
module.exports.getCurrentPeopleInRoomCurrentHour=getCurrentPeopleInRoomCurrentHour
module.exports.addCameraHistory=addCameraHistory
module.exports.getUserAssociation=getUserAssociation