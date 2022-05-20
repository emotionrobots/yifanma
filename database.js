var express = require("express");
var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'peoplecounterdatabase.c8jzelmvv4ps.us-east-2.rds.amazonaws.com',
  port: '3306',
  user: 'admin',
  password: 'Emotioneering123',
  database: 'peoplecounter',
  multipleStatements: true
});

var app = express();

function initialize_db() {
  //TODO: add callback but prob unnecesary
  db.connect(function (err) {
    if (!err) {
      console.log("Database is connected ... ");
    } else {
      console.log("Error connecting database ... ");
    }
  });
}

function get_entry_log(camera_id, callback) {
  //TODO: Prone to sql injection
  db.query("SELECT id, date, count FROM entry_log WHERE camera_id=" + camera_id.toString(), callback)
}

// Calculates people in room for the current day
function getCurrentPeopleInRoom(camera_id, callback, err_handler) {
  db.query("SELECT cameras.camera_id, entry_log.count \
  FROM cameras \
  INNER JOIN entry_log ON cameras.camera_id = entry_log.camera_id \
  WHERE cameras.room_id = ?", [
    camera_id
  ], (error, results) => {
    if (error) {
      err_handler(error)
    } else {
      callback(results)
    }
  });
}

// Calculates people in room for the current day
/*
A way to improve this method is to store a room count in the database (this could be stored in the camera table). 
The room count is updated every day or week andis used to calculate the number of people in the room relative to
the current day so you won't overload the server with a million entries if it comes to that.
 */
function getCurrentPeopleInRoomToday(camera_id, callback, err_handler) {
  db.query("select count \
  from entry_log \
  where day(date) = day(NOW()) and camera_id = ?;", [
    camera_id
  ], (error, results) => {
    if (error) {
      err_handler(error)
    } else {
      callback(results)
    }
  });
}

// Calculates people in room for the current day
function getCurrentPeopleInRoomCurrentHour(camera_id, callback, err_handler) {
  db.query("select count \
  from entry_log \
  where day(date) = day(NOW()) and \
  hour(date) = hour(now()) and \
  camera_id = 1;", [
    camera_id
  ], (error, results) => {
    if (error) {
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
    ], (error, results) => { })
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
LEFT JOIN rooms ON IF(memberships.room_id=-1,memberships.org_id = rooms.org_id,memberships.room_id=rooms.room_id and memberships.org_id = rooms.org_id)
LEFT JOIN cameras ON IF(memberships.room_id=-1,cameras.room_id = rooms.room_id,cameras.room_id = memberships.room_id)
WHERE memberships.member_id = ?;
`

function getUserAssociation(user_id, callback, err_handler) {
  db.query(USER_ASSOC, [user_id], (error, results) => {
    if (error) {
      err_handler(error)
    } else {
      callback(results)
    }
  });
}

function addUserIfNotExist(username, callback) {
  db.query("INSERT INTO users (full_name, created_at) \
    SELECT * FROM (SELECT ? AS full_name, NOW() AS created_at) AS temp \
    WHERE NOT EXISTS ( \
        SELECT full_name FROM users WHERE full_name = ? \
    ) LIMIT 1; \
    SELECT user_id from users WHERE full_name = ?;", Array(3).fill(username), (error, results) => {
      if (error) {
        callback({error: 1, message: error})
      } else {
        callback({error: 0, user_id: results[1][0].user_id})
      }
    });
}

function getAllEntriesWithin(start, end, room_id, callback){
  db.query(`
    SELECT entry_log.date, entry_log.count
    FROM cameras
    INNER JOIN entry_log ON cameras.camera_id = entry_log.camera_id AND entry_log.date BETWEEN ? AND ?
    WHERE cameras.room_id = ?
    ORDER BY entry_log.date ASC
  `, [start, end, room_id], (error, results) => {
      if (error) {
        callback({error: 1, message: error})
      } else {
        callback(results)
      }
    });
}

function insertEntryLogs(values, callback){
  db.query(`
  INSERT INTO entry_log (camera_id, date, count) VALUES?`, [values], (err) => {
    if (err) callback(err);
    else callback({status: 0})
  })
}

module.exports.initialize_db = initialize_db
module.exports.get_entry_log = get_entry_log
module.exports.getCurrentPeopleInRoom = getCurrentPeopleInRoom
module.exports.getCurrentPeopleInRoomToday = getCurrentPeopleInRoomToday
module.exports.getCurrentPeopleInRoomCurrentHour = getCurrentPeopleInRoomCurrentHour
module.exports.addCameraHistory = addCameraHistory
module.exports.getUserAssociation = getUserAssociation
module.exports.addUserIfNotExist = addUserIfNotExist
module.exports.getAllEntriesWithin = getAllEntriesWithin
module.exports.insertEntryLogs = insertEntryLogs
