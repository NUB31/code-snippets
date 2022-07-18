//imports
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
//mysql config

let port = 3306;

if (process.env.MYSQL_PORT) {
  port = parseInt(process.env.MYSQL_PORT);
}

let pool = await mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: port,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "devDatabase",
});

//gets connection
let con = await pool.getConnection();
console.log("Database connected successfully");
con.release();

export default pool;
