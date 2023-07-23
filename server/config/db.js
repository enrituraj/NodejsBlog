const mongoose = require('mongoose');
const connectDb = async() =>{
    try {
        mongoose.set('strictQuery',false);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        // show the database connection
        //console.log(`Database connected ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDb;