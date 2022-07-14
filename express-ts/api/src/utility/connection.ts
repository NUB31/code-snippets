//imports
var mysql = require("mysql2");
require("dotenv").config();

//mysql config
var pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "devDatabase",
});

//gets connection
pool.getConnection((err: any, connection: any) => {
  if (err) throw err;
  console.log("Database connected successfully");
  connection.release();
});

//export connection to use in index.js
module.exports = pool;
