require('dotenv').config();
const mongoose =require("mongoose")
const mongoURI=process.env.DATABASE_URL
console.log(mongoURI)
console.log("hello")
const connectToMongo=async ()=>{
    await mongoose.connect(mongoURI)
    console.log("Connected to Mongo Succesfully:")
}

module.exports=connectToMongo;