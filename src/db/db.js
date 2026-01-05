import { MongoClient } from "mongodb";


const connectDB = async () => {
    try {
        const client = await new MongoClient(process.env.MONGO_URI).connect();
        console.log("Connected to MongoDB");
        return client.db(process.env.DB_NAME);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export default connectDB;