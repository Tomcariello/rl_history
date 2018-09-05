//Make the connection to the database and export to be used by Sequelize

var mysql = require('mysql');
var connection;

//If in production environment, create connection based on the environment
if (process.env.JAWSDB_URL) {
	connection = mysql.createConnection(process.env.JAWSDB_URL);
} else { //use local credentials
  connection = mysql.createConnection({
    port: 3306,
  	host: 'localhost',
  	user: 'root',
   	password: process.env.localpassword,
   	database: 'rl_history'
   });
}

 connection.connect(function (err) {
 	if (err) {
 		console.error('error connecting: ' + err.stack);
 		return;
 	}
 	console.log('connected as id ' + connection.threadId);
});

module.exports = connection;