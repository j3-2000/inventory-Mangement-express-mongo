import mongoose from 'mongoose'
import dotenv from 'dotenv';
dotenv.config();
let Url_Connect = process.env.URL_DB

mongoose.connect(Url_Connect)

const db = mongoose.connection

db.on('error', console.error.bind(console, 'mongodb error'))
db.once('open', () => {
    console.log("Connected to database")
})

export default db;
