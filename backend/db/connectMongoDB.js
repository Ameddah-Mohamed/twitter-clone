import mongoose from "mongoose";


const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected To "${conn.connection.host}"`)

    } catch (error) {
        console.log("Error Connecting To The DataBase", error.message);
        process.exit(1);
    }
}

export default connectMongoDB;