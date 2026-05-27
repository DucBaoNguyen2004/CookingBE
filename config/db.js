import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:process.env.DATABASE_URL ?{rejectUnauthorized:false}:false
});

pool.on("connect",()=>{
    console.log("Connected to database");
}).on("error",(err)=>{
    console.log("Error connecting to database",err);
});

export default {
    query: (text, params) => pool.query(text, params),pool
};