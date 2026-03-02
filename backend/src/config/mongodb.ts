import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB Atlas...");

        await mongoose.connect(process.env.MONGO_URI as string);

        console.log("MongoDB Atlas Connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};