import mongoose from "mongoose";
import { config } from "..";

export async function connect() {
    return await mongoose.connect(config.MONGO_URI).then((conn) => {
        if(conn) {
            console.log("Connected to MongoDB.");
            return conn;
        } else {
            console.log("Error connecting to MongoDB.");
        }
        return undefined;
    }).catch((err) => {
        console.log("Error connecting to MongoDB:", err);
        return undefined;
    });
}